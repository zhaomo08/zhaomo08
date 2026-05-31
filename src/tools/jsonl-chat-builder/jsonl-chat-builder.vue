<script setup lang="ts">
import { formatNumber } from '../llm-shared/calculators';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.jsonl-chat-builder.${key}`, fallback);

const model = ref('gpt-4o-mini');
const temperature = ref(0.2);
const systemPrompt = ref('You are a concise assistant.');
const userInputs = ref(`Summarize the latest release notes in 5 bullet points.
Rewrite this message to be polite and direct.
Extract action items from this meeting note.`);

const prompts = computed(() =>
  userInputs.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean),
);

const jsonlOutput = computed(() =>
  prompts.value
    .map((prompt, index) => {
      const body: Record<string, unknown> = {
        model: model.value,
        temperature: temperature.value,
        messages: [
          ...(systemPrompt.value.trim() ? [{ role: 'system', content: systemPrompt.value.trim() }] : []),
          { role: 'user', content: prompt },
        ],
      };

      return JSON.stringify({
        custom_id: `req-${index + 1}`,
        method: 'POST',
        url: '/v1/chat/completions',
        body,
      });
    })
    .join('\n'),
);

const estimatedChars = computed(() => jsonlOutput.value.length);

const { copy: copyJsonl } = useCopy({
  source: jsonlOutput,
  text: tt('messages.copied', 'JSONL copied to clipboard'),
});
</script>

<template>
  <div class="layout">
    <c-card>
      <div class="eyebrow">
        {{ tt('sections.config', 'Batch config') }}
      </div>
      <n-grid :cols="1" :x-gap="12" :y-gap="8" responsive="screen">
        <n-gi>
          <n-form-item :label="tt('fields.model', 'Model')">
            <c-input-text v-model:value="model" raw-text />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="tt('fields.temperature', 'Temperature')">
            <n-input-number v-model:value="temperature" :min="0" :max="2" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-form-item :label="tt('fields.systemPrompt', 'System prompt')">
        <c-input-text v-model:value="systemPrompt" multiline rows="4" raw-text />
      </n-form-item>
    </c-card>

    <c-card>
      <div class="eyebrow">
        {{ tt('sections.userInputs', 'User prompts (one per line)') }}
      </div>
      <c-input-text
        v-model:value="userInputs"
        multiline
        rows="11"
        raw-text
        :placeholder="tt('placeholders.userInputs', 'One user prompt per line...')"
      />
    </c-card>

    <c-card class="full">
      <div class="eyebrow">
        {{ tt('sections.output', 'JSONL output') }}
      </div>

      <div class="summary">
        <div>
          <span>{{ tt('metrics.requests', 'Requests') }}</span>
          <strong>{{ formatNumber(prompts.length) }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.characters', 'Characters') }}</span>
          <strong>{{ formatNumber(estimatedChars) }}</strong>
        </div>
      </div>

      <c-input-text
        :value="jsonlOutput"
        multiline
        rows="12"
        raw-text
        readonly
      />

      <div class="actions">
        <c-button :disabled="!jsonlOutput" @click="copyJsonl()">
          {{ tt('actions.copyJsonl', 'Copy JSONL') }}
        </c-button>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.full {
  grid-column: 1 / -1;
}

.eyebrow {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.summary > div {
  border: 1px solid rgb(148 163 184 / 0.35);
  border-radius: 8px;
  padding: 12px;
}

.summary span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.summary strong {
  font-size: 20px;
}

.actions {
  margin-top: 12px;
}

@media (max-width: 900px) {
  .layout,
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>

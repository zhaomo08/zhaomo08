<script setup lang="ts">
import { useCopy } from '@/composable/copy';

const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.prompt-variable-extractor.${key}`, fallback);

const template = ref(`Write a {{tone}} product launch email for {{product_name}}.
Audience: {{audience.segment}}
Keep it under {{max_words}} words.`);

const variables = computed(() => {
  const pattern = /{{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*}}/g;
  const found = new Set<string>();
  let match: RegExpExecArray | null = null;

  do {
    match = pattern.exec(template.value);
    if (match?.[1]) {
      found.add(match[1]);
    }
  } while (match);

  return [...found].sort((a, b) => a.localeCompare(b));
});

const jsonExample = computed(() => {
  const obj = Object.fromEntries(variables.value.map(variable => [variable, '']));
  return JSON.stringify(obj, null, 2);
});

const variablesPlainText = computed(() => variables.value.join('\n'));

const { copy: copyVariables } = useCopy({
  source: variablesPlainText,
  text: tt('messages.variablesCopied', 'Variables copied to the clipboard'),
});

const { copy: copyJson } = useCopy({
  source: jsonExample,
  text: tt('messages.jsonCopied', 'JSON copied to the clipboard'),
});
</script>

<template>
  <div class="layout">
    <c-card>
      <div class="eyebrow">
        {{ tt('sections.input', 'Prompt template') }}
      </div>
      <c-input-text
        v-model:value="template"
        multiline
        rows="10"
        raw-text
        :placeholder="tt('placeholders.template', 'Paste prompt template text with double-curly placeholders...')"
      />
    </c-card>

    <c-card>
      <div class="eyebrow">
        {{ tt('sections.variables', 'Detected variables') }}
      </div>

      <div v-if="variables.length === 0" class="empty">
        {{ tt('messages.noVariables', 'No double-curly placeholders found.') }}
      </div>

      <div v-else class="chips">
        <n-tag v-for="variable in variables" :key="variable" type="success" round>
          {{ variable }}
        </n-tag>
      </div>

      <div class="actions">
        <c-button :disabled="variables.length === 0" @click="copyVariables()">
          {{ tt('actions.copyVariables', 'Copy variables') }}
        </c-button>
      </div>
    </c-card>

    <c-card class="full">
      <div class="eyebrow">
        {{ tt('sections.json', 'JSON example payload') }}
      </div>

      <c-input-text
        :value="jsonExample"
        multiline
        rows="8"
        raw-text
        readonly
      />

      <div class="actions">
        <c-button :disabled="variables.length === 0" @click="copyJson()">
          {{ tt('actions.copyJson', 'Copy JSON') }}
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

.empty {
  color: #64748b;
  font-size: 14px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.actions {
  margin-top: 12px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { formatNumber } from '../llm-shared/calculators';

const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.json-output-key-checker.${key}`, fallback);

const requiredKeysInput = ref(`title
summary
priority
owner
action_items`);
const outputJson = ref(`{
  "title": "Release readiness review",
  "summary": "QA blockers cleared, docs still pending.",
  "priority": "high",
  "owner": "ops-team",
  "next_sync": "2026-06-02"
}`);

const requiredKeys = computed(() =>
  requiredKeysInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean),
);

const parsedOutput = computed(() => {
  try {
    const parsed = JSON.parse(outputJson.value);
    const isObject = parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);

    return {
      isValid: isObject,
      value: isObject ? parsed as Record<string, unknown> : {},
      error: isObject ? '' : tt('messages.notObject', 'JSON value must be an object.'),
    };
  }
  catch (error) {
    return {
      isValid: false,
      value: {},
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

const missingKeys = computed(() => {
  if (!parsedOutput.value.isValid) {
    return requiredKeys.value;
  }

  return requiredKeys.value.filter(key => !(key in parsedOutput.value.value));
});

const extraKeys = computed(() => {
  if (!parsedOutput.value.isValid) {
    return [] as string[];
  }

  const required = new Set(requiredKeys.value);
  return Object.keys(parsedOutput.value.value).filter(key => !required.has(key));
});

const status = computed(() => {
  if (!parsedOutput.value.isValid) {
    return tt('status.invalidJson', 'Invalid JSON');
  }

  if (missingKeys.value.length === 0) {
    return tt('status.passed', 'Passed');
  }

  return tt('status.failed', 'Missing required keys');
});
</script>

<template>
  <div class="layout">
    <c-card>
      <div class="eyebrow">
        {{ tt('sections.requiredKeys', 'Required keys (one per line)') }}
      </div>
      <c-input-text
        v-model:value="requiredKeysInput"
        multiline
        rows="10"
        raw-text
      />
    </c-card>

    <c-card>
      <div class="eyebrow">
        {{ tt('sections.outputJson', 'Model JSON output') }}
      </div>
      <c-input-text
        v-model:value="outputJson"
        multiline
        rows="10"
        raw-text
      />
      <n-alert v-if="!parsedOutput.isValid" type="error" mt-10px>
        {{ tt('messages.invalidJson', 'Invalid JSON:') }} {{ parsedOutput.error }}
      </n-alert>
    </c-card>

    <c-card class="full">
      <div class="eyebrow">
        {{ tt('sections.result', 'Validation result') }}
      </div>

      <div class="summary">
        <div>
          <span>{{ tt('metrics.status', 'Status') }}</span>
          <strong :class="{ ok: missingKeys.length === 0 && parsedOutput.isValid, danger: missingKeys.length > 0 || !parsedOutput.isValid }">{{ status }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.requiredCount', 'Required key count') }}</span>
          <strong>{{ formatNumber(requiredKeys.length) }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.missingCount', 'Missing key count') }}</span>
          <strong class="danger">{{ formatNumber(missingKeys.length) }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.extraCount', 'Extra key count') }}</span>
          <strong>{{ formatNumber(extraKeys.length) }}</strong>
        </div>
      </div>

      <n-grid :cols="1" :x-gap="12" :y-gap="12" responsive="screen">
        <n-gi>
          <div class="list-title">
            {{ tt('sections.missingKeys', 'Missing keys') }}
          </div>
          <div class="chips">
            <n-tag v-for="key in missingKeys" :key="key" type="error" round>
              {{ key }}
            </n-tag>
            <span v-if="missingKeys.length === 0" class="empty">{{ tt('messages.none', 'None') }}</span>
          </div>
        </n-gi>

        <n-gi>
          <div class="list-title">
            {{ tt('sections.extraKeys', 'Extra keys') }}
          </div>
          <div class="chips">
            <n-tag v-for="key in extraKeys" :key="key" type="warning" round>
              {{ key }}
            </n-tag>
            <span v-if="extraKeys.length === 0" class="empty">{{ tt('messages.none', 'None') }}</span>
          </div>
        </n-gi>
      </n-grid>
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

.eyebrow,
.list-title {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  font-size: 18px;
}

.ok {
  color: #16a34a;
}

.danger {
  color: #dc2626;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty {
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 900px) {
  .layout,
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>

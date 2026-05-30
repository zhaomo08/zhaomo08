<script setup lang="ts">
import { useCopy } from '@/composable/copy';

const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.prompt-template-renderer.${key}`, fallback);

const template = ref(`You are an assistant for {{company.name}}.
Answer in {{style.tone}} tone.
Target audience: {{audience}}.`);
const variablesJson = ref(`{
  "company": { "name": "Acme" },
  "style": { "tone": "friendly" },
  "audience": "new users"
}`);

function getByPath(data: unknown, path: string): unknown {
  return path.split('.').reduce((current, part) => {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, data as unknown);
}

const parsedVariables = computed(() => {
  try {
    const parsed = JSON.parse(variablesJson.value);
    return { isValid: true as const, value: parsed, error: '' };
  }
  catch (error) {
    return {
      isValid: false as const,
      value: {},
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

const matches = computed(() => [...template.value.matchAll(/{{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*}}/g)]);

const placeholders = computed(() => {
  const names = matches.value.map(match => match[1]).filter(Boolean) as string[];
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
});

const unresolvedKeys = computed(() => {
  if (!parsedVariables.value.isValid) {
    return placeholders.value;
  }

  return placeholders.value.filter(key => typeof getByPath(parsedVariables.value.value, key) === 'undefined');
});

const renderedPrompt = computed(() => {
  if (!parsedVariables.value.isValid) {
    return '';
  }

  return template.value.replace(/{{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*}}/g, (_full, key: string) => {
    const value = getByPath(parsedVariables.value.value, key);

    if (typeof value === 'undefined') {
      return `{{${key}}}`;
    }

    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  });
});

const { copy: copyRendered } = useCopy({
  source: renderedPrompt,
  text: tt('messages.renderedCopied', 'Rendered prompt copied to clipboard'),
});
</script>

<template>
  <div class="layout">
    <c-card>
      <div class="eyebrow">
        {{ tt('sections.template', 'Prompt template') }}
      </div>
      <c-input-text
        v-model:value="template"
        multiline
        rows="8"
        raw-text
        :placeholder="tt('placeholders.template', 'Use {{path.to.value}} placeholders in your template...')"
      />
    </c-card>

    <c-card>
      <div class="eyebrow">
        {{ tt('sections.variables', 'Variables JSON') }}
      </div>
      <c-input-text
        v-model:value="variablesJson"
        multiline
        rows="8"
        raw-text
        :placeholder="tt('placeholders.variablesJson', 'Provide a JSON object for placeholder values...')"
      />
      <n-alert v-if="!parsedVariables.isValid" type="error" mt-10px>
        {{ tt('messages.invalidJson', 'Invalid JSON:') }} {{ parsedVariables.error }}
      </n-alert>
    </c-card>

    <c-card class="full">
      <div class="eyebrow">
        {{ tt('sections.result', 'Rendered result') }}
      </div>

      <div class="summary">
        <div>
          <span>{{ tt('metrics.detected', 'Detected placeholders') }}</span>
          <strong>{{ placeholders.length }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.unresolved', 'Unresolved placeholders') }}</span>
          <strong :class="{ danger: unresolvedKeys.length > 0 }">{{ unresolvedKeys.length }}</strong>
        </div>
      </div>

      <div v-if="unresolvedKeys.length > 0" class="chips">
        <n-tag v-for="key in unresolvedKeys" :key="key" type="warning" round>
          {{ key }}
        </n-tag>
      </div>

      <c-input-text
        :value="renderedPrompt"
        multiline
        rows="8"
        raw-text
        readonly
      />

      <div class="actions">
        <c-button :disabled="!renderedPrompt" @click="copyRendered()">
          {{ tt('actions.copyRendered', 'Copy rendered prompt') }}
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

.danger {
  color: #dc2626;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
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

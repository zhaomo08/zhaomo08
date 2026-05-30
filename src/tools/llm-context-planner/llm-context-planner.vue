<script setup lang="ts">
import { formatNumber } from '../llm-shared/calculators';

const contextWindow = ref(128000);
const systemTokens = ref(1200);
const toolSchemaTokens = ref(6000);
const historyTokens = ref(18000);
const ragChunkTokens = ref(900);
const ragChunks = ref(30);
const userTokens = ref(1200);
const outputReserve = ref(4000);
const safetyPercent = ref(10);
const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.llm-context-planner.${key}`, fallback);

const ragTokens = computed(() => ragChunkTokens.value * ragChunks.value);
const safetyReserve = computed(() => contextWindow.value * safetyPercent.value / 100);
const usedTokens = computed(() =>
  systemTokens.value + toolSchemaTokens.value + historyTokens.value + ragTokens.value + userTokens.value + outputReserve.value + safetyReserve.value,
);
const remainingTokens = computed(() => contextWindow.value - usedTokens.value);
const usagePercent = computed(() => Math.min(100, Math.max(0, usedTokens.value / contextWindow.value * 100)));
const maxChunks = computed(() => Math.max(0, Math.floor((contextWindow.value - usedTokens.value + ragTokens.value) / Math.max(1, ragChunkTokens.value))));
const status = computed(() => {
  if (remainingTokens.value < 0) {
    return tt('status.overBudget', 'Over budget');
  }
  if (usagePercent.value > 85) {
    return tt('status.tight', 'Tight');
  }
  return tt('status.healthy', 'Healthy');
});
</script>

<template>
  <div class="planner">
    <c-card class="panel inputs">
      <div class="eyebrow">
        {{ tt('sections.contextBudget', 'Context budget') }}
      </div>
      <n-grid :cols="1" :x-gap="16" :y-gap="8" responsive="screen">
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.contextWindow', 'Context window')">
            <n-input-number v-model:value="contextWindow" :min="1000" :step="1000" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.systemPrompt', 'System prompt')">
            <n-input-number v-model:value="systemTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.toolSchemas', 'Tool schemas')">
            <n-input-number v-model:value="toolSchemaTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.conversationHistory', 'Conversation history')">
            <n-input-number v-model:value="historyTokens" :min="0" :step="1000" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.ragChunkTokens', 'RAG chunk tokens')">
            <n-input-number v-model:value="ragChunkTokens" :min="1" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.ragChunks', 'RAG chunks')">
            <n-input-number v-model:value="ragChunks" :min="0" :step="1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.userTurn', 'User turn')">
            <n-input-number v-model:value="userTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.outputReserve', 'Output reserve')">
            <n-input-number v-model:value="outputReserve" :min="0" :step="500" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:12">
          <n-form-item :label="`${tt('fields.safetyReserve', 'Safety reserve')} (${safetyPercent}%)`">
            <n-slider v-model:value="safetyPercent" :min="0" :max="30" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </c-card>

    <c-card class="panel summary">
      <div class="eyebrow">
        {{ tt('sections.fitCheck', 'Fit check') }}
      </div>
      <div class="hero-number" :class="{ danger: remainingTokens < 0 }">
        {{ status }}
      </div>
      <n-progress type="line" :percentage="usagePercent" :status="remainingTokens < 0 ? 'error' : 'success'" />
      <div class="metric-row">
        <span>{{ tt('metrics.used', 'Used') }}</span>
        <strong>{{ formatNumber(usedTokens) }}</strong>
      </div>
      <div class="metric-row">
        <span>{{ tt('metrics.remaining', 'Remaining') }}</span>
        <strong>{{ formatNumber(remainingTokens) }}</strong>
      </div>
      <div class="metric-row">
        <span>{{ tt('metrics.ragBudget', 'RAG budget') }}</span>
        <strong>{{ formatNumber(maxChunks) }} {{ tt('metrics.chunks', 'chunks') }}</strong>
      </div>
    </c-card>

    <c-card class="panel breakdown">
      <div class="eyebrow">
        {{ tt('sections.breakdown', 'Breakdown') }}
      </div>
      <div class="bar-list">
        <div>
          <span>{{ tt('breakdown.system', 'System') }}</span>
          <b :style="{ width: `${systemTokens / contextWindow * 100}%` }" />
          <strong>{{ formatNumber(systemTokens) }}</strong>
        </div>
        <div>
          <span>{{ tt('breakdown.tools', 'Tools') }}</span>
          <b :style="{ width: `${toolSchemaTokens / contextWindow * 100}%` }" />
          <strong>{{ formatNumber(toolSchemaTokens) }}</strong>
        </div>
        <div>
          <span>{{ tt('breakdown.history', 'History') }}</span>
          <b :style="{ width: `${historyTokens / contextWindow * 100}%` }" />
          <strong>{{ formatNumber(historyTokens) }}</strong>
        </div>
        <div>
          <span>{{ tt('breakdown.rag', 'RAG') }}</span>
          <b :style="{ width: `${ragTokens / contextWindow * 100}%` }" />
          <strong>{{ formatNumber(ragTokens) }}</strong>
        </div>
        <div>
          <span>{{ tt('breakdown.output', 'Output') }}</span>
          <b :style="{ width: `${outputReserve / contextWindow * 100}%` }" />
          <strong>{{ formatNumber(outputReserve) }}</strong>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.planner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
}

.breakdown {
  grid-column: 1 / -1;
}

.panel {
  border-left: 4px solid #f59e0b;
}

.eyebrow {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-number {
  font-size: 34px;
  font-weight: 800;
}

.danger {
  color: #dc2626;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 10px 0;
}

.bar-list {
  display: grid;
  gap: 10px;
}

.bar-list > div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 110px;
  align-items: center;
  gap: 12px;
}

.bar-list b {
  display: block;
  min-width: 2px;
  max-width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f59e0b;
}

.bar-list strong {
  text-align: right;
}

@media (max-width: 900px) {
  .planner,
  .bar-list > div {
    grid-template-columns: 1fr;
  }

  .bar-list strong {
    text-align: left;
  }
}
</style>

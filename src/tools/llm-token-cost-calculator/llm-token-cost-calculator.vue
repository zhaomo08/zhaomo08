<script setup lang="ts">
import { costForMillionTokens, estimateTokens, formatMoney, formatNumber } from '../llm-shared/calculators';

const prompt = ref(`You are a careful coding assistant.

Context:
- Keep answers concise.
- Prefer local, private computation.

Task:
Estimate this prompt before sending it to an LLM.`);
const expectedOutputTokens = ref(800);
const callsPerDay = ref(100);
const cachedInputPercent = ref(60);
const inputPrice = ref(1);
const cachedInputPrice = ref(0.1);
const outputPrice = ref(5);
const batchDiscountPercent = ref(0);
const contextWindow = ref(128000);
const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.llm-token-cost-calculator.${key}`, fallback);

const estimate = computed(() => estimateTokens(prompt.value));
const uncachedInputTokens = computed(() => estimate.value.tokens * (100 - cachedInputPercent.value) / 100);
const cachedInputTokens = computed(() => estimate.value.tokens * cachedInputPercent.value / 100);
const discountMultiplier = computed(() => 1 - batchDiscountPercent.value / 100);

const costPerCall = computed(() => (
  costForMillionTokens(uncachedInputTokens.value, inputPrice.value)
  + costForMillionTokens(cachedInputTokens.value, cachedInputPrice.value)
  + costForMillionTokens(expectedOutputTokens.value, outputPrice.value)
) * discountMultiplier.value);

const monthlyCost = computed(() => costPerCall.value * callsPerDay.value * 30);
const contextUsage = computed(() => Math.min(100, (estimate.value.tokens + expectedOutputTokens.value) / contextWindow.value * 100));
const remainingContext = computed(() => Math.max(0, contextWindow.value - estimate.value.tokens - expectedOutputTokens.value));
</script>

<template>
  <div class="llm-grid">
    <c-card class="panel main-panel">
      <div class="eyebrow">
        {{ tt('sections.promptPayload', 'Prompt payload') }}
      </div>
      <n-input
        v-model:value="prompt"
        type="textarea"
        :autosize="{ minRows: 14 }"
        :placeholder="tt('placeholders.prompt', 'Paste a prompt, system message, tool schema, or RAG context...')"
      />
    </c-card>

    <div class="side-stack">
      <c-card class="panel">
        <div class="eyebrow">
          {{ tt('sections.tokenEstimate', 'Token estimate') }}
        </div>
        <div class="metric-row">
          <span>{{ tt('metrics.inputTokens', 'Input tokens') }}</span>
          <strong>{{ formatNumber(estimate.tokens) }}</strong>
        </div>
        <div class="metric-row">
          <span>{{ tt('metrics.characters', 'Characters') }}</span>
          <strong>{{ formatNumber(estimate.characters) }}</strong>
        </div>
        <div class="metric-row">
          <span>{{ tt('metrics.words', 'Words') }}</span>
          <strong>{{ formatNumber(estimate.words) }}</strong>
        </div>
        <div class="metric-row">
          <span>{{ tt('metrics.cjkChars', 'CJK chars') }}</span>
          <strong>{{ formatNumber(estimate.cjkCharacters) }}</strong>
        </div>
      </c-card>

      <c-card class="panel">
        <div class="eyebrow">
          {{ tt('sections.costResult', 'Cost result') }}
        </div>
        <div class="hero-number">
          {{ formatMoney(costPerCall) }}
        </div>
        <div class="muted">
          {{ tt('metrics.perCall', 'per call') }}
        </div>
        <n-divider />
        <div class="metric-row">
          <span>{{ tt('metrics.runRate30d', '30 day run-rate') }}</span>
          <strong>{{ formatMoney(monthlyCost) }}</strong>
        </div>
        <div class="metric-row">
          <span>{{ tt('metrics.remainingContext', 'Remaining context') }}</span>
          <strong>{{ formatNumber(remainingContext) }}</strong>
        </div>
        <n-progress type="line" :percentage="contextUsage" :show-indicator="false" />
      </c-card>
    </div>

    <c-card class="panel controls">
      <n-grid :cols="1" :x-gap="16" :y-gap="8" responsive="screen" item-responsive>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.expectedOutputTokens', 'Expected output tokens')">
            <n-input-number v-model:value="expectedOutputTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.callsPerDay', 'Calls per day')">
            <n-input-number v-model:value="callsPerDay" :min="1" :step="10" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.contextWindow', 'Context window')">
            <n-input-number v-model:value="contextWindow" :min="1000" :step="1000" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="`${tt('fields.cachedInputHit', 'Cached input hit')} (${cachedInputPercent}%)`">
            <n-slider v-model:value="cachedInputPercent" :min="0" :max="100" :step="1" />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.inputPrice', 'Input $ / 1M tokens')">
            <n-input-number v-model:value="inputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.cachedInputPrice', 'Cached input $ / 1M')">
            <n-input-number v-model:value="cachedInputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.outputPrice', 'Output $ / 1M tokens')">
            <n-input-number v-model:value="outputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="`${tt('fields.batchDiscount', 'Batch discount')} (${batchDiscountPercent}%)`">
            <n-slider v-model:value="batchDiscountPercent" :min="0" :max="90" :step="5" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.llm-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}

.main-panel,
.controls {
  min-width: 0;
}

.controls {
  grid-column: 1 / -1;
}

.side-stack {
  display: grid;
  gap: 16px;
}

.panel {
  border-left: 4px solid #18a058;
}

.eyebrow {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 9px 0;
}

.metric-row strong {
  font-variant-numeric: tabular-nums;
}

.hero-number {
  font-size: 34px;
  font-weight: 800;
  line-height: 1.05;
}

.muted {
  color: #64748b;
}

@media (max-width: 900px) {
  .llm-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { costForMillionTokens, formatBytes, formatMoney, formatNumber } from '../llm-shared/calculators';

const { t } = useI18n();
const tt = (key: string, fallback: string) => t(`tools.kv-cache-calculator.${key}`, fallback);

const presets = computed(() => ([
  { label: tt('options.presets.custom', 'Custom transformer'), value: 'custom', layers: 32, kvHeads: 8, headDim: 128 },
  { label: tt('options.presets.llama8b', 'Llama-style 8B GQA'), value: 'llama8b', layers: 32, kvHeads: 8, headDim: 128 },
  { label: tt('options.presets.llama70b', 'Llama-style 70B GQA'), value: 'llama70b', layers: 80, kvHeads: 8, headDim: 128 },
  { label: tt('options.presets.dense32', 'Dense 32 heads x 128'), value: 'dense32', layers: 32, kvHeads: 32, headDim: 128 },
]));

const precisionOptions = computed(() => ([
  { label: tt('options.precision.fp16', 'FP16 / BF16 (2 bytes)'), value: 2 },
  { label: tt('options.precision.fp8', 'FP8 / INT8 (1 byte)'), value: 1 },
  { label: tt('options.precision.int4', 'INT4 / FP4 (0.5 byte)'), value: 0.5 },
]));

const preset = ref('llama8b');
const tokens = ref(128000);
const sequences = ref(1);
const layers = ref(32);
const kvHeads = ref(8);
const headDim = ref(128);
const precisionBytes = ref(2);

const requests = ref(1000);
const sharedPrefixTokens = ref(24000);
const variableTokens = ref(2000);
const outputTokens = ref(1000);
const cacheHitPercent = ref(75);
const inputPrice = ref(1);
const cachedInputPrice = ref(0.1);
const outputPrice = ref(5);

watch(preset, (value) => {
  const next = presets.value.find(item => item.value === value);
  if (!next) {
    return;
  }
  layers.value = next.layers;
  kvHeads.value = next.kvHeads;
  headDim.value = next.headDim;
}, { immediate: true });

const perTokenBytes = computed(() => layers.value * kvHeads.value * headDim.value * 2 * precisionBytes.value);
const kvCacheBytes = computed(() => perTokenBytes.value * tokens.value * sequences.value);
const maxTokensIn24GiB = computed(() => Math.floor(24 * 1024 ** 3 / Math.max(1, perTokenBytes.value * sequences.value)));

const noCacheTokens = computed(() => requests.value * (sharedPrefixTokens.value + variableTokens.value));
const cachedTokens = computed(() => Math.max(0, requests.value - 1) * sharedPrefixTokens.value * cacheHitPercent.value / 100);
const uncachedInputTokens = computed(() => noCacheTokens.value - cachedTokens.value);
const cacheCost = computed(() =>
  costForMillionTokens(uncachedInputTokens.value, inputPrice.value)
  + costForMillionTokens(cachedTokens.value, cachedInputPrice.value)
  + costForMillionTokens(requests.value * outputTokens.value, outputPrice.value),
);
const noCacheCost = computed(() =>
  costForMillionTokens(noCacheTokens.value, inputPrice.value)
  + costForMillionTokens(requests.value * outputTokens.value, outputPrice.value),
);
const savings = computed(() => Math.max(0, noCacheCost.value - cacheCost.value));
</script>

<template>
  <div class="kv-layout">
    <c-card class="panel">
      <div class="eyebrow">
        {{ tt('sections.kvMemory', 'KV memory') }}
      </div>
      <n-grid :cols="1" :x-gap="16" :y-gap="8" responsive="screen">
        <n-gi>
          <n-form-item :label="tt('fields.modelPreset', 'Model preset')">
            <c-select v-model:value="preset" :options="presets" w-full />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="tt('fields.tokensPerSequence', 'Tokens per sequence')">
            <n-input-number v-model:value="tokens" :min="1" :step="1024" w-full />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="tt('fields.concurrentSequences', 'Concurrent sequences')">
            <n-input-number v-model:value="sequences" :min="1" :step="1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="tt('fields.kvPrecision', 'KV precision')">
            <c-select v-model:value="precisionBytes" :options="precisionOptions" w-full />
          </n-form-item>
        </n-gi>
      </n-grid>

      <div class="triple">
        <n-form-item :label="tt('fields.layers', 'Layers')">
          <n-input-number v-model:value="layers" :min="1" w-full />
        </n-form-item>
        <n-form-item :label="tt('fields.kvHeads', 'KV heads')">
          <n-input-number v-model:value="kvHeads" :min="1" w-full />
        </n-form-item>
        <n-form-item :label="tt('fields.headDim', 'Head dim')">
          <n-input-number v-model:value="headDim" :min="1" w-full />
        </n-form-item>
      </div>
    </c-card>

    <c-card class="panel result-panel">
      <div class="eyebrow">
        {{ tt('sections.result', 'Result') }}
      </div>
      <div class="hero-number">
        {{ formatBytes(kvCacheBytes) }}
      </div>
      <div class="muted">
        {{ tt('metrics.totalKvCache', 'total KV cache') }}
      </div>
      <n-divider />
      <div class="metric-row">
        <span>{{ tt('metrics.perToken', 'Per token') }}</span>
        <strong>{{ formatBytes(perTokenBytes) }}</strong>
      </div>
      <div class="metric-row">
        <span>{{ tt('metrics.tokenBudget24', '24 GiB token budget') }}</span>
        <strong>{{ formatNumber(maxTokensIn24GiB) }}</strong>
      </div>
      <div class="formula">
        {{ tt('metrics.formula', 'layers x kv heads x head dim x K/V x precision x tokens x sequences') }}
      </div>
    </c-card>

    <c-card class="panel cache-panel">
      <div class="eyebrow">
        {{ tt('sections.cacheEconomics', 'Prefix cache hit economics') }}
      </div>
      <n-grid :cols="1" :x-gap="16" :y-gap="8" responsive="screen">
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.requests', 'Requests')">
            <n-input-number v-model:value="requests" :min="1" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.sharedPrefixTokens', 'Shared prefix tokens')">
            <n-input-number v-model:value="sharedPrefixTokens" :min="0" :step="1000" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.variableInputTokens', 'Variable input tokens')">
            <n-input-number v-model:value="variableTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:6">
          <n-form-item :label="tt('fields.outputTokens', 'Output tokens')">
            <n-input-number v-model:value="outputTokens" :min="0" :step="100" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:8">
          <n-form-item :label="`${tt('fields.cacheHit', 'Cache hit')} (${cacheHitPercent}%)`">
            <n-slider v-model:value="cacheHitPercent" :min="0" :max="100" />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:4">
          <n-form-item :label="tt('fields.inputPrice', 'Input $ / 1M')">
            <n-input-number v-model:value="inputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:4">
          <n-form-item :label="tt('fields.cachedPrice', 'Cached $ / 1M')">
            <n-input-number v-model:value="cachedInputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
        <n-gi span="1 m:4">
          <n-form-item :label="tt('fields.outputPrice', 'Output $ / 1M')">
            <n-input-number v-model:value="outputPrice" :min="0" :step="0.1" w-full />
          </n-form-item>
        </n-gi>
      </n-grid>

      <div class="result-strip">
        <div>
          <span>{{ tt('metrics.cachedTokens', 'Cached tokens') }}</span>
          <strong>{{ formatNumber(cachedTokens) }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.withCache', 'With cache') }}</span>
          <strong>{{ formatMoney(cacheCost) }}</strong>
        </div>
        <div>
          <span>{{ tt('metrics.savings', 'Savings') }}</span>
          <strong>{{ formatMoney(savings) }}</strong>
        </div>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
.kv-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 16px;
}

.panel {
  border-left: 4px solid #0ea5e9;
}

.cache-panel {
  grid-column: 1 / -1;
}

.triple,
.result-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
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
  line-height: 1.05;
}

.muted,
.formula {
  color: #64748b;
}

.formula {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 9px 0;
}

.result-strip {
  margin-top: 12px;
}

.result-strip > div {
  border: 1px solid rgb(148 163 184 / 0.35);
  border-radius: 8px;
  padding: 12px;
}

.result-strip span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.result-strip strong {
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .kv-layout,
  .triple,
  .result-strip {
    grid-template-columns: 1fr;
  }
}
</style>

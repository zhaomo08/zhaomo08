<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
const { t } = useI18n();
const isAiTool = computed(() => tool.value.category === t('tools.categories.ai', 'AI'));
</script>

<template>
  <router-link :to="tool.path" class="decoration-none">
    <c-card class="h-full transition transition-duration-0.5s !border-2px !hover:border-primary" :class="{ 'ai-tool-card': isAiTool }">
      <div v-if="isAiTool" class="ai-card-bar" />
      <div flex items-center justify-between>
        <n-icon
          size="40"
          :component="tool.icon"
          :class="isAiTool ? 'ai-tool-icon' : 'text-neutral-400 dark:text-neutral-600'"
        />

        <div flex items-center gap-8px>
          <div
            v-if="tool.isNew"
            class="rounded-full px-8px py-3px text-xs text-white dark:text-neutral-800"
            :style="{
              'background-color': theme.primaryColor,
            }"
          >
            {{ $t('toolCard.new') }}
          </div>

          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <div class="truncat my-5px text-lg text-black dark:text-white">
        {{ tool.name }}
      </div>

      <div class="line-clamp-2 text-neutral-500 dark:text-neutral-400">
        {{ tool.description }}
      </div>
    </c-card>
  </router-link>
</template>

<style scoped lang="less">
.ai-tool-card {
  position: relative;
  overflow: hidden;
}

.ai-card-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #63b3ed, #9a75ea);
  border-radius: 2px 0 0 2px;
}

.ai-tool-icon {
  color: #63b3ed;
}
</style>

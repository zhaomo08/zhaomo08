import { defineStore } from 'pinia';
import _ from 'lodash';
import Fuse from 'fuse.js';
import type { PaletteOption } from './command-palette.types';
import { useToolStore } from '@/tools/tools.store';
import { useStyleStore } from '@/stores/style.store';

import SunIcon from '~icons/mdi/white-balance-sunny';
import GithubIcon from '~icons/mdi/github';
import BugIcon from '~icons/mdi/bug-outline';
import DiceIcon from '~icons/mdi/dice-5';
import InfoIcon from '~icons/mdi/information-outline';

export const useCommandPaletteStore = defineStore('command-palette', () => {
  const toolStore = useToolStore();
  const styleStore = useStyleStore();
  const router = useRouter();
  const { t } = useI18n();
  const searchPrompt = ref('');

  const toolsOptions = computed<PaletteOption[]>(() => toolStore.tools.map(tool => ({
    ...tool,
    to: tool.path,
    toolCategory: tool.category,
    category: t('search.categories.tools', 'Tools'),
  })));

  const searchOptions = computed<PaletteOption[]>(() => [
    ...toolsOptions.value,
    {
      name: t('search.options.randomTool.name', 'Random tool'),
      description: t('search.options.randomTool.description', 'Get a random tool from the list.'),
      action: () => {
        const { path } = _.sample(toolStore.tools)!;
        router.push(path);
      },
      icon: DiceIcon,
      category: t('search.categories.tools', 'Tools'),
      keywords: ['random', 'tool', 'pick', 'choose', 'select'],
      closeOnSelect: true,
    },
    {
      name: t('search.options.toggleDarkMode.name', 'Toggle dark mode'),
      description: t('search.options.toggleDarkMode.description', 'Toggle dark mode on or off.'),
      action: () => styleStore.toggleDark(),
      icon: SunIcon,
      category: t('search.categories.actions', 'Actions'),
      keywords: ['dark', 'theme', 'toggle', 'mode', 'light', 'system'],
    },
    {
      name: t('search.options.githubRepository.name', 'Github repository'),
      href: 'https://github.com/zhaomo08/it-tools',
      category: t('search.categories.external', 'External'),
      description: t('search.options.githubRepository.description', 'View the source code of it-tools on Github.'),
      keywords: ['github', 'repo', 'repository', 'source', 'code'],
      icon: GithubIcon,
    },
    {
      name: t('search.options.reportIssue.name', 'Report a bug or an issue'),
      description: t('search.options.reportIssue.description', 'Report a bug or an issue to help improve it-tools.'),
      href: 'https://github.com/zhaomo08/it-tools/issues/new/choose',
      category: t('search.categories.actions', 'Actions'),
      keywords: ['report', 'issue', 'bug', 'problem', 'error'],
      icon: BugIcon,
    },
    {
      name: t('search.options.about.name', 'About'),
      description: t('search.options.about.description', 'Learn more about IT-Tools.'),
      to: '/about',
      category: t('search.categories.pages', 'Pages'),
      keywords: ['about', 'learn', 'more', 'info', 'information'],
      icon: InfoIcon,
    },
  ]);

  const searchResult = computed(() => {
    const fuse = new Fuse(searchOptions.value, {
      keys: [{ name: 'name', weight: 2 }, 'description', 'keywords', 'category'],
      threshold: 0.3,
    });

    return fuse.search(searchPrompt.value).map(({ item }) => item);
  });

  const filteredSearchResult = computed(() =>
    _.chain(searchResult.value).groupBy('category').mapValues(categoryOptions => _.take(categoryOptions, 5)).value());

  return {
    filteredSearchResult,
    searchPrompt,
  };
});

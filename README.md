<picture>
    <source srcset="./.github/logo-dark.png" media="(prefers-color-scheme: light)">
    <source srcset="./.github/logo-white.png" media="(prefers-color-scheme: dark)">
    <img src="./.github/logo-dark.png" alt="IT-Tools logo">
</picture>

<p align="center">
  为开发者和 IT 从业者准备的在线工具集，新增 AI 工具套件。<br/>
  A curated collection of handy online tools for developers and IT professionals — with an added AI toolset.
</p>

<p align="center">
  <a href="https://github.com/zhaomo08/it-tools/actions/workflows/ci.yml">
    <img src="https://github.com/zhaomo08/it-tools/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/zhaomo08/it-tools/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="License: GPL-3.0" />
  </a>
</p>

---

## 关于本项目 / About

本仓库 fork 自 [CorentinTh/it-tools](https://github.com/CorentinTh/it-tools)，在保留原版全部工具的基础上，新增了一套专为 AI / LLM 工作流设计的工具：

This repository is a fork of [CorentinTh/it-tools](https://github.com/CorentinTh/it-tools). All original tools are preserved, with an added **AI toolset** designed for LLM workflows:

| 工具 | 说明 |
|------|------|
| **LLM Token & Cost Calculator** | 本地估算 Prompt Token 数、缓存节省与调用成本 |
| **KV Cache Calculator** | 估算 Transformer KV Cache 显存占用与前缀缓存收益 |
| **LLM Context Planner** | 按组件规划上下文窗口（系统提示、RAG、历史、输出预留） |
| **Prompt Variable Extractor** | 从模板中提取双花括号占位符并生成 JSON 样例 |
| **Prompt Template Renderer** | 用 JSON 变量渲染 Prompt 模板，高亮未解析占位符 |
| **JSONL Chat Builder** | 多行 Prompt 一键转为聊天补全 API 的 JSONL 批量请求 |
| **JSON Output Key Checker** | 校验模型 JSON 输出是否满足必填字段 |

## 本地运行 / Local Development

```sh
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 运行单元测试
pnpm test

# Lint 检查
pnpm lint
```

## 创建新工具 / Create a New Tool

```sh
pnpm run script:create:tool my-tool-name
```

脚本会在 `src/tools/` 下生成模板文件并自动在 `src/tools/index.ts` 中添加导入。将其加入对应分类并开发即可。

The script generates boilerplate under `src/tools/` and adds the import to `src/tools/index.ts`. Add it to the correct category and start building.

## Self Host

```sh
# Docker Hub
docker run -d --name it-tools --restart unless-stopped -p 8080:80 corentinth/it-tools:latest

# GitHub Packages
docker run -d --name it-tools --restart unless-stopped -p 8080:80 ghcr.io/corentinth/it-tools:latest
```

## 推荐 IDE 配置 / IDE Setup

[VSCode](https://code.visualstudio.com/) + 以下扩展：

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（禁用 Vetur）
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "i18n-ally.localesPaths": ["locales", "src/tools/*/locales"],
  "i18n-ally.keystyle": "nested"
}
```

## Credits

- 原项目由 [Corentin Thomasset](https://corentin.tech) 创建，遵循 GPL-3.0 协议开源。
- Original project created by [Corentin Thomasset](https://corentin.tech), licensed under GPL-3.0.
- AI 工具套件由本 fork 新增。/ AI toolset added in this fork.
- 持续部署由 [Vercel](https://vercel.com) 提供。/ Continuously deployed via [Vercel](https://vercel.com).

## License

This project is under the [GNU GPLv3](LICENSE).

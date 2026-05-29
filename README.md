# 天南玉简 · 凡人修仙传藏经阁

> 问道典籍，以文会友 — 凡人修仙传粉丝知识库站点

## 项目简介

天南玉简是一个《凡人修仙传》粉丝向的知识库网站，以**"藏经阁"**为核心，提供全文检索功能，收录原著小说所有章节内容。支持时间线浏览、人物谱、法宝录等展示页面。

**设计理念**：中国水墨画风格，墨色底色，卷轴元素，金边玉色点缀。

**技术特色**：纯前端 + Vercel Serverless Function，**零 API 依赖、零费用**。检索使用 BM25 算法 + 字形预过滤，无需任何 LLM 或外部服务。

## 功能

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 展示 + 荣誉殿堂 + 数据概览 + 故事简介 |
| 藏经阁 | `/library` | ★ 核心功能：BM25 全文检索，搜索原著章节内容 |
| 时间线 | `/timeline` | SVG 交互式修真时间线 + 一图流模式 |
| 人物谱 | `/characters` | 人物卡片网格 + 详情页 |
| 人物详情 | `/characters/:id` | 角色详情 |
| 法宝录 | `/artifacts` | 法宝展示 |

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 路由 | React Router v7 |
| 动画 | Framer Motion |
| 样式 | CSS Modules + CSS Variables |
| 检索算法 | BM25 + jieba 分词（V4：字形预过滤） |
| 部署 | Vercel（静态托管 + Serverless Function） |

## 项目结构

```
tiannan-jade-slip/
├── api/
│   └── search.ts              # Vercel Serverless: BM25 检索 API
├── public/
│   ├── knowledge/             # 预构建知识库
│   │   └── knowledge-base.json.gz
│   ├── images/                # 人物、法宝、背景图片
│   │   ├── characters/
│   │   ├── artifacts/
│   │   └── bg/
│   ├── videos/                # 背景视频
│   ├── bgm.mp3               # 背景音乐
│   └── favicon.svg
├── scripts/
│   └── build_kb.py            # 知识库构建脚本
├── src/
│   ├── components/
│   │   ├── layout/            # Header, Footer, Layout, MusicPlayer
│   │   ├── common/            # InkBrush, SectionTitle, ScrollReveal
│   │   ├── home/              # HeroSection, HonorsPanel, StatisticsPanel...
│   │   ├── library/           # SearchBar, SearchResults, PassageCard
│   │   ├── characters/        # CharacterCard, CharacterGrid
│   │   ├── artifacts/         # ArtifactCard, ArtifactDetail
│   │   └── timeline/          # ScrollPath, EventDetailCard
│   ├── data/                  # 静态数据（人物、法宝、时间线、荣誉）
│   ├── hooks/                 # useCountUp, useScrollReveal
│   ├── i18n/                  # 国际化（zh.ts, en.ts）
│   ├── pages/                 # 页面组件
│   ├── styles/                # 全局样式（variables, reset, typography）
│   ├── types/                 # TypeScript 类型定义
│   └── utils/                 # 工具函数、常量
├── vercel.json                # Vercel 部署配置
├── vite.config.ts
└── package.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npx tsc --noEmit

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 知识库构建

知识库源文件为《凡人修仙传》全本 TXT，构建脚本位于 `scripts/build_kb.py`：

```bash
python scripts/build_kb.py
```

该脚本读取原著文本，按 500 字分块，序列化为 JSON 并 gzip 压缩，输出到 `public/knowledge/knowledge-base.json.gz`。

## API

### GET /api/search

检索藏经阁知识库。

**参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | string | (必填) | 搜索关键词 |
| `top` | number | 10 | 返回结果数 |

**响应**：

```json
{
  "query": "韩立是什么境界",
  "total_matches": 3220,
  "results": [
    {
      "id": 1,
      "chapter": "第1267章 血咒文书与灵具",
      "text": "韩立躺在地上一动不动...",
      "score": 12.45
    }
  ],
  "time_ms": 45
}
```

## 设计语言

```
/* 墨色系 */
--ink-full: #0d0d0d;
--ink-heavy: #1a1a1a;
--ink-medium: #3d3d3d;
--ink-light: #6b6b6b;
--ink-faint: #a0a0a0;

/* 强调色 */
--vermillion: #c03b3b;    /* 朱砂红 */
--gold: #c4a84b;           /* 金 */
--jade: #5b8c5a;           /* 玉色 */

/* 背景（暖色宣纸） */
--parchment: #f5f0e8;
--rice-paper: #fafaf7;

/* 字体 */
--font-display: 'Ma Shan Zheng', 'ZCOOL KuaiLe', 'Noto Serif SC', serif;
--font-body: 'Noto Serif SC', 'Source Han Serif SC', serif;
```

## 部署

项目配置为部署至 [Vercel](https://vercel.com)（Hobby 计划，免费）：

1. 将项目推送至 GitHub
2. 在 Vercel 中导入仓库
3. Vercel 自动检测 Vite 配置并部署

**静态文件限制**：Vercel Hobby 计划限制部署包 ≤ 100MB，当前约 91MB。

## 致谢

- 视频素材来自博主 **@落雨无声**、**@天南第一深情**，已获得原作者授权
- 本项目仅供学习交流，不作商业用途

## 许可

本项目采用 [CC BY-NC-SA 4.0](LICENSE) 许可证。

- **BY（署名）**：使用或转载时必须注明原作者和出处
- **NC（非商业性使用）**：**禁止将本项目用于任何行业/商业用途**，包括但不限于：商业产品、付费服务、企业内训、商业展览等
- **SA（相同方式共享）**：修改后的衍生作品必须采用相同许可证发布

> **明确禁止**：任何企业、机构、组织不得将本项目代码、数据、设计用于商业盈利或行业应用场景。如需商业授权，请联系作者另行协商。

*凡人修仙传原著版权归忘语所有。本粉丝项目与原作者无关联。*


---

*天南玉简 · 凡人修仙传藏经阁 — 道友交流之所*

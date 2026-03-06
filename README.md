# ReadingRoom 📚

个人阅读记录与书架展示应用 —— 纯前端项目，部署于 GitHub Pages。

## 在线预览

> `https://<your-username>.github.io/ReadingRoom/`

## 功能特性

- **书架展示** — 响应式网格布局，封面 3D hover 动效，交错入场动画
- **年份筛选** — 顶部 Tab 栏按年切换，使用 `useTransition` 非阻塞渲染
- **模糊搜索** — 前端实时搜索书名 / 作者，`useDeferredValue` 优化性能
- **书籍详情** — 点击封面弹窗展示完整信息，支持 URL hash 分享
- **阅读统计** — 年度柱状图 + 月度热力图 + 统计卡片
- **阅读时间线** — 滚动触发动画（Intersection Observer + Framer Motion）
- **多语言** — 中文简体 / English / 日本語，react-i18next 方案
- **暗色主题** — 亮色 / 暗色 / 跟随系统，偏好持久化
- **PWA 支持** — 离线可访问，可添加到主屏幕
- **公共 API** — Google Books + Open Library 三级 fallback，TanStack Query 缓存

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript (strict) |
| 构建 | Vite 7 |
| 路由 | React Router v7 |
| 状态管理 | Zustand (客户端) + TanStack Query (服务端) |
| 样式 | Tailwind CSS v4 |
| 动效 | Framer Motion |
| 图表 | Recharts |
| 国际化 | react-i18next |
| 测试 | Vitest + React Testing Library |
| CI/CD | GitHub Actions → GitHub Pages |
| PWA | vite-plugin-pwa |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── components/        # 通用组件 (Layout, Skeleton, StarRating, ThemeToggle...)
├── features/
│   ├── bookshelf/     # 书架模块 (BookCard, BookGrid, YearFilter, SearchBar)
│   ├── book-detail/   # 详情弹窗模块
│   ├── stats/         # 统计仪表盘模块
│   └── timeline/      # 时间线模块
├── hooks/             # 自定义 Hooks (useBooks, useBookDetail)
├── i18n/              # 国际化配置及词条 (zh-CN / en / ja)
├── services/          # API 服务层 (Google Books, Open Library, fallback)
├── stores/            # Zustand stores (themeStore)
├── types/             # TypeScript 类型定义
├── test/              # 单元测试
└── App.tsx            # 路由与全局 Provider
public/
└── data/books.json    # 书目配置数据
```

## 数据配置

编辑 `public/data/books.json` 添加你的书目：

```json
{
  "id": "unique-id",
  "title": "书名",
  "titleEn": "English Title",
  "author": "作者",
  "isbn": "9780000000000",
  "readDateStart": "2025-01-01",
  "readDateEnd": "2025-02-01",
  "status": "finished",
  "rating": 5,
  "tags": ["标签1", "标签2"],
  "review": "你的书评..."
}
```

应用会自动通过 ISBN / 书名从 Google Books 和 Open Library 获取封面和详细信息。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

确保在仓库 Settings → Pages 中选择 **GitHub Actions** 作为 Source。

## License

MIT

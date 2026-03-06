# GitHub Actions 自动构建部署 GitHub Pages 完整指南

本文档以本项目（Vite + React + TypeScript）为例，详细介绍如何通过 GitHub Actions 实现 push 到 `main` 分支后自动运行测试、构建、并部署到 GitHub Pages。

---

## 目录

1. [整体流程概览](#1-整体流程概览)
2. [前置条件](#2-前置条件)
3. [Vite 项目配置](#3-vite-项目配置)
4. [Workflow 文件详解](#4-workflow-文件详解)
5. [GitHub 仓库设置](#5-github-仓库设置)
6. [部署流程触发与验证](#6-部署流程触发与验证)
7. [常见问题排查](#7-常见问题排查)

---

## 1. 整体流程概览

```
开发者 push 代码到 main
        │
        ▼
GitHub Actions 检测到 push 事件
        │
        ▼
  ┌─────────────┐
  │   test job   │  安装依赖 → 运行单元测试
  └──────┬──────┘
         │ 测试通过
         ▼
  ┌──────────────┐
  │  deploy job  │  安装依赖 → 构建 → 上传产物 → 部署到 Pages
  └──────────────┘
         │
         ▼
  站点上线: https://<用户名>.github.io/<仓库名>/
```

**关键点：**
- 使用 GitHub 官方的 Pages 部署方式（`actions/deploy-pages`），无需额外创建 `gh-pages` 分支
- `deploy` job 依赖 `test` job，测试不通过则不会部署
- 支持手动触发（`workflow_dispatch`）

---

## 2. 前置条件

- GitHub 仓库已创建
- 项目可以通过 `npm run build` 正常构建，产物输出到 `dist/` 目录
- 项目有 `npm test` 命令可运行测试（可选但推荐）

---

## 3. Vite 项目配置

### 3.1 设置 `base` 路径

GitHub Pages 的站点 URL 为 `https://<用户名>.github.io/<仓库名>/`，所以静态资源的基础路径必须设置为仓库名。

在 `vite.config.ts` 中：

```typescript
export default defineConfig({
  base: '/<仓库名>/',   // 例如 '/reading-room/'
  // ...其他配置
})
```

**为什么需要这一步？**

Vite 默认 `base` 是 `/`，构建产物中所有资源引用都以 `/` 开头（如 `/assets/index.js`）。但 GitHub Pages 项目站点的根路径是 `/<仓库名>/`，如果不设置 `base`，浏览器会去 `https://<用户名>.github.io/assets/index.js` 加载资源，导致 404。

### 3.2 路由配置

如果使用了 React Router，同样需要设置 `basename`：

```tsx
<BrowserRouter basename="/<仓库名>">
  {/* 路由... */}
</BrowserRouter>
```

### 3.3 index.html 中的引用

`index.html` 中的 favicon 等静态资源引用也需要匹配：

```html
<link rel="icon" type="image/svg+xml" href="/<仓库名>/favicon.svg" />
```

---

## 4. Workflow 文件详解

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]       # main 分支 push 时触发
  workflow_dispatch:        # 支持在 GitHub 界面手动触发
```

### 4.1 `on` — 触发条件

| 字段 | 说明 |
|------|------|
| `push.branches: [main]` | 仅当 push 到 `main` 分支时运行 |
| `workflow_dispatch` | 允许在 Actions 页面点击 "Run workflow" 手动触发 |

### 4.2 `permissions` — 权限声明

```yaml
permissions:
  contents: read       # 读取仓库代码
  pages: write         # 写入 GitHub Pages
  id-token: write      # OIDC token，Pages 部署认证需要
```

这三个权限缺一不可。`id-token: write` 是 Pages 新版部署方式要求的，用于安全认证。

### 4.3 `concurrency` — 并发控制

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

确保同一时间只有一个部署任务在运行。如果快速连续 push 多次，前面未完成的部署会被取消，只执行最新的。

### 4.4 `test` Job — 自动化测试

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # 1. 拉取代码
      - uses: actions/setup-node@v4        # 2. 安装 Node.js
        with:
          node-version: 22
          cache: npm                       # 缓存 npm 依赖，加速后续构建
      - run: npm ci                        # 3. 安装依赖（ci 比 install 更快更严格）
      - run: npm run test                  # 4. 运行测试
```

**`npm ci` vs `npm install`：**
- `npm ci` 严格按照 `package-lock.json` 安装，不会修改 lock 文件
- 安装前会自动删除 `node_modules`，确保环境干净
- CI 环境推荐始终使用 `npm ci`

### 4.5 `deploy` Job — 构建与部署

```yaml
  deploy:
    needs: test                            # 依赖 test job，测试通过才执行
    runs-on: ubuntu-latest
    environment:
      name: github-pages                   # 关联 GitHub Pages environment
      url: ${{ steps.deployment.outputs.page_url }}  # 部署后的 URL
    steps:
      - uses: actions/checkout@v4          # 1. 拉取代码
      - uses: actions/setup-node@v4        # 2. 安装 Node.js
        with:
          node-version: 22
          cache: npm
      - run: npm ci                        # 3. 安装依赖
      - run: npm run build                 # 4. 构建（tsc + vite build → dist/）
      - uses: actions/configure-pages@v5   # 5. 配置 Pages
      - uses: actions/upload-pages-artifact@v3  # 6. 上传构建产物
        with:
          path: dist                       # 指定上传 dist 目录
      - id: deployment
        uses: actions/deploy-pages@v4      # 7. 部署到 Pages
```

**各步骤详解：**

| 步骤 | Action | 作用 |
|------|--------|------|
| 5 | `actions/configure-pages@v5` | 读取仓库 Pages 配置，验证 Pages 功能是否已启用 |
| 6 | `actions/upload-pages-artifact@v3` | 将 `dist/` 目录打包为 Pages artifact 上传 |
| 7 | `actions/deploy-pages@v4` | 将上传的 artifact 部署到 GitHub Pages CDN |

**`needs: test` 的作用：**
形成 job 依赖链：`test → deploy`。如果 test 失败（测试不通过或构建报错），deploy 将被跳过，避免部署有问题的代码。

---

## 5. GitHub 仓库设置

### 5.1 开启 GitHub Pages

1. 打开仓库页面，点击 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选择 **GitHub Actions**（不是 "Deploy from a branch"）
4. 点击 **Save**

> **注意：** 如果不执行这一步，`actions/configure-pages@v5` 会报错导致部署失败。这是最常见的部署失败原因。

### 5.2 确认权限

进入 **Settings → Actions → General**，确保：
- **Workflow permissions** 选择 "Read and write permissions"
- 勾选 "Allow GitHub Actions to create and approve pull requests"（可选）

---

## 6. 部署流程触发与验证

### 自动触发

```bash
git add .
git commit -m "feat: some feature"
git push origin main
```

push 后 GitHub Actions 自动运行，可在仓库的 **Actions** 页签实时查看进度。

### 手动触发

1. 进入仓库 **Actions** 页签
2. 左侧选择 "Deploy to GitHub Pages" workflow
3. 点击 **Run workflow** → 选择 `main` 分支 → **Run workflow**

### 验证部署

部署完成后访问：
```
https://<用户名>.github.io/<仓库名>/
```

也可以在 **Settings → Pages** 页面看到站点 URL。

---

## 7. 常见问题排查

### Q1: `actions/configure-pages` 步骤失败

**原因：** 仓库未开启 GitHub Pages 或 Source 未设为 "GitHub Actions"。

**解决：** 按照 [5.1 节](#51-开启-github-pages) 操作。

### Q2: 页面打开后白屏，控制台大量 404

**原因：** `vite.config.ts` 中 `base` 路径未正确设置，或与仓库名不一致（注意大小写）。

**解决：** 确保 `base` 值与仓库名完全一致：
```typescript
// 仓库名为 reading-room
base: '/reading-room/'    // 正确
base: '/ReadingRoom/'     // 错误 — 大小写不匹配
base: '/'                 // 错误 — 缺少仓库名
```

### Q3: 路由跳转后刷新页面 404

**原因：** GitHub Pages 是静态托管，不支持服务端路由回退。

**解决方案 A** — 使用 HashRouter 替代 BrowserRouter：
```tsx
import { HashRouter } from 'react-router-dom'
<HashRouter>{/* 路由 */}</HashRouter>
```

**解决方案 B** — 添加 404 回退页面，在 `public/` 下创建 `404.html`：
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // 将路径转为 query 参数，重定向到首页由前端路由处理
    var path = window.location.pathname;
    window.location.replace(
      window.location.origin + '/<仓库名>/' +
      '?redirect=' + encodeURIComponent(path)
    );
  </script>
</head>
</html>
```

### Q4: `npm ci` 失败

**原因：** `package-lock.json` 未提交到仓库，或与 `package.json` 不同步。

**解决：** 本地执行 `npm install` 生成/更新 `package-lock.json`，一起提交。

### Q5: 构建超时

**原因：** 依赖安装或构建过慢。

**解决：** `actions/setup-node@v4` 的 `cache: npm` 选项会缓存 npm 全局缓存目录，通常首次构建较慢（~30s），后续会快很多。

### Q6: 想部署到自定义域名

在 **Settings → Pages → Custom domain** 中填写你的域名，并在 DNS 添加 CNAME 记录指向 `<用户名>.github.io`。同时在 `public/` 下创建 `CNAME` 文件：
```
your-domain.com
```

此时 `vite.config.ts` 的 `base` 应改回 `/`。

---

## 附：本项目实际文件参考

- Workflow 文件：[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- Vite 配置：[`vite.config.ts`](../vite.config.ts)
- 路由配置：[`src/App.tsx`](../src/App.tsx)（`BrowserRouter basename`）

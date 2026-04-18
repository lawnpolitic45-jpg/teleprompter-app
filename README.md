# 提词器（纯前端 MVP）

依据仓库内 `idea/pure-frontend-teleprompter-mvp-spec.md` 的交互与 UI 规格实现：**文稿与设置仅在本机浏览器**，无后端、无账号。

## 功能

- 大文本框粘贴脚本（可选 **导入 `.txt`**，仍用 `FileReader` 纯前端读入）
- 提词预览：可调 **字号**、**速度**、**水平镜像**；**自动匀速滚动**；手动滚轮/拖拽会 **暂停自动滚动** 并提示，需再次 **开始滚动 / 继续**
- **全屏提词层**：底边 120px 内唤出半透明控制坞，移出 800ms 淡出；**Space** 暂停/继续，**Esc** 退出全屏（首次轻提示），**F** 进入全屏
- `localStorage` 持久化上次文稿与参数（可清空站点数据即删除）

## 技术栈

- **React 19 + Vite 6 + TypeScript**
- **MUI v6**（布局、滑块、按钮、开关）
- **自动滚动**：本仓库使用 `requestAnimationFrame` + `scrollTop` 连续滚动。调研过的常见包包括 [`react-scroll`](https://www.npmjs.com/package/react-scroll)（偏锚点/动画跳转）、[`autoscroll-react`](https://www.npmjs.com/package/autoscroll-react)（偏列表贴底）等；提词器需要「可变速、可暂停、手动干预即停」的细粒度控制，故不引入上述依赖。

## 需求

- **Node.js**：见 `.nvmrc`（推荐 **22**；LTS 20 通常也可）

## 安装与启动

```bash
cd teleprompter-app
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

## 构建

```bash
npm run build
npm run preview   # 本地预览 dist
```

## GitHub Pages 部署

1. 仓库 **Settings → Pages**：Source 选 **GitHub Actions**。
2. 工作流仅在 **`master`** 分支推送时构建（见 `.github/workflows/deploy-pages.yml`）。
3. **子目录站点**（`https://<user>.github.io/<repo>/`）需在构建时设置 `VITE_BASE` 为 **`/<仓库名>/`**。工作流已用 `github.event.repository.name` 自动注入。
4. 若使用 **自定义域名根路径**，将 `vite.config.ts` 中 `base` 改为 `'/'` 并调整工作流环境变量。

## 许可

MIT（如无特殊要求可自行在 `package.json` 增加 `license` 字段）。

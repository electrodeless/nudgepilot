# nudgepilot

NudgePilot (灵伴/“Ni”): a local-first proactive desktop voice assistant for Windows/Mac. CPU-friendly ASR/TTS, on-device intent engine, cloud fallback, tray resident.

## 界面原型代码位置

界面原型文件位于仓库根目录下的 `ui/` 文件夹内，包含以下三个核心文件：

- `ui/index.html`：页面结构与多页面导航骨架。
- `ui/styles.css`：玻璃拟态风格的主题、组件及响应式布局样式。
- `ui/app.js`：按钮点击、状态提示、覆盖层和多页切换等交互逻辑。

若在 GitHub 默认分支页面暂时看不到 `ui/` 目录，请切换到包含最新界面实现的 `work` 分支：

```bash
git fetch origin
git checkout work
```

随后即可在本地打开 `ui/index.html` 预览原型界面，或使用任意静态站点服务器托管 `ui/` 目录进行查看。

## 打包为 Windows 桌面程序

仓库中的 `desktop/` 目录提供了一个 Electron 外壳，用于将上述原型界面直接打包成 Windows 可执行程序：

1. 安装依赖
   ```bash
   cd desktop
   npm install
   ```
2. 开发预览（可选）
   ```bash
   npm start
   ```
   Electron 会加载 `../ui` 中的 HTML/CSS/JS，实现与浏览器一致的界面表现。关闭或最小化窗口后，程序会最小化到系统托盘，并保持“后台静默聆听”开关状态，确保助手可持续在后台待命。
3. 生成 `.exe`
   ```bash
   npm run build:win
   ```
   该命令会在 `desktop/dist/` 下输出 NSIS 安装包和便携版可执行文件。建议在 Windows 环境执行此命令，以避免跨平台构建缺少依赖的问题。

构建产物会把 `ui/` 目录打包为额外资源，因此你可以在后续迭代界面时继续修改 `ui/` 下的文件，再次运行打包脚本即可生成新的安装包。

## 对话记录归档

欲快速回顾设计需求与实现背景，可阅读 `docs/conversation-log.md`，其中整理了本阶段用户与助手的关键对话摘要。



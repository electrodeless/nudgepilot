# nudgepilot

NudgePilot (灵伴/“Ni”): a local-first proactive desktop voice assistant for Windows/Mac. CPU-friendly ASR/TTS, on-device intent engine, cloud fallback, tray resident.

## 界面原型代码位置

界面原型文件位于仓库根目录下的 `ui/` 文件夹内，包含以下三个核心文件：

- `ui/index.html`：定义“驾驶舱”“聊天主界面”“本地持续学习”“内容展示”“设置中心”五个屏幕的 HTML 骨架，并附带窗口标题栏与侧边导航。
- `ui/styles.css`：实现类 Windows 视觉、浅/深色主题、对话气泡、时间线、占位卡片等样式，以及侧边栏折叠动画。
- `ui/app.js`：驱动页面切换、说明弹窗、吐司提示、后台监听模拟与主题/侧边栏切换逻辑。

直接在浏览器中打开 `ui/index.html` 即可预览骨架界面。建议点击所有导航项、快捷入口和说明按钮，确认跳转与弹窗逻辑正确无误后再交付打包版本。

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
   Electron 会加载 `../ui` 中的 HTML/CSS/JS，实现与浏览器一致的骨架界面展示。
3. 生成 `.exe`
   ```bash
   npm run build:win
   ```
   或在 Windows 上直接运行 `build-win.bat`（双击）或 `build-win.ps1`（PowerShell）以自动安装依赖并生成安装包。

构建产物会把 `ui/` 目录打包为额外资源，因此后续迭代界面时只需修改 `ui/` 下的文件，再次运行打包脚本即可生成新的安装包。

## 对话记录归档

欲快速回顾设计需求与实现背景，可阅读 `docs/conversation-log.md`，其中整理了本阶段用户与助手的关键对话摘要。



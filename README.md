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

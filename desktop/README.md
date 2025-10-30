# NudgePilot Desktop Shell

This folder wraps the prototype UI (`../ui`) in an Electron shell so the assistant can be shipped as a Windows executable.

## Development

```bash
cd desktop
npm install
npm start
```

`npm start` launches the Electron runtime and loads the multi-page prototype. Any edits to the files in `../ui` are reloaded automatically because the renderer points to that directory directly in development. The desktop shell keeps running in the Windows system tray when you close or minimise the window, providing background hotword standby (the UI will reflect the current state through the "后台静默聆听" 开关).

## Packaging for Windows

The project uses [electron-builder](https://www.electron.build/) to create distributables:

```bash
cd desktop
npm install
npm run build:win
```

The command generates both an `.exe` installer (NSIS) and a portable executable inside `desktop/dist/`. You need to run the packaging command on Windows (or on macOS/Linux with the corresponding Windows build tooling available) because building native `.exe` binaries requires the Windows-specific dependencies that electron-builder expects. Once packaged, the executable launches to the taskbar and minimises to the tray when closed so the assistant can continue to listen for hotwords in the background.

## File Layout

- `main.js` – boots the Electron process and loads the packaged UI assets.
- `preload.js` – placeholder bridge for future desktop-specific APIs.
- `build/icon.png` – tray/taskbar icon used during packaging (currently copied from the project logo).
- `package.json` – local scripts, dependencies, and electron-builder configuration.

The actual user interface remains in `../ui`. During packaging the directory is copied into the application bundle as an extra resource so the production executable reads exactly the same HTML/CSS/JS that you have been iterating on.

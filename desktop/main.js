const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const isSquirrelStartup = process.platform === 'win32' && require('electron-squirrel-startup');

if (isSquirrelStartup) {
  app.quit();
}

let mainWindow;
let tray;
let isQuitting = false;
let isBackgroundListening = false;

const getAssetPath = (...segments) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...segments);
  }

  return path.join(__dirname, ...segments);
};

const resolveIcon = () => {
  const iconPath = getAssetPath('build', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? undefined : icon;
};

const broadcastBackgroundState = ({ silent = false } = {}) => {
  if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('background-listening-updated', {
      active: isBackgroundListening,
      silent
    });
  }

  if (tray) {
    const tooltip = isBackgroundListening
      ? 'NudgePilot：后台静默聆听中'
      : 'NudgePilot：待命';
    tray.setToolTip(tooltip);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isBackgroundListening ? '退出后台监听' : '开启后台监听',
        type: 'checkbox',
        checked: isBackgroundListening,
        click: (menuItem) => {
          isBackgroundListening = menuItem.checked;
          broadcastBackgroundState();
        }
      },
      { type: 'separator' },
      {
        label: '显示主界面',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: '退出',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  }
};

const ensureTray = () => {
  if (tray) {
    return tray;
  }

  const trayIcon = resolveIcon() ?? nativeImage.createEmpty();
  tray = new Tray(trayIcon);
  tray.setToolTip('NudgePilot：待命');

  tray.on('click', () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  broadcastBackgroundState({ silent: true });
  return tray;
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#0f111a',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const uiEntry = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'index.html')
    : path.join(__dirname, '..', 'ui', 'index.html');

  mainWindow.loadFile(uiEntry);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  ensureTray();
};

ipcMain.handle('noop', () => null);

ipcMain.handle('set-background-listening', (_event, shouldListen) => {
  const nextState = Boolean(shouldListen);
  const changed = nextState !== isBackgroundListening;
  isBackgroundListening = nextState;
  broadcastBackgroundState({ silent: !changed });
  return isBackgroundListening;
});

ipcMain.handle('get-background-listening', () => isBackgroundListening);

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
  return true;
});

ipcMain.handle('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
  return true;
});

ipcMain.handle('quit-application', () => {
  isQuitting = true;
  app.quit();
  return true;
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.nudgepilot.assistant');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

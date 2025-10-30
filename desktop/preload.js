const { contextBridge, ipcRenderer } = require('electron');

const safeCallback = (fn) => {
  if (typeof fn !== 'function') {
    return () => {};
  }
  return fn;
};

contextBridge.exposeInMainWorld('nudgepilotDesktop', {
  ping: () => ipcRenderer.invoke('noop'),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),
  quit: () => ipcRenderer.invoke('quit-application'),
  getBackgroundListening: () => ipcRenderer.invoke('get-background-listening'),
  setBackgroundListening: (enabled) => ipcRenderer.invoke('set-background-listening', enabled),
  onBackgroundListeningChange: (callback) => {
    const target = safeCallback(callback);
    const listener = (_event, payload) => {
      target(payload);
    };

    ipcRenderer.on('background-listening-updated', listener);
    return () => {
      ipcRenderer.removeListener('background-listening-updated', listener);
    };
  }
});

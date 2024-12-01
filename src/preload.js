// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  windowControls: {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
  },
  fileOperations: {
    newFile: () => ipcRenderer.invoke('file-new'),
    openFile: () => ipcRenderer.invoke('file-open'),
    saveFile: () => ipcRenderer.invoke('file-save'),
    saveFileAs: () => ipcRenderer.invoke('file-save-as'),
    exit: () => ipcRenderer.send('file-exit'),
  },
  appInfo: {
    getAppName: () => ipcRenderer.invoke('get-app-name')
  }
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  improveText: (text) => ipcRenderer.invoke('ai-improve-text', text),
  rewriteText: (text) => ipcRenderer.invoke('ai-rewrite-text', text),
  fixErrors: (text) => ipcRenderer.invoke('ai-fix-errors', text),
  translateText: (text) => ipcRenderer.invoke('ai-translate-text', text),
});

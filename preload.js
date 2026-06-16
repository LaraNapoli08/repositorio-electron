const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  login: (dados) => ipcRenderer.invoke('login', dados),
  carregarUsuarios: () => ipcRenderer.invoke('carregar-usuarios')
});

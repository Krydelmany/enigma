const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
    // Aqui você pode adicionar funções que precisam acessar as APIs do Node/Electron
})
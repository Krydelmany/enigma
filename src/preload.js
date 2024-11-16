const { contextBridge } = require('electron');

// Expõe funções para o frontend, se necessário
contextBridge.exposeInMainWorld('electronAPI', {
  // Aqui você pode definir métodos para acessar funcionalidades do backend
});

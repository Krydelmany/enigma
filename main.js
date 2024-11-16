const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Evita que o garbage collector limpe a janela
let mainWindow;

function createWindow() {
    // Cria a janela do navegador
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        frame: true,
        icon: path.join(__dirname, 'assets/icons/app-icon.png')
    });

    // Carrega o arquivo index.html do aplicativo
    mainWindow.loadFile('src/index.html');

    // Abre o DevTools em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Emitido quando a janela é fechada
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Este método será chamado quando o Electron terminar
// a inicialização e estiver pronto para criar janelas do navegador.
app.whenReady().then(createWindow);

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
    // No macOS é comum para aplicativos e sua barra de menu 
    // permanecerem ativos até que o usuário explicitamente encerre com Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // No macOS é comum recriar uma janela no aplicativo quando o
    // ícone do dock é clicado e não há outras janelas abertas.
    if (mainWindow === null) {
        createWindow();
    }
});

// Gerenciamento de eventos IPC
ipcMain.on('app:quit', () => {
    app.quit();
});

// Handle para salvar configurações
ipcMain.handle('save-settings', async (event, settings) => {
    // Aqui você implementaria a lógica para salvar as configurações
    // Por exemplo, usando electron-store
    return { success: true };
});

// Handle para exportar PDF
ipcMain.handle('export-pdf', async (event, data) => {
    // Implementar lógica de exportação PDF
    return { success: true };
});
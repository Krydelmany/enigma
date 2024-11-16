// main.js
const { app } = require('electron');
const { createWindow } = require('./src/main/createWindow');
const { setupReload } = require('./src/main/setupReload');

app.whenReady().then(() => {
    createWindow();
    setupReload();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

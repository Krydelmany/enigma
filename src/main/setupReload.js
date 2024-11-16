function setupReload() {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/../../node_modules/electron`),
    });
}

module.exports = { setupReload };

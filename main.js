const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 950,
    height: 650,
    frame: false,
    transparent: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');



  ipcMain.on('win-minimize', () => win.minimize());
  ipcMain.on('win-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
  ipcMain.on('win-close', () => win.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let win = null;
let isQuitting = false;

app.setAppUserModelId("com.liquidtodo.app");

function createWindow() {
  win = new BrowserWindow({
    width: 950,
    height: 650,
    icon: path.join(__dirname, 'icon.ico'),
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
  ipcMain.on('win-close', () => {
    win.hide();
  });

  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  ipcMain.on('show-notification', (event, { title, body, taskId }) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      const notif = new Notification({ title, body });
      notif.on('click', () => {
        if (!win.isVisible()) win.show();
        if (win.isMinimized()) win.restore();
        win.focus();
        event.reply('notification-clicked', taskId);
      });
      notif.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  const { nativeImage } = require('electron');
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('Liquid To-Do');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (!win.isVisible()) {
      win.show();
    }
    win.focus();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
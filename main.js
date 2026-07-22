const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let win = null;
let isQuitting = false;

function createWindow() {
  win = new BrowserWindow({
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

  // Create tray
  tray = new Tray(path.join(__dirname, 'icon.png')); // Needs an icon.png, electron will fallback if missing/invalid sometimes, but better to handle. 
  // We'll just use a native image if no icon is available.
  const { nativeImage } = require('electron');
  // Create a blank icon if icon.png doesn't exist
  const icon = nativeImage.createEmpty();
  tray.setImage(icon);
  
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
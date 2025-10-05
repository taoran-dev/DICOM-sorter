const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Enable File System Access API in Electron (Chromium feature)
app.commandLine.appendSwitch('enable-features', 'FileSystemAccessAPI');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Allow file:// to access local resources packaged in asar
      webSecurity: true,
    },
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  win.loadFile(path.join(__dirname, 'dicom-sorter-anonymizer-v1.0.0.2.html'));

  // Optional: open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

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


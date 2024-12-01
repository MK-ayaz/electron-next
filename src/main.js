const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let splashScreen;
let currentFilePath = null;

// Minimum time to show splash screen (in milliseconds)
const MIN_SPLASH_DURATION = 7400; // Match the Next.js startup time
let splashScreenStartTime;

function createSplashScreen() {
  splashScreen = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? path.join(__dirname, 'preload.js')
        : path.join(process.resourcesPath, 'app', 'src', 'preload.js')
    }
  });

  splashScreen.loadFile(path.join(__dirname, 'splash.html'));
  splashScreen.center();
  splashScreen.removeMenu();
  splashScreenStartTime = Date.now();
}

function closeSplashScreen() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - splashScreenStartTime;
  const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsedTime);

  // Wait for minimum duration before closing splash screen
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.close();
      splashScreen = null;
    }
    mainWindow.show();
  }, remainingTime);
}

function createWindow() {
  // Create splash screen first
  createSplashScreen();

  // Ensure preload script path is correct for both dev and production
  const preloadScript = isDev
    ? path.join(__dirname, 'preload.js')
    : path.join(process.resourcesPath, 'app', 'src', 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadScript
    }
  });

  const startURL = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // When the main window is ready, close splash screen with minimum duration
  mainWindow.webContents.on('did-finish-load', () => {
    closeSplashScreen();
  });

  // Handle window controls
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  // File operations
  ipcMain.handle('file-new', async () => {
    currentFilePath = null;
    return { success: true };
  });

  ipcMain.handle('file-open', async () => {
    const { canceled, filePaths } = await electron.dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!canceled && filePaths.length > 0) {
      try {
        const content = await fs.readFile(filePaths[0], 'utf8');
        currentFilePath = filePaths[0];
        return { success: true, content, filePath: currentFilePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: false };
  });

  ipcMain.handle('file-save', async (event, content) => {
    if (!currentFilePath) {
      return ipcMain.handlers['file-save-as'](event, content);
    }

    try {
      await fs.writeFile(currentFilePath, content, 'utf8');
      return { success: true, filePath: currentFilePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('file-save-as', async (event, content) => {
    const { canceled, filePath } = await electron.dialog.showSaveDialog(mainWindow, {
      defaultPath: currentFilePath,
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!canceled && filePath) {
      try {
        await fs.writeFile(filePath, content, 'utf8');
        currentFilePath = filePath;
        return { success: true, filePath: currentFilePath };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: false };
  });

  ipcMain.handle('get-app-name', () => {
    const packageJson = require('../package.json');
    return packageJson.productName || packageJson.name;
  });

  ipcMain.on('file-exit', () => {
    mainWindow.close();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

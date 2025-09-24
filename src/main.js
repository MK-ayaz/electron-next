const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
      preload: preloadScript,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  const startURL = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startURL);

  // Set Content Security Policy for development
  if (isDev) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* ws://localhost:*; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*; " +
            "style-src 'self' 'unsafe-inline' http://localhost:*; " +
            "img-src 'self' data: http://localhost:*; " +
            "connect-src 'self' http://localhost:* ws://localhost:*;"
          ]
        }
      });
    });
  }

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

  // Wire up file operations using centralized handler
  try {
    const { fileOperations } = require('../main/fileOperations');
    fileOperations(ipcMain, mainWindow);
      } catch (err) {
    console.error('Failed to initialize file operations:', err);
  }

  ipcMain.handle('get-app-name', () => {
    const packageJson = require('../package.json');
    return packageJson.productName || packageJson.name;
  });

  ipcMain.on('file-exit', () => {
    mainWindow.close();
  });
}

// Enable convenient debugging in development
if (isDev) {
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
  process.env.ELECTRON_ENABLE_LOGGING = process.env.ELECTRON_ENABLE_LOGGING || '1';
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

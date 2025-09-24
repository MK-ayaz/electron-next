const { dialog } = require('electron');
const fs = require('fs').promises;

let currentFilePath = null;

function fileOperations(ipcMain, mainWindow) {
  // Define save-as handler first so it can be referenced
  const handleSaveAs = async (event, content) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
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
  };

  ipcMain.handle('file-new', async () => {
    currentFilePath = null;
    return { success: true };
  });

  ipcMain.handle('file-open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
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
      // Call save-as handler directly
      return await handleSaveAs(event, content);
    }

    try {
      await fs.writeFile(currentFilePath, content, 'utf8');
      return { success: true, filePath: currentFilePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('file-save-as', handleSaveAs);
}

module.exports = { fileOperations };

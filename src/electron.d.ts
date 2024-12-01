interface FileOperationResult {
  success: boolean;
  content?: string;
  filePath?: string;
  error?: string;
}

interface FileOperations {
  newFile: () => Promise<FileOperationResult>;
  openFile: () => Promise<FileOperationResult>;
  saveFile: (content: string) => Promise<FileOperationResult>;
  saveFileAs: (content: string) => Promise<FileOperationResult>;
  exit: () => void;
}

interface WindowControls {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

interface ElectronAPI {
  windowControls: WindowControls;
  fileOperations: FileOperations;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

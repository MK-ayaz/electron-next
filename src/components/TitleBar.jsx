import { useEffect, useState } from 'react';
import { MinimizeIcon, MaximizeIcon, CloseIcon } from './WindowIcons.jsx';
import styles from './TitleBar.module.css';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [appName, setAppName] = useState('Loading...');

  const menuItems = {
    File: [
      { label: 'New', shortcut: 'Ctrl+N' },
      { label: 'Open', shortcut: 'Ctrl+O' },
      { label: 'Save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { type: 'separator' },
      { label: 'Exit', shortcut: 'Alt+F4' }
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { type: 'separator' },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' }
    ],
    Selection: [
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Expand Selection', shortcut: 'Alt+↑' },
      { label: 'Shrink Selection', shortcut: 'Alt+↓' }
    ],
    View: [
      { label: 'Command Palette', shortcut: 'Ctrl+Shift+P' },
      { type: 'separator' },
      { label: 'Open View', shortcut: 'Ctrl+Q' },
      { label: 'Appearance', disabled: true },
      { label: 'Editor Layout', shortcut: 'Alt+L' }
    ]
  };

  useEffect(() => {
    const fetchAppName = async () => {
      try {
        const name = await window.electron.appInfo.getAppName();
        setAppName(name);
      } catch (error) {
        console.error('Failed to get app name:', error);
      }
    };
    fetchAppName();

    if (typeof window === 'undefined') return;

    const handleMaximizeChange = () => {
      setIsMaximized(prev => !prev);
    };

    window.addEventListener('resize', handleMaximizeChange);
    
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.menuBar}`)) {
        setActiveMenu(null);
      }
    };
    
    window.addEventListener('click', handleClickOutside);

    const handleKeyDown = (e) => {
      if (!window?.electron?.fileOperations) return;

      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleMenuItemClick({ label: 'New' });
      } else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handleMenuItemClick({ label: 'Open' });
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleMenuItemClick({ label: 'Save' });
      } else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleMenuItemClick({ label: 'Save As...' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleMaximizeChange);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const minimizeWindow = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls.minimize();
    }
  };

  const maximizeWindow = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls.maximize();
      setIsMaximized(prev => !prev);
    }
  };

  const closeWindow = () => {
    if (window?.electron?.windowControls) {
      window.electron.windowControls.close();
    }
  };

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = async (item) => {
    if (!window?.electron?.fileOperations || item.disabled) {
      return;
    }

    try {
      switch (item.label) {
        case 'New':
          const newResult = await window.electron.fileOperations.newFile();
          if (newResult.success) {
            console.log('New file created');
          }
          break;

        case 'Open':
          const openResult = await window.electron.fileOperations.openFile();
          if (openResult.success) {
            console.log('File opened:', openResult.filePath);
          }
          break;

        case 'Save':
          const content = '';
          const saveResult = await window.electron.fileOperations.saveFile(content);
          if (saveResult.success) {
            console.log('File saved:', saveResult.filePath);
          }
          break;

        case 'Save As...':
          const saveAsContent = '';
          const saveAsResult = await window.electron.fileOperations.saveFileAs(saveAsContent);
          if (saveAsResult.success) {
            console.log('File saved as:', saveAsResult.filePath);
          }
          break;

        case 'Exit':
          window.electron.fileOperations.exit();
          break;

        default:
          console.log(`Menu item clicked: ${item.label}`);
      }
    } catch (err) {
      console.error(`Error handling menu item ${item.label}:`, err);
    }
    
    setActiveMenu(null);
  };

  return (
    <div className={styles.titleBar}>
      <div className={styles.menuBar}>
        {Object.entries(menuItems).map(([menuName, items]) => (
          <div key={menuName} className={styles.menuItem}>
            <button
              className={`${styles.menuButton} ${activeMenu === menuName ? styles.active : ''}`}
              onClick={() => handleMenuClick(menuName)}
            >
              {menuName}
            </button>
            {activeMenu === menuName && (
              <div className={styles.menuDropdown}>
                {items.map((item, index) => (
                  item.type === 'separator' ? (
                    <div key={`${menuName}-sep-${index}`} className={`${styles.menuDropdownItem} ${styles.separator}`} />
                  ) : (
                    <button
                      key={item.label}
                      className={`${styles.menuDropdownItem} ${item.disabled ? styles.disabled : ''}`}
                      onClick={() => handleMenuItemClick(item)}
                      disabled={item.disabled}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.appTitle}>{appName}</div>
      <div className={styles.windowControls}>
        <button
          className={`${styles.controlButton} ${styles.minimizeButton}`}
          onClick={minimizeWindow}
          aria-label="Minimize"
        >
          <div className={styles.iconWrapper}>
            <MinimizeIcon />
          </div>
        </button>
        <button
          className={`${styles.controlButton} ${styles.maximizeButton}`}
          onClick={maximizeWindow}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          <div className={styles.iconWrapper}>
            <MaximizeIcon isMaximized={isMaximized} />
          </div>
        </button>
        <button
          className={`${styles.controlButton} ${styles.closeButton}`}
          onClick={closeWindow}
          aria-label="Close"
        >
          <div className={styles.iconWrapper}>
            <CloseIcon />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TitleBar; 
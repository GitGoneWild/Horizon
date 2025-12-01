/**
 * @file Application Menu for Horizon browser
 * @description Creates the application menu bar with all browser options
 * @module menu/applicationMenu
 */

'use strict';

const { Menu, shell, app, dialog } = require('electron');

/**
 * Creates the application menu
 * @param {Object} managers - Manager instances
 * @param {TabManager} managers.tabManager - Tab manager instance
 * @param {ProfileManager} managers.profileManager - Profile manager instance
 * @param {SettingsManager} managers.settingsManager - Settings manager instance
 * @param {BrowserWindow} managers.mainWindow - Main browser window
 * @returns {Menu} Electron Menu instance
 */
function createApplicationMenu({ tabManager, profileManager, settingsManager, mainWindow }) {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://settings' });
            }
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            if (tabManager) {
              tabManager.createTab();
            }
          }
        },
        {
          label: 'New Incognito Tab',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            if (tabManager) {
              tabManager.createIncognitoTab();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (tabManager) {
              tabManager.closeCurrentTab();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save Page As...',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            if (mainWindow && mainWindow.webContents) {
              const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
                defaultPath: 'page.html',
                filters: [
                  { name: 'HTML Files', extensions: ['html', 'htm'] },
                  { name: 'All Files', extensions: ['*'] }
                ]
              });
              if (!canceled && filePath) {
                // Would save the current page
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Print...',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.print();
            }
          }
        },
        { type: 'separator' },
        ...(isMac ? [] : [
          {
            label: 'Exit',
            accelerator: 'Alt+F4',
            click: () => app.quit()
          }
        ])
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find...',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            // Would open find in page
            if (mainWindow) {
              mainWindow.webContents.send('toggle-find');
            }
          }
        }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (tabManager) {
              tabManager.refresh();
            }
          }
        },
        {
          label: 'Hard Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (tabManager) {
              tabManager.refresh();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              const zoom = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(zoom + 0.1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              const zoom = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(Math.max(0.1, zoom - 0.1));
            }
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.setZoomFactor(1.0);
            }
          }
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },

    // History menu
    {
      label: 'History',
      submenu: [
        {
          label: 'Back',
          accelerator: 'CmdOrCtrl+Left',
          click: () => {
            if (tabManager) {
              tabManager.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'CmdOrCtrl+Right',
          click: () => {
            if (tabManager) {
              tabManager.goForward();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => {
            if (tabManager && settingsManager) {
              const homepage = settingsManager.get('general.homepage', 'horizon://newtab');
              tabManager.navigate(homepage);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Show Full History',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://history' });
            }
          }
        },
        {
          label: 'Clear Browsing Data...',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://settings/privacy' });
            }
          }
        }
      ]
    },

    // Bookmarks menu
    {
      label: 'Bookmarks',
      submenu: [
        {
          label: 'Bookmark This Page',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            // Would bookmark current page
          }
        },
        {
          label: 'Show Bookmarks',
          accelerator: 'CmdOrCtrl+Shift+B',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://bookmarks' });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Import Bookmarks...',
          click: () => {
            // Would open import dialog
          }
        },
        {
          label: 'Export Bookmarks...',
          click: () => {
            // Would open export dialog
          }
        }
      ]
    },

    // Profiles menu
    {
      label: 'Profiles',
      submenu: [
        {
          label: 'Manage Profiles',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://settings/profiles' });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Create New Profile',
          click: async () => {
            if (profileManager) {
              try {
                await profileManager.createProfile({
                  name: `Profile ${profileManager.getAllProfiles().length + 1}`
                });
              } catch {
                // Handle error
              }
            }
          }
        },
        { type: 'separator' },
        // Dynamic profile list would be added here
        {
          label: 'Default Profile',
          type: 'radio',
          checked: true,
          click: () => {
            if (profileManager) {
              profileManager.setActiveProfile('default');
            }
          }
        }
      ]
    },

    // Tools menu
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Extensions',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://extensions' });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Downloads',
          accelerator: 'CmdOrCtrl+J',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://downloads' });
            }
          }
        },
        {
          label: 'Password Manager',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://passwords' });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: isMac ? '' : 'CmdOrCtrl+,',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://settings' });
            }
          }
        }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Horizon Help',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://help' });
            }
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://shortcuts' });
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Report an Issue',
          click: () => {
            shell.openExternal('https://github.com/GitGoneWild/Horizon/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'About Horizon',
          click: () => {
            if (tabManager) {
              tabManager.createTab({ url: 'horizon://about' });
            }
          }
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

module.exports = { createApplicationMenu };

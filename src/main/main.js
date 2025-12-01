/**
 * @file Main Electron process for UltraBrowse browser
 * @description Entry point for the browser application, handles window management,
 * IPC communication, security policies, and core browser functionality
 * @module main
 */

'use strict';

const { app, BrowserWindow, ipcMain, session, Menu, globalShortcut, nativeTheme, protocol } = require('electron');
const path = require('path');
const { ProfileManager } = require('./profiles/profileManager');
const { SessionManager } = require('./sessions/sessionManager');
const { TabManager } = require('./tabs/tabManager');
const { SecurityManager } = require('./security/securityManager');
const { CredentialManager } = require('./credentials/credentialManager');
const { ExtensionManager } = require('./extensions/extensionManager');
const { SettingsManager } = require('./settings/settingsManager');
const { createApplicationMenu } = require('./menu/applicationMenu');
const { setupIpcHandlers } = require('./ipc/ipcHandlers');
const { Logger } = require('./utils/logger');

/** @type {BrowserWindow|null} Main browser window instance */
let mainWindow = null;

/** @type {ProfileManager} Profile management instance */
let profileManager = null;

/** @type {SessionManager} Session management instance */
let sessionManager = null;

/** @type {TabManager} Tab management instance */
let tabManager = null;

/** @type {SecurityManager} Security management instance */
let securityManager = null;

/** @type {CredentialManager} Credential management instance */
let credentialManager = null;

/** @type {ExtensionManager} Extension management instance */
let extensionManager = null;

/** @type {SettingsManager} Settings management instance */
let settingsManager = null;

/** @type {Logger} Application logger */
const logger = new Logger('main');

/**
 * Application configuration constants
 * @constant {Object}
 */
const APP_CONFIG = {
  /** Minimum window width in pixels */
  MIN_WIDTH: 800,
  /** Minimum window height in pixels */
  MIN_HEIGHT: 600,
  /** Default window width in pixels */
  DEFAULT_WIDTH: 1280,
  /** Default window height in pixels */
  DEFAULT_HEIGHT: 800,
  /** Default homepage URL */
  DEFAULT_HOMEPAGE: 'ultrabrowse://newtab',
  /** Default search engine */
  DEFAULT_SEARCH_ENGINE: 'https://duckduckgo.com/?q=',
  /** Application protocol */
  PROTOCOL: 'ultrabrowse'
};

/**
 * Creates the main browser window with security configurations
 * @async
 * @returns {Promise<BrowserWindow>} The created browser window
 */
async function createMainWindow() {
  logger.info('Creating main browser window');

  // Initialize managers before window creation
  await initializeManagers();

  // Get user preferences for window state
  const windowState = settingsManager.get('windowState', {
    width: APP_CONFIG.DEFAULT_WIDTH,
    height: APP_CONFIG.DEFAULT_HEIGHT
  });

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: APP_CONFIG.MIN_WIDTH,
    minHeight: APP_CONFIG.MIN_HEIGHT,
    x: windowState.x,
    y: windowState.y,
    title: 'UltraBrowse',
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      webviewTag: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // Enable hardware acceleration
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-accelerated-video-decode');

  // Security: Disable navigation to external protocols
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ultrabrowse://')) {
      return { action: 'allow' };
    }
    logger.warn(`Blocked window open: ${url}`);
    return { action: 'deny' };
  });

  // Load the browser chrome
  await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    logger.info('Main window ready and visible');
  });

  // Save window state on close
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    settingsManager.set('windowState', bounds);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Initializes all manager instances
 * @async
 * @returns {Promise<void>}
 */
async function initializeManagers() {
  logger.info('Initializing managers');

  settingsManager = new SettingsManager();
  await settingsManager.initialize();

  securityManager = new SecurityManager();
  await securityManager.initialize();

  profileManager = new ProfileManager();
  await profileManager.initialize();

  sessionManager = new SessionManager(profileManager);
  await sessionManager.initialize();

  credentialManager = new CredentialManager();
  await credentialManager.initialize();

  extensionManager = new ExtensionManager();
  await extensionManager.initialize();

  tabManager = new TabManager(sessionManager);
  await tabManager.initialize();

  logger.info('All managers initialized successfully');
}

/**
 * Registers custom protocol handlers for the browser
 * @returns {void}
 */
function registerProtocols() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_CONFIG.PROTOCOL,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true
      }
    }
  ]);
}

/**
 * Sets up content security policy for the default session
 * @returns {void}
 */
function setupSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' ultrabrowse:;",
          "script-src 'self' 'unsafe-inline';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: https:;",
          "connect-src 'self' https:;"
        ].join(' ')
      }
    });
  });
}

/**
 * Registers global keyboard shortcuts
 * @returns {void}
 */
function registerShortcuts() {
  // Incognito mode shortcut
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    if (tabManager) {
      tabManager.createIncognitoTab();
    }
  });

  // New tab shortcut
  globalShortcut.register('CommandOrControl+T', () => {
    if (tabManager) {
      tabManager.createTab();
    }
  });

  // Close tab shortcut
  globalShortcut.register('CommandOrControl+W', () => {
    if (tabManager) {
      tabManager.closeCurrentTab();
    }
  });

  // Developer tools shortcut
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  logger.info('Global shortcuts registered');
}

/**
 * Application ready handler
 * @async
 * @returns {Promise<void>}
 */
async function onReady() {
  logger.info('Application starting...');

  try {
    // Register custom protocols before app ready
    registerProtocols();

    // Create the main browser window
    await createMainWindow();

    // Setup security policies
    setupSecurityPolicy();

    // Setup IPC handlers
    setupIpcHandlers(ipcMain, {
      tabManager,
      profileManager,
      sessionManager,
      credentialManager,
      extensionManager,
      settingsManager,
      securityManager,
      mainWindow
    });

    // Create application menu
    const menu = createApplicationMenu({
      tabManager,
      profileManager,
      settingsManager,
      mainWindow
    });
    Menu.setApplicationMenu(menu);

    // Register keyboard shortcuts
    registerShortcuts();

    logger.info('Application ready');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    app.quit();
  }
}

/**
 * Handles all windows closed event
 * @returns {void}
 */
function onWindowAllClosed() {
  // On macOS, keep app running until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

/**
 * Handles application activation (macOS)
 * @async
 * @returns {Promise<void>}
 */
async function onActivate() {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
}

/**
 * Cleanup before quit
 * @returns {void}
 */
function onBeforeQuit() {
  logger.info('Application shutting down...');
  globalShortcut.unregisterAll();
}

// Security: Prevent new windows from being created
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Prevent navigation to dangerous URLs
  contents.on('will-navigate', (event, url) => {
    if (!securityManager || !securityManager.isUrlSafe(url)) {
      logger.warn(`Blocked navigation to: ${url}`);
      event.preventDefault();
    }
  });
});

// Application lifecycle events
app.whenReady().then(onReady);
app.on('window-all-closed', onWindowAllClosed);
app.on('activate', onActivate);
app.on('before-quit', onBeforeQuit);

// Export for testing
module.exports = {
  createMainWindow,
  initializeManagers,
  APP_CONFIG
};

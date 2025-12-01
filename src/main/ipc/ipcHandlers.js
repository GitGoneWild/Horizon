/**
 * @file IPC Handlers for Horizon browser
 * @description Sets up Inter-Process Communication handlers for renderer-main communication
 * @module ipc/ipcHandlers
 */

'use strict';

/**
 * Sets up all IPC handlers for the browser
 * @param {Electron.IpcMain} ipcMain - Electron IPC main instance
 * @param {Object} managers - All manager instances
 * @returns {void}
 */
function setupIpcHandlers(ipcMain, managers) {
  const {
    tabManager,
    profileManager,
    sessionManager: _sessionManager, // Reserved for future use
    credentialManager,
    extensionManager,
    settingsManager,
    securityManager,
    mainWindow
  } = managers;

  // ===== Tab Management =====

  /**
   * Create a new tab
   */
  ipcMain.handle('tab:create', async (_, options = {}) => {
    if (!tabManager) {
      return null;
    }
    return tabManager.createTab(options);
  });

  /**
   * Close a tab
   */
  ipcMain.handle('tab:close', async (_, tabId) => {
    if (!tabManager) {
      return false;
    }
    return tabManager.closeTab(tabId);
  });

  /**
   * Activate a tab
   */
  ipcMain.handle('tab:activate', async (_, tabId) => {
    if (!tabManager) {
      return false;
    }
    return tabManager.activateTab(tabId);
  });

  /**
   * Get all tabs
   */
  ipcMain.handle('tab:getAll', async () => {
    if (!tabManager) {
      return [];
    }
    return tabManager.getAllTabs();
  });

  /**
   * Get active tab
   */
  ipcMain.handle('tab:getActive', async () => {
    if (!tabManager) {
      return null;
    }
    return tabManager.getActiveTab();
  });

  /**
   * Navigate to URL
   */
  ipcMain.handle('tab:navigate', async (_, url) => {
    if (!tabManager || !securityManager) {
      return false;
    }
    const result = securityManager.sanitizeUrl(url);
    if (result.isValid) {
      return tabManager.navigate(result.sanitizedUrl);
    }
    return false;
  });

  /**
   * Go back in history
   */
  ipcMain.handle('tab:goBack', async () => {
    if (!tabManager) {
      return false;
    }
    return tabManager.goBack();
  });

  /**
   * Go forward in history
   */
  ipcMain.handle('tab:goForward', async () => {
    if (!tabManager) {
      return false;
    }
    return tabManager.goForward();
  });

  /**
   * Refresh current tab
   */
  ipcMain.handle('tab:refresh', async () => {
    if (!tabManager) {
      return false;
    }
    return tabManager.refresh();
  });

  /**
   * Stop loading
   */
  ipcMain.handle('tab:stop', async () => {
    if (!tabManager) {
      return false;
    }
    return tabManager.stop();
  });

  // ===== Profile Management =====

  /**
   * Get all profiles
   */
  ipcMain.handle('profile:getAll', async () => {
    if (!profileManager) {
      return [];
    }
    return profileManager.getAllProfiles();
  });

  /**
   * Get active profile
   */
  ipcMain.handle('profile:getActive', async () => {
    if (!profileManager) {
      return null;
    }
    return profileManager.getActiveProfile();
  });

  /**
   * Create a new profile
   */
  ipcMain.handle('profile:create', async (_, options) => {
    if (!profileManager) {
      return null;
    }
    return profileManager.createProfile(options);
  });

  /**
   * Delete a profile
   */
  ipcMain.handle('profile:delete', async (_, profileId) => {
    if (!profileManager) {
      return false;
    }
    return profileManager.deleteProfile(profileId);
  });

  /**
   * Update a profile
   */
  ipcMain.handle('profile:update', async (_, profileId, updates) => {
    if (!profileManager) {
      return null;
    }
    return profileManager.updateProfile(profileId, updates);
  });

  /**
   * Switch active profile
   */
  ipcMain.handle('profile:setActive', async (_, profileId) => {
    if (!profileManager) {
      return false;
    }
    return profileManager.setActiveProfile(profileId);
  });

  // ===== Credential Management =====

  /**
   * Save a credential
   */
  ipcMain.handle('credential:save', async (_, credential) => {
    if (!credentialManager) {
      return null;
    }
    return credentialManager.saveCredential(credential);
  });

  /**
   * Get credentials for a URL
   */
  ipcMain.handle('credential:getForUrl', async (_, url) => {
    if (!credentialManager) {
      return [];
    }
    return credentialManager.getCredentialsForUrl(url);
  });

  /**
   * Get credential with password (for autofill)
   */
  ipcMain.handle('credential:getWithPassword', async (_, credentialId) => {
    if (!credentialManager) {
      return null;
    }
    return credentialManager.getCredentialWithPassword(credentialId);
  });

  /**
   * Delete a credential
   */
  ipcMain.handle('credential:delete', async (_, credentialId) => {
    if (!credentialManager) {
      return false;
    }
    return credentialManager.deleteCredential(credentialId);
  });

  /**
   * Get all credentials (sanitized)
   */
  ipcMain.handle('credential:getAll', async () => {
    if (!credentialManager) {
      return [];
    }
    return credentialManager.getAllCredentials();
  });

  /**
   * Generate a password
   */
  ipcMain.handle('credential:generatePassword', async (_, options) => {
    if (!credentialManager) {
      return '';
    }
    return credentialManager.generatePassword(options?.length, options);
  });

  /**
   * Check password strength
   */
  ipcMain.handle('credential:checkStrength', async (_, password) => {
    if (!credentialManager) {
      return { score: 0, level: 'weak', suggestions: [] };
    }
    return credentialManager.assessPasswordStrength(password);
  });

  // ===== Extension Management =====

  /**
   * Get all extensions
   */
  ipcMain.handle('extension:getAll', async () => {
    if (!extensionManager) {
      return [];
    }
    return extensionManager.getExtensionStatus();
  });

  /**
   * Enable/disable extension
   */
  ipcMain.handle('extension:setEnabled', async (_, extensionId, enabled) => {
    if (!extensionManager) {
      return false;
    }
    return extensionManager.setExtensionEnabled(extensionId, enabled);
  });

  /**
   * Install extension from CRX
   */
  ipcMain.handle('extension:install', async (_, crxPath) => {
    if (!extensionManager) {
      return null;
    }
    return extensionManager.installFromCrx(crxPath);
  });

  /**
   * Uninstall extension
   */
  ipcMain.handle('extension:uninstall', async (_, extensionId) => {
    if (!extensionManager) {
      return false;
    }
    return extensionManager.uninstallExtension(extensionId);
  });

  // ===== Settings Management =====

  /**
   * Get a setting
   */
  ipcMain.handle('settings:get', async (_, key, defaultValue) => {
    if (!settingsManager) {
      return defaultValue;
    }
    return settingsManager.get(key, defaultValue);
  });

  /**
   * Set a setting
   */
  ipcMain.handle('settings:set', async (_, key, value) => {
    if (!settingsManager) {
      return;
    }
    settingsManager.set(key, value);
  });

  /**
   * Get all settings
   */
  ipcMain.handle('settings:getAll', async () => {
    if (!settingsManager) {
      return {};
    }
    return settingsManager.getAllSettings();
  });

  /**
   * Get settings for a category
   */
  ipcMain.handle('settings:getCategory', async (_, category) => {
    if (!settingsManager) {
      return {};
    }
    return settingsManager.getCategory(category);
  });

  /**
   * Reset settings to defaults
   */
  ipcMain.handle('settings:reset', async (_, category) => {
    if (!settingsManager) {
      return;
    }
    settingsManager.resetToDefaults(category);
  });

  /**
   * Get search engines
   */
  ipcMain.handle('settings:getSearchEngines', async () => {
    if (!settingsManager) {
      return {};
    }
    return settingsManager.getSearchEngines();
  });

  /**
   * Set search engine
   */
  ipcMain.handle('settings:setSearchEngine', async (_, engineId) => {
    if (!settingsManager) {
      return false;
    }
    return settingsManager.setSearchEngine(engineId);
  });

  // ===== Security =====

  /**
   * Check if URL is safe
   */
  ipcMain.handle('security:isUrlSafe', async (_, url) => {
    if (!securityManager) {
      return true;
    }
    return securityManager.isUrlSafe(url);
  });

  /**
   * Sanitize URL
   */
  ipcMain.handle('security:sanitizeUrl', async (_, url) => {
    if (!securityManager) {
      return { isValid: false, sanitizedUrl: null };
    }
    return securityManager.sanitizeUrl(url);
  });

  /**
   * Get security settings
   */
  ipcMain.handle('security:getSettings', async () => {
    if (!securityManager) {
      return {};
    }
    return securityManager.getSettings();
  });

  // ===== Advanced Browsing Features =====

  /**
   * Zoom in current tab
   */
  ipcMain.handle('tab:zoomIn', async () => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      const currentZoom = view.webContents.getZoomLevel();
      view.webContents.setZoomLevel(Math.min(currentZoom + 0.5, 5));
      return true;
    }
    return false;
  });

  /**
   * Zoom out current tab
   */
  ipcMain.handle('tab:zoomOut', async () => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      const currentZoom = view.webContents.getZoomLevel();
      view.webContents.setZoomLevel(Math.max(currentZoom - 0.5, -3));
      return true;
    }
    return false;
  });

  /**
   * Reset zoom level
   */
  ipcMain.handle('tab:zoomReset', async () => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      view.webContents.setZoomLevel(0);
      return true;
    }
    return false;
  });

  /**
   * Get current zoom level
   */
  ipcMain.handle('tab:getZoomLevel', async () => {
    if (!tabManager) {
      return 0;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      return view.webContents.getZoomLevel();
    }
    return 0;
  });

  /**
   * Find in page
   */
  ipcMain.handle('tab:findInPage', async (_, text, options = {}) => {
    if (!tabManager || !text) {
      return null;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      return view.webContents.findInPage(text, options);
    }
    return null;
  });

  /**
   * Stop find in page
   */
  ipcMain.handle('tab:stopFindInPage', async (_, action = 'clearSelection') => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      view.webContents.stopFindInPage(action);
      return true;
    }
    return false;
  });

  /**
   * Print current page
   */
  ipcMain.handle('tab:print', async (_, options = {}) => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      view.webContents.print(options);
      return true;
    }
    return false;
  });

  /**
   * Toggle developer tools
   */
  ipcMain.handle('tab:toggleDevTools', async () => {
    if (!tabManager) {
      return false;
    }
    const view = tabManager.getActiveView();
    if (view && view.webContents) {
      if (view.webContents.isDevToolsOpened()) {
        view.webContents.closeDevTools();
      } else {
        view.webContents.openDevTools();
      }
      return true;
    }
    return false;
  });

  // ===== Window/App Management =====

  /**
   * Minimize window
   */
  ipcMain.handle('window:minimize', async () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  /**
   * Maximize/unmaximize window
   */
  ipcMain.handle('window:toggleMaximize', async () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  /**
   * Close window
   */
  ipcMain.handle('window:close', async () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  /**
   * Check if window is maximized
   */
  ipcMain.handle('window:isMaximized', async () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  /**
   * Get app version
   */
  ipcMain.handle('app:getVersion', async () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  /**
   * Open external URL
   */
  ipcMain.handle('app:openExternal', async (_, url) => {
    const { shell } = require('electron');
    if (securityManager && securityManager.isUrlSafe(url)) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });
}

module.exports = { setupIpcHandlers };

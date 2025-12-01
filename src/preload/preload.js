/**
 * @file Preload script for UltraBrowse browser chrome
 * @description Exposes secure IPC API to renderer process via contextBridge
 * @module preload/preload
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure API exposed to renderer process
 * All IPC calls are wrapped for security
 */
contextBridge.exposeInMainWorld('ultraBrowse', {
  // ===== Tab Management =====
  tabs: {
    /**
     * Creates a new tab
     * @param {Object} [options] - Tab options
     * @returns {Promise<Object>} Created tab
     */
    create: (options) => ipcRenderer.invoke('tab:create', options),

    /**
     * Closes a tab
     * @param {string} tabId - Tab ID
     * @returns {Promise<boolean>} Success status
     */
    close: (tabId) => ipcRenderer.invoke('tab:close', tabId),

    /**
     * Activates a tab
     * @param {string} tabId - Tab ID
     * @returns {Promise<boolean>} Success status
     */
    activate: (tabId) => ipcRenderer.invoke('tab:activate', tabId),

    /**
     * Gets all tabs
     * @returns {Promise<Array>} Tab list
     */
    getAll: () => ipcRenderer.invoke('tab:getAll'),

    /**
     * Gets active tab
     * @returns {Promise<Object>} Active tab
     */
    getActive: () => ipcRenderer.invoke('tab:getActive'),

    /**
     * Navigates to URL
     * @param {string} url - URL to navigate to
     * @returns {Promise<boolean>} Success status
     */
    navigate: (url) => ipcRenderer.invoke('tab:navigate', url),

    /**
     * Goes back in history
     * @returns {Promise<boolean>} Success status
     */
    goBack: () => ipcRenderer.invoke('tab:goBack'),

    /**
     * Goes forward in history
     * @returns {Promise<boolean>} Success status
     */
    goForward: () => ipcRenderer.invoke('tab:goForward'),

    /**
     * Refreshes current tab
     * @returns {Promise<boolean>} Success status
     */
    refresh: () => ipcRenderer.invoke('tab:refresh'),

    /**
     * Stops loading
     * @returns {Promise<boolean>} Success status
     */
    stop: () => ipcRenderer.invoke('tab:stop'),

    /**
     * Listens for tab updates
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onUpdate: (callback) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('tab:updated', handler);
      return () => ipcRenderer.removeListener('tab:updated', handler);
    }
  },

  // ===== Profile Management =====
  profiles: {
    /**
     * Gets all profiles
     * @returns {Promise<Array>} Profile list
     */
    getAll: () => ipcRenderer.invoke('profile:getAll'),

    /**
     * Gets active profile
     * @returns {Promise<Object>} Active profile
     */
    getActive: () => ipcRenderer.invoke('profile:getActive'),

    /**
     * Creates a new profile
     * @param {Object} options - Profile options
     * @returns {Promise<Object>} Created profile
     */
    create: (options) => ipcRenderer.invoke('profile:create', options),

    /**
     * Deletes a profile
     * @param {string} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
    delete: (profileId) => ipcRenderer.invoke('profile:delete', profileId),

    /**
     * Updates a profile
     * @param {string} profileId - Profile ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated profile
     */
    update: (profileId, updates) => ipcRenderer.invoke('profile:update', profileId, updates),

    /**
     * Sets active profile
     * @param {string} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
    setActive: (profileId) => ipcRenderer.invoke('profile:setActive', profileId)
  },

  // ===== Credential Management =====
  credentials: {
    /**
     * Saves a credential
     * @param {Object} credential - Credential data
     * @returns {Promise<Object>} Saved credential
     */
    save: (credential) => ipcRenderer.invoke('credential:save', credential),

    /**
     * Gets credentials for URL
     * @param {string} url - URL to get credentials for
     * @returns {Promise<Array>} Matching credentials
     */
    getForUrl: (url) => ipcRenderer.invoke('credential:getForUrl', url),

    /**
     * Gets all credentials
     * @returns {Promise<Array>} All credentials
     */
    getAll: () => ipcRenderer.invoke('credential:getAll'),

    /**
     * Deletes a credential
     * @param {string} credentialId - Credential ID
     * @returns {Promise<boolean>} Success status
     */
    delete: (credentialId) => ipcRenderer.invoke('credential:delete', credentialId),

    /**
     * Generates a password
     * @param {Object} [options] - Generation options
     * @returns {Promise<string>} Generated password
     */
    generatePassword: (options) => ipcRenderer.invoke('credential:generatePassword', options),

    /**
     * Checks password strength
     * @param {string} password - Password to check
     * @returns {Promise<Object>} Strength assessment
     */
    checkStrength: (password) => ipcRenderer.invoke('credential:checkStrength', password)
  },

  // ===== Extension Management =====
  extensions: {
    /**
     * Gets all extensions
     * @returns {Promise<Array>} Extension list
     */
    getAll: () => ipcRenderer.invoke('extension:getAll'),

    /**
     * Enables/disables extension
     * @param {string} extensionId - Extension ID
     * @param {boolean} enabled - Enable state
     * @returns {Promise<boolean>} Success status
     */
    setEnabled: (extensionId, enabled) => ipcRenderer.invoke('extension:setEnabled', extensionId, enabled),

    /**
     * Uninstalls extension
     * @param {string} extensionId - Extension ID
     * @returns {Promise<boolean>} Success status
     */
    uninstall: (extensionId) => ipcRenderer.invoke('extension:uninstall', extensionId)
  },

  // ===== Settings =====
  settings: {
    /**
     * Gets a setting
     * @param {string} key - Setting key
     * @param {*} [defaultValue] - Default value
     * @returns {Promise<*>} Setting value
     */
    get: (key, defaultValue) => ipcRenderer.invoke('settings:get', key, defaultValue),

    /**
     * Sets a setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {Promise<void>}
     */
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),

    /**
     * Gets all settings
     * @returns {Promise<Object>} All settings
     */
    getAll: () => ipcRenderer.invoke('settings:getAll'),

    /**
     * Gets settings category
     * @param {string} category - Category name
     * @returns {Promise<Object>} Category settings
     */
    getCategory: (category) => ipcRenderer.invoke('settings:getCategory', category),

    /**
     * Resets settings
     * @param {string} [category] - Category to reset
     * @returns {Promise<void>}
     */
    reset: (category) => ipcRenderer.invoke('settings:reset', category),

    /**
     * Gets search engines
     * @returns {Promise<Object>} Search engines
     */
    getSearchEngines: () => ipcRenderer.invoke('settings:getSearchEngines'),

    /**
     * Sets search engine
     * @param {string} engineId - Engine ID
     * @returns {Promise<boolean>} Success status
     */
    setSearchEngine: (engineId) => ipcRenderer.invoke('settings:setSearchEngine', engineId)
  },

  // ===== Security =====
  security: {
    /**
     * Checks if URL is safe
     * @param {string} url - URL to check
     * @returns {Promise<boolean>} Safety status
     */
    isUrlSafe: (url) => ipcRenderer.invoke('security:isUrlSafe', url),

    /**
     * Sanitizes URL
     * @param {string} url - URL to sanitize
     * @returns {Promise<Object>} Sanitization result
     */
    sanitizeUrl: (url) => ipcRenderer.invoke('security:sanitizeUrl', url)
  },

  // ===== Window Management =====
  window: {
    /**
     * Minimizes window
     * @returns {Promise<void>}
     */
    minimize: () => ipcRenderer.invoke('window:minimize'),

    /**
     * Toggles maximize
     * @returns {Promise<void>}
     */
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),

    /**
     * Closes window
     * @returns {Promise<void>}
     */
    close: () => ipcRenderer.invoke('window:close'),

    /**
     * Checks if maximized
     * @returns {Promise<boolean>} Maximized state
     */
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  // ===== App Info =====
  app: {
    /**
     * Gets app version
     * @returns {Promise<string>} App version
     */
    getVersion: () => ipcRenderer.invoke('app:getVersion'),

    /**
     * Opens external URL
     * @param {string} url - URL to open
     * @returns {Promise<boolean>} Success status
     */
    openExternal: (url) => ipcRenderer.invoke('app:openExternal', url)
  }
});

// Notify main process that preload is ready
ipcRenderer.send('preload-ready');

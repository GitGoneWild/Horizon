/**
 * @file Settings Manager for Horizon browser
 * @description Handles persistent storage and management of user preferences
 * @module settings/settingsManager
 */

'use strict';

const Store = require('electron-store');

/**
 * Default browser settings
 * @constant {Object}
 */
const DEFAULT_SETTINGS = {
  // General settings
  general: {
    homepage: 'horizon://newtab',
    searchEngine: 'duckduckgo',
    searchEngineUrl: 'https://duckduckgo.com/?q=',
    startupBehavior: 'lastSession', // 'homepage', 'lastSession', 'blank'
    downloadLocation: null, // null = ask each time
    language: 'en-US'
  },

  // Appearance settings
  appearance: {
    theme: 'system', // 'light', 'dark', 'system'
    fontSize: 'medium', // 'small', 'medium', 'large'
    showBookmarksBar: true,
    showHomeButton: true,
    compactMode: false
  },

  // Privacy settings
  privacy: {
    doNotTrack: true,
    blockThirdPartyCookies: true,
    clearDataOnExit: false,
    fingerprintProtection: true,
    blockTrackers: true,
    httpsOnly: false
  },

  // Security settings
  security: {
    safeBrowsing: true,
    blockMixedContent: true,
    warnOnUnsecurePasswords: true,
    blockDangerousDownloads: true
  },

  // Performance settings
  performance: {
    hardwareAcceleration: true,
    lazyLoadTabs: true,
    suspendInactiveTabs: true,
    inactiveTabTimeout: 30, // minutes
    preloadTopSites: true
  },

  // Sync settings (placeholder for future feature)
  sync: {
    enabled: false,
    bookmarks: true,
    history: true,
    passwords: true,
    extensions: true
  }
};

/**
 * Available search engines
 * @constant {Object}
 */
const SEARCH_ENGINES = {
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: 'duckduckgo.png'
  },
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'google.png'
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'bing.png'
  },
  startpage: {
    name: 'Startpage',
    url: 'https://www.startpage.com/search?q=',
    icon: 'startpage.png'
  },
  ecosia: {
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    icon: 'ecosia.png'
  }
};

/**
 * Manages browser settings with persistence
 * @class SettingsManager
 */
class SettingsManager {
  /**
   * Creates a new SettingsManager instance
   */
  constructor() {
    /** @type {Store} Persistent settings storage */
    this.store = new Store({
      name: 'settings',
      defaults: DEFAULT_SETTINGS
    });

    /** @type {Array<Function>} Settings change listeners */
    this.listeners = [];
  }

  /**
   * Initializes the settings manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Validate and migrate settings if needed
    this.validateSettings();
  }

  /**
   * Validates and migrates settings to current schema
   * @private
   * @returns {void}
   */
  validateSettings() {
    // Ensure all default settings exist
    for (const [category, defaults] of Object.entries(DEFAULT_SETTINGS)) {
      const current = this.store.get(category, {});
      const merged = { ...defaults, ...current };
      this.store.set(category, merged);
    }
  }

  /**
   * Gets a setting value
   * @param {string} key - Dot-notation key (e.g., 'general.homepage')
   * @param {*} [defaultValue] - Default value if not found
   * @returns {*} The setting value
   */
  get(key, defaultValue) {
    return this.store.get(key, defaultValue);
  }

  /**
   * Sets a setting value
   * @param {string} key - Dot-notation key
   * @param {*} value - Value to set
   * @returns {void}
   */
  set(key, value) {
    const oldValue = this.store.get(key);
    this.store.set(key, value);
    this.notifyListeners(key, value, oldValue);
  }

  /**
   * Gets all settings for a category
   * @param {string} category - Category name
   * @returns {Object} Category settings
   */
  getCategory(category) {
    return this.store.get(category, DEFAULT_SETTINGS[category] || {});
  }

  /**
   * Sets all settings for a category
   * @param {string} category - Category name
   * @param {Object} settings - Settings object
   * @returns {void}
   */
  setCategory(category, settings) {
    const oldSettings = this.store.get(category);
    const merged = { ...oldSettings, ...settings };
    this.store.set(category, merged);
    this.notifyListeners(category, merged, oldSettings);
  }

  /**
   * Gets all settings
   * @returns {Object} All settings
   */
  getAllSettings() {
    const settings = {};
    for (const category of Object.keys(DEFAULT_SETTINGS)) {
      settings[category] = this.getCategory(category);
    }
    return settings;
  }

  /**
   * Resets settings to defaults
   * @param {string} [category] - Optional category to reset, or all if not provided
   * @returns {void}
   */
  resetToDefaults(category) {
    if (category && DEFAULT_SETTINGS[category]) {
      this.store.set(category, DEFAULT_SETTINGS[category]);
      this.notifyListeners(category, DEFAULT_SETTINGS[category], null);
    } else {
      this.store.clear();
      for (const [cat, defaults] of Object.entries(DEFAULT_SETTINGS)) {
        this.store.set(cat, defaults);
      }
      this.notifyListeners('*', DEFAULT_SETTINGS, null);
    }
  }

  /**
   * Gets available search engines
   * @returns {Object} Search engines configuration
   */
  getSearchEngines() {
    return SEARCH_ENGINES;
  }

  /**
   * Gets the current search engine URL
   * @returns {string} Search engine URL with query placeholder
   */
  getSearchUrl() {
    const engineId = this.get('general.searchEngine', 'duckduckgo');
    const engine = SEARCH_ENGINES[engineId];
    return engine ? engine.url : SEARCH_ENGINES.duckduckgo.url;
  }

  /**
   * Sets the search engine
   * @param {string} engineId - Search engine identifier
   * @returns {boolean} True if successful
   */
  setSearchEngine(engineId) {
    if (!SEARCH_ENGINES[engineId]) {
      return false;
    }

    this.set('general.searchEngine', engineId);
    this.set('general.searchEngineUrl', SEARCH_ENGINES[engineId].url);
    return true;
  }

  /**
   * Gets the current theme
   * @returns {string} Theme name
   */
  getTheme() {
    return this.get('appearance.theme', 'system');
  }

  /**
   * Sets the theme
   * @param {string} theme - Theme name ('light', 'dark', 'system')
   * @returns {void}
   */
  setTheme(theme) {
    if (['light', 'dark', 'system'].includes(theme)) {
      this.set('appearance.theme', theme);
    }
  }

  /**
   * Checks if hardware acceleration is enabled
   * @returns {boolean} True if enabled
   */
  isHardwareAccelerationEnabled() {
    return this.get('performance.hardwareAcceleration', true);
  }

  /**
   * Checks if HTTPS-only mode is enabled
   * @returns {boolean} True if enabled
   */
  isHttpsOnlyMode() {
    return this.get('privacy.httpsOnly', false);
  }

  /**
   * Adds a settings change listener
   * @param {Function} listener - Callback function(key, newValue, oldValue)
   * @returns {void}
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Removes a settings change listener
   * @param {Function} listener - Listener to remove
   * @returns {void}
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifies listeners of a setting change
   * @private
   * @param {string} key - Changed setting key
   * @param {*} newValue - New value
   * @param {*} oldValue - Previous value
   * @returns {void}
   */
  notifyListeners(key, newValue, oldValue) {
    for (const listener of this.listeners) {
      try {
        listener(key, newValue, oldValue);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Exports settings as JSON
   * @returns {Object} Settings export object
   */
  exportSettings() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getAllSettings()
    };
  }

  /**
   * Imports settings from JSON
   * @param {Object} importData - Settings to import
   * @returns {boolean} True if successful
   */
  importSettings(importData) {
    if (!importData || !importData.settings) {
      return false;
    }

    try {
      for (const [category, settings] of Object.entries(importData.settings)) {
        if (DEFAULT_SETTINGS[category]) {
          this.setCategory(category, settings);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = { SettingsManager, DEFAULT_SETTINGS, SEARCH_ENGINES };

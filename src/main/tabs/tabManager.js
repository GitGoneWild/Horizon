/**
 * @file Tab Manager for Horizon browser
 * @description Handles tab creation, navigation, and lifecycle management
 * @module tabs/tabManager
 */

'use strict';

const { BrowserView } = require('electron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * Default tab configuration
 * @constant {Object}
 */
const DEFAULT_TAB_CONFIG = {
  url: 'horizon://newtab',
  title: 'New Tab',
  isActive: false,
  isLoading: false,
  canGoBack: false,
  canGoForward: false,
  favicon: null,
  isIncognito: false
};

/**
 * Browser chrome height in pixels (title bar + tab bar + nav bar)
 * @constant {number}
 */
const TOOLBAR_HEIGHT = 80;

/**
 * Manages browser tabs with webview isolation
 * @class TabManager
 */
class TabManager {
  /**
   * Creates a new TabManager instance
   * @param {SessionManager} sessionManager - Session manager instance
   */
  constructor(sessionManager) {
    /** @type {SessionManager} Session manager reference */
    this.sessionManager = sessionManager;

    /** @type {Map<string, Object>} Map of tab IDs to tab data */
    this.tabs = new Map();

    /** @type {Map<string, BrowserView>} Map of tab IDs to BrowserViews */
    this.views = new Map();

    /** @type {string|null} Currently active tab ID */
    this.activeTabId = null;

    /** @type {BrowserWindow|null} Parent window reference */
    this.parentWindow = null;

    /** @type {Array<Function>} Tab change listeners */
    this.listeners = [];
  }

  /**
   * Initializes the tab manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Initial setup is handled when parent window is set
  }

  /**
   * Sets the parent window for tabs
   * @param {BrowserWindow} window - The parent browser window
   * @returns {void}
   */
  setParentWindow(window) {
    this.parentWindow = window;

    // Handle window resize
    window.on('resize', () => {
      this.updateActiveViewBounds();
    });
  }

  /**
   * Creates a new tab
   * @param {Object} options - Tab creation options
   * @param {string} [options.url='horizon://newtab'] - Initial URL
   * @param {string} [options.profileId='default'] - Profile ID for session
   * @param {boolean} [options.isIncognito=false] - Whether tab is incognito
   * @param {boolean} [options.activate=true] - Whether to activate the tab
   * @returns {Object} The created tab data
   */
  createTab({ url = 'horizon://newtab', profileId = 'default', isIncognito = false, activate = true } = {}) {
    const tabId = uuidv4();

    // Get appropriate session
    let tabSession;
    let sessionId;

    if (isIncognito) {
      const result = this.sessionManager.createIncognitoSession();
      tabSession = result.session;
      sessionId = result.sessionId;
    } else {
      tabSession = this.sessionManager.getSessionForProfile(profileId);
      sessionId = profileId;
    }

    // Create BrowserView for the tab
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        session: tabSession,
        preload: path.join(__dirname, '../../preload/webview-preload.js'),
        webviewTag: false,
        allowRunningInsecureContent: false
      }
    });

    // Create tab data
    const tab = {
      ...DEFAULT_TAB_CONFIG,
      id: tabId,
      url,
      profileId,
      sessionId,
      isIncognito,
      createdAt: new Date().toISOString()
    };

    // Store tab and view
    this.tabs.set(tabId, tab);
    this.views.set(tabId, view);

    // Setup webContents event listeners
    this.setupViewEventListeners(tabId, view);

    // Navigate to URL
    view.webContents.loadURL(url).catch(() => {
      // Handle load errors gracefully
      view.webContents.loadURL('horizon://error');
    });

    // Activate if requested
    if (activate) {
      this.activateTab(tabId);
    }

    this.notifyListeners('tab-created', tab);
    return tab;
  }

  /**
   * Creates a new incognito tab
   * @param {string} [url='horizon://newtab'] - Initial URL
   * @returns {Object} The created incognito tab data
   */
  createIncognitoTab(url = 'horizon://newtab') {
    return this.createTab({ url, isIncognito: true, activate: true });
  }

  /**
   * Sets up event listeners for a BrowserView
   * @param {string} tabId - The tab ID
   * @param {BrowserView} view - The BrowserView instance
   * @returns {void}
   */
  setupViewEventListeners(tabId, view) {
    const webContents = view.webContents;

    webContents.on('did-start-loading', () => {
      this.updateTab(tabId, { isLoading: true });
    });

    webContents.on('did-stop-loading', () => {
      this.updateTab(tabId, { isLoading: false });
    });

    webContents.on('did-navigate', (_, url) => {
      this.updateTab(tabId, {
        url,
        canGoBack: webContents.canGoBack(),
        canGoForward: webContents.canGoForward()
      });
    });

    webContents.on('did-navigate-in-page', (_, url) => {
      this.updateTab(tabId, {
        url,
        canGoBack: webContents.canGoBack(),
        canGoForward: webContents.canGoForward()
      });
    });

    webContents.on('page-title-updated', (_, title) => {
      this.updateTab(tabId, { title });
    });

    webContents.on('page-favicon-updated', (_, favicons) => {
      if (favicons && favicons.length > 0) {
        this.updateTab(tabId, { favicon: favicons[0] });
      }
    });

    webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
      if (errorCode !== -3) { // Ignore aborted loads
        this.updateTab(tabId, {
          isLoading: false,
          error: { code: errorCode, description: errorDescription }
        });
      }
    });
  }

  /**
   * Activates a tab by ID
   * @param {string} tabId - The tab ID to activate
   * @returns {boolean} True if successful
   */
  activateTab(tabId) {
    if (!this.tabs.has(tabId) || !this.parentWindow) {
      return false;
    }

    // Deactivate current tab
    if (this.activeTabId && this.activeTabId !== tabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) {
        currentTab.isActive = false;
        this.tabs.set(this.activeTabId, currentTab);
      }

      // Remove current view from window
      const currentView = this.views.get(this.activeTabId);
      if (currentView) {
        this.parentWindow.removeBrowserView(currentView);
      }
    }

    // Activate new tab
    const tab = this.tabs.get(tabId);
    tab.isActive = true;
    this.tabs.set(tabId, tab);
    this.activeTabId = tabId;

    // Add new view to window
    const view = this.views.get(tabId);
    if (view) {
      this.parentWindow.addBrowserView(view);
      this.updateActiveViewBounds();
    }

    this.notifyListeners('tab-activated', tab);
    return true;
  }

  /**
   * Updates the bounds of the active view to fill the window
   * @returns {void}
   */
  updateActiveViewBounds() {
    if (!this.activeTabId || !this.parentWindow) {
      return;
    }

    const view = this.views.get(this.activeTabId);
    if (!view) {
      return;
    }

    const bounds = this.parentWindow.getContentBounds();

    view.setBounds({
      x: 0,
      y: TOOLBAR_HEIGHT,
      width: bounds.width,
      height: bounds.height - TOOLBAR_HEIGHT
    });
  }

  /**
   * Closes a tab by ID
   * @async
   * @param {string} tabId - The tab ID to close
   * @returns {Promise<boolean>} True if successful
   */
  async closeTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return false;
    }

    // Remove view from window if active
    if (this.activeTabId === tabId && this.parentWindow) {
      const view = this.views.get(tabId);
      if (view) {
        this.parentWindow.removeBrowserView(view);
      }
    }

    // Destroy incognito session if applicable
    if (tab.isIncognito && tab.sessionId) {
      await this.sessionManager.destroyIncognitoSession(tab.sessionId);
    }

    // Destroy view
    const view = this.views.get(tabId);
    if (view && !view.webContents.isDestroyed()) {
      view.webContents.close();
    }

    // Remove from maps
    this.tabs.delete(tabId);
    this.views.delete(tabId);

    // Activate another tab if this was active
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys());
      if (remainingTabs.length > 0) {
        this.activateTab(remainingTabs[remainingTabs.length - 1]);
      } else {
        this.activeTabId = null;
        // Create a new tab if none remain
        this.createTab();
      }
    }

    this.notifyListeners('tab-closed', { id: tabId });
    return true;
  }

  /**
   * Closes the currently active tab
   * @async
   * @returns {Promise<boolean>} True if successful
   */
  async closeCurrentTab() {
    if (this.activeTabId) {
      return this.closeTab(this.activeTabId);
    }
    return false;
  }

  /**
   * Updates tab data
   * @param {string} tabId - The tab ID to update
   * @param {Object} updates - Properties to update
   * @returns {Object|null} Updated tab or null if not found
   */
  updateTab(tabId, updates) {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return null;
    }

    const updatedTab = { ...tab, ...updates };
    this.tabs.set(tabId, updatedTab);

    this.notifyListeners('tab-updated', updatedTab);
    return updatedTab;
  }

  /**
   * Gets a tab by ID
   * @param {string} tabId - The tab ID
   * @returns {Object|null} The tab data or null
   */
  getTab(tabId) {
    return this.tabs.get(tabId) || null;
  }

  /**
   * Gets all tabs
   * @returns {Array<Object>} Array of tab data objects
   */
  getAllTabs() {
    return Array.from(this.tabs.values());
  }

  /**
   * Gets the currently active tab
   * @returns {Object|null} The active tab or null
   */
  getActiveTab() {
    return this.activeTabId ? this.tabs.get(this.activeTabId) : null;
  }

  /**
   * Gets the BrowserView for the currently active tab
   * @returns {BrowserView|null} The active view or null
   */
  getActiveView() {
    if (!this.activeTabId) {
      return null;
    }
    return this.views.get(this.activeTabId) || null;
  }

  /**
   * Navigates the active tab to a URL
   * @param {string} url - The URL to navigate to
   * @returns {boolean} True if successful
   */
  navigate(url) {
    if (!this.activeTabId) {
      return false;
    }

    const view = this.views.get(this.activeTabId);
    if (!view) {
      return false;
    }

    // Validate and normalize URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('horizon://')) {
      // Check if it's a valid domain
      if (url.includes('.') && !url.includes(' ')) {
        normalizedUrl = `https://${url}`;
      } else {
        // Treat as search query
        normalizedUrl = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      }
    }

    view.webContents.loadURL(normalizedUrl);
    return true;
  }

  /**
   * Goes back in the active tab's history
   * @returns {boolean} True if successful
   */
  goBack() {
    if (!this.activeTabId) {
      return false;
    }

    const view = this.views.get(this.activeTabId);
    if (view && view.webContents.canGoBack()) {
      view.webContents.goBack();
      return true;
    }
    return false;
  }

  /**
   * Goes forward in the active tab's history
   * @returns {boolean} True if successful
   */
  goForward() {
    if (!this.activeTabId) {
      return false;
    }

    const view = this.views.get(this.activeTabId);
    if (view && view.webContents.canGoForward()) {
      view.webContents.goForward();
      return true;
    }
    return false;
  }

  /**
   * Refreshes the active tab
   * @returns {boolean} True if successful
   */
  refresh() {
    if (!this.activeTabId) {
      return false;
    }

    const view = this.views.get(this.activeTabId);
    if (view) {
      view.webContents.reload();
      return true;
    }
    return false;
  }

  /**
   * Stops loading the active tab
   * @returns {boolean} True if successful
   */
  stop() {
    if (!this.activeTabId) {
      return false;
    }

    const view = this.views.get(this.activeTabId);
    if (view) {
      view.webContents.stop();
      return true;
    }
    return false;
  }

  /**
   * Adds a listener for tab events
   * @param {Function} listener - Callback function
   * @returns {void}
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * Removes a listener
   * @param {Function} listener - Callback function to remove
   * @returns {void}
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifies all listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @returns {void}
   */
  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Gets the count of open tabs
   * @returns {number} Number of tabs
   */
  getTabCount() {
    return this.tabs.size;
  }

  /**
   * Gets the count of incognito tabs
   * @returns {number} Number of incognito tabs
   */
  getIncognitoTabCount() {
    let count = 0;
    for (const tab of this.tabs.values()) {
      if (tab.isIncognito) {
        count++;
      }
    }
    return count;
  }
}

module.exports = { TabManager, DEFAULT_TAB_CONFIG };

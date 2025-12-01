/**
 * @file Main application script for Horizon renderer
 * @description Handles UI interactions and communication with main process
 */

'use strict';

// Ensure horizon API is available
if (typeof window.horizon === 'undefined') {
  console.error('Horizon API not available. Running in development mode.');
}

/**
 * DOM Element references
 */
const elements = {
  // Navigation
  btnBack: document.getElementById('btn-back'),
  btnForward: document.getElementById('btn-forward'),
  btnRefresh: document.getElementById('btn-refresh'),
  btnHome: document.getElementById('btn-home'),
  urlInput: document.getElementById('url-input'),
  btnGo: document.getElementById('btn-go'),
  securityIndicator: document.getElementById('security-indicator'),

  // Tabs
  tabsContainer: document.getElementById('tabs-container'),
  btnNewTab: document.getElementById('btn-new-tab'),

  // Window controls
  btnMinimize: document.getElementById('btn-minimize'),
  btnMaximize: document.getElementById('btn-maximize'),
  btnClose: document.getElementById('btn-close'),

  // Menus
  btnProfile: document.getElementById('btn-profile'),
  btnMenu: document.getElementById('btn-menu'),
  profileMenu: document.getElementById('profile-menu'),
  mainMenu: document.getElementById('main-menu'),

  // Loading
  loadingBar: document.getElementById('loading-bar'),

  // New tab page
  newTabPage: document.getElementById('new-tab-page'),
  searchInput: document.getElementById('search-input'),
  btnSearch: document.getElementById('btn-search'),
  quickLinks: document.querySelectorAll('.quick-link')
};

/**
 * Application state
 */
const state = {
  tabs: [],
  activeTabId: null,
  profiles: [],
  activeProfileId: 'default',
  isIncognitoMode: false,
  isLoading: false
};

/**
 * Tab management functions
 */
const TabManager = {
  /**
   * Creates a new tab element
   * @param {Object} tab - Tab data
   * @returns {HTMLElement} Tab element
   */
  createTabElement(tab) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab' + (tab.isActive ? ' active' : '') + (tab.isIncognito ? ' incognito' : '');
    tabEl.dataset.tabId = tab.id;
    tabEl.setAttribute('role', 'tab');
    tabEl.setAttribute('aria-selected', tab.isActive ? 'true' : 'false');

    // Favicon
    const favicon = document.createElement('div');
    favicon.className = 'tab-favicon';
    if (tab.isLoading) {
      favicon.innerHTML = '<svg class="tab-loading" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    } else if (tab.favicon) {
      const img = document.createElement('img');
      img.src = tab.favicon;
      img.alt = '';
      img.onerror = () => {
        favicon.innerHTML = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
      };
      favicon.appendChild(img);
    } else {
      favicon.innerHTML = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="currentColor"/></svg>';
    }
    tabEl.appendChild(favicon);

    // Title
    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title || 'New Tab';
    tabEl.appendChild(title);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '<svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2"/></svg>';
    closeBtn.setAttribute('aria-label', 'Close tab');
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    };
    tabEl.appendChild(closeBtn);

    // Click to activate
    tabEl.onclick = () => this.activateTab(tab.id);

    return tabEl;
  },

  /**
   * Renders all tabs
   */
  renderTabs() {
    elements.tabsContainer.innerHTML = '';
    state.tabs.forEach(tab => {
      elements.tabsContainer.appendChild(this.createTabElement(tab));
    });
  },

  /**
   * Updates a single tab
   * @param {Object} tabData - Updated tab data
   */
  updateTab(tabData) {
    const index = state.tabs.findIndex(t => t.id === tabData.id);
    if (index !== -1) {
      state.tabs[index] = { ...state.tabs[index], ...tabData };
      this.renderTabs();

      // Update URL bar if this is the active tab
      if (tabData.id === state.activeTabId) {
        this.updateActiveTabUI(state.tabs[index]);
      }
    }
  },

  /**
   * Updates UI for the active tab
   * @param {Object} tab - Active tab data
   */
  updateActiveTabUI(tab) {
    if (!tab) {
      return;
    }

    // Update URL bar
    elements.urlInput.value = tab.url || '';

    // Update navigation buttons
    elements.btnBack.disabled = !tab.canGoBack;
    elements.btnForward.disabled = !tab.canGoForward;

    // Update security indicator
    this.updateSecurityIndicator(tab.url);

    // Update loading state
    if (tab.isLoading) {
      elements.loadingBar.classList.remove('hidden');
    } else {
      elements.loadingBar.classList.add('hidden');
    }

    // Update document title
    document.title = tab.title ? `${tab.title} - Horizon` : 'Horizon';
  },

  /**
   * Updates security indicator based on URL
   * @param {string} url - Current URL
   */
  updateSecurityIndicator(url) {
    if (!url) {
      elements.securityIndicator.className = 'security-indicator security-neutral';
      return;
    }

    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'https:') {
        elements.securityIndicator.className = 'security-indicator security-secure';
        elements.securityIndicator.title = 'Connection is secure';
      } else if (urlObj.protocol === 'horizon:') {
        elements.securityIndicator.className = 'security-indicator security-secure';
        elements.securityIndicator.title = 'Horizon page';
      } else {
        elements.securityIndicator.className = 'security-indicator security-insecure';
        elements.securityIndicator.title = 'Connection is not secure';
      }
    } catch {
      elements.securityIndicator.className = 'security-indicator security-neutral';
    }
  },

  /**
   * Creates a new tab
   * @param {Object} options - Tab options
   */
  async createTab(options = {}) {
    if (!window.horizon) {
      // Development mode - create mock tab
      const tab = {
        id: `tab-${Date.now()}`,
        url: options.url || 'horizon://newtab',
        title: 'New Tab',
        isActive: true,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        isIncognito: options.isIncognito || false
      };

      // Deactivate other tabs
      state.tabs.forEach(t => t.isActive = false);
      state.tabs.push(tab);
      state.activeTabId = tab.id;

      this.renderTabs();
      this.updateActiveTabUI(tab);
      return;
    }

    try {
      const tab = await window.horizon.tabs.create(options);
      if (tab) {
        // Deactivate other tabs
        state.tabs.forEach(t => t.isActive = false);
        state.tabs.push(tab);
        state.activeTabId = tab.id;

        this.renderTabs();
        this.updateActiveTabUI(tab);
      }
    } catch (err) {
      console.error('Failed to create tab:', err);
    }
  },

  /**
   * Closes a tab
   * @param {string} tabId - Tab ID to close
   */
  async closeTab(tabId) {
    if (!window.horizon) {
      state.tabs = state.tabs.filter(t => t.id !== tabId);
      if (state.tabs.length === 0) {
        this.createTab();
      } else if (state.activeTabId === tabId) {
        const lastTab = state.tabs[state.tabs.length - 1];
        lastTab.isActive = true;
        state.activeTabId = lastTab.id;
        this.updateActiveTabUI(lastTab);
      }
      this.renderTabs();
      return;
    }

    try {
      await window.horizon.tabs.close(tabId);
      state.tabs = state.tabs.filter(t => t.id !== tabId);

      if (state.tabs.length === 0) {
        await this.createTab();
      } else {
        const tabs = await window.horizon.tabs.getAll();
        state.tabs = tabs;
        const activeTab = tabs.find(t => t.isActive);
        if (activeTab) {
          state.activeTabId = activeTab.id;
          this.updateActiveTabUI(activeTab);
        }
      }

      this.renderTabs();
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  },

  /**
   * Activates a tab
   * @param {string} tabId - Tab ID to activate
   */
  async activateTab(tabId) {
    if (!window.horizon) {
      state.tabs.forEach(t => t.isActive = t.id === tabId);
      state.activeTabId = tabId;
      const activeTab = state.tabs.find(t => t.id === tabId);
      this.renderTabs();
      this.updateActiveTabUI(activeTab);
      return;
    }

    try {
      await window.horizon.tabs.activate(tabId);
      state.tabs.forEach(t => t.isActive = t.id === tabId);
      state.activeTabId = tabId;

      const activeTab = state.tabs.find(t => t.id === tabId);
      this.renderTabs();
      this.updateActiveTabUI(activeTab);
    } catch (err) {
      console.error('Failed to activate tab:', err);
    }
  },

  /**
   * Navigates to a URL
   * @param {string} url - URL to navigate to
   */
  async navigate(url) {
    if (!url) {
      return;
    }

    if (!window.horizon) {
      const activeTab = state.tabs.find(t => t.id === state.activeTabId);
      if (activeTab) {
        activeTab.url = url;
        activeTab.isLoading = true;
        this.updateActiveTabUI(activeTab);
        this.renderTabs();

        // Simulate loading
        setTimeout(() => {
          activeTab.isLoading = false;
          activeTab.title = url.replace(/^https?:\/\//, '').split('/')[0];
          this.updateActiveTabUI(activeTab);
          this.renderTabs();
        }, 1000);
      }
      return;
    }

    try {
      await window.horizon.tabs.navigate(url);
    } catch (err) {
      console.error('Failed to navigate:', err);
    }
  },

  /**
   * Goes back in history
   */
  async goBack() {
    if (window.horizon) {
      await window.horizon.tabs.goBack();
    }
  },

  /**
   * Goes forward in history
   */
  async goForward() {
    if (window.horizon) {
      await window.horizon.tabs.goForward();
    }
  },

  /**
   * Refreshes the current page
   */
  async refresh() {
    if (window.horizon) {
      await window.horizon.tabs.refresh();
    }
  }
};

/**
 * Menu management
 */
const MenuManager = {
  /**
   * Toggles a dropdown menu
   * @param {HTMLElement} menu - Menu element
   * @param {HTMLElement} anchor - Anchor button
   */
  toggleMenu(menu, anchor) {
    const isOpen = !menu.classList.contains('hidden');
    this.closeAllMenus();

    if (!isOpen) {
      const rect = anchor.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;
      menu.classList.remove('hidden');
    }
  },

  /**
   * Closes all open menus
   */
  closeAllMenus() {
    elements.profileMenu.classList.add('hidden');
    elements.mainMenu.classList.add('hidden');
  }
};

/**
 * Event handlers setup
 */
function setupEventHandlers() {
  // Navigation buttons
  elements.btnBack?.addEventListener('click', () => TabManager.goBack());
  elements.btnForward?.addEventListener('click', () => TabManager.goForward());
  elements.btnRefresh?.addEventListener('click', () => TabManager.refresh());
  elements.btnHome?.addEventListener('click', () => TabManager.navigate('horizon://newtab'));

  // URL bar
  elements.urlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      TabManager.navigate(elements.urlInput.value);
    }
  });

  elements.btnGo?.addEventListener('click', () => {
    TabManager.navigate(elements.urlInput.value);
  });

  // Focus URL bar on click
  elements.urlInput?.addEventListener('focus', () => {
    elements.urlInput.select();
  });

  // New tab button
  elements.btnNewTab?.addEventListener('click', () => {
    TabManager.createTab();
  });

  // Window controls
  if (window.horizon) {
    elements.btnMinimize?.addEventListener('click', () => {
      window.horizon.window.minimize();
    });

    elements.btnMaximize?.addEventListener('click', () => {
      window.horizon.window.toggleMaximize();
    });

    elements.btnClose?.addEventListener('click', () => {
      window.horizon.window.close();
    });
  }

  // Menus
  elements.btnProfile?.addEventListener('click', () => {
    MenuManager.toggleMenu(elements.profileMenu, elements.btnProfile);
  });

  elements.btnMenu?.addEventListener('click', () => {
    MenuManager.toggleMenu(elements.mainMenu, elements.btnMenu);
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu') && !e.target.closest('#btn-profile') && !e.target.closest('#btn-menu')) {
      MenuManager.closeAllMenus();
    }
  });

  // Menu items
  document.getElementById('menu-new-tab')?.addEventListener('click', () => {
    TabManager.createTab();
    MenuManager.closeAllMenus();
  });

  document.getElementById('menu-incognito')?.addEventListener('click', () => {
    TabManager.createTab({ isIncognito: true });
    MenuManager.closeAllMenus();
  });

  document.getElementById('menu-settings')?.addEventListener('click', () => {
    TabManager.createTab({ url: 'horizon://settings' });
    MenuManager.closeAllMenus();
  });

  // New tab page
  elements.searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      TabManager.navigate(elements.searchInput.value);
    }
  });

  elements.btnSearch?.addEventListener('click', () => {
    TabManager.navigate(elements.searchInput.value);
  });

  // Quick links
  elements.quickLinks?.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.dataset.url;
      if (url) {
        TabManager.navigate(url);
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + T - New tab
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      TabManager.createTab();
    }

    // Ctrl/Cmd + W - Close tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
      e.preventDefault();
      if (state.activeTabId) {
        TabManager.closeTab(state.activeTabId);
      }
    }

    // Ctrl/Cmd + L - Focus URL bar
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      elements.urlInput?.focus();
    }

    // F5 or Ctrl/Cmd + R - Refresh
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
      e.preventDefault();
      TabManager.refresh();
    }

    // Ctrl/Cmd + Shift + N - New incognito tab
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      TabManager.createTab({ isIncognito: true });
    }
  });
}

/**
 * Initialize application
 */
async function init() {
  console.log('Horizon initializing...');

  // Setup event handlers
  setupEventHandlers();

  // Create initial tab
  if (window.horizon) {
    try {
      const tabs = await window.horizon.tabs.getAll();
      state.tabs = tabs;

      const activeTab = tabs.find(t => t.isActive);
      if (activeTab) {
        state.activeTabId = activeTab.id;
        TabManager.updateActiveTabUI(activeTab);
      }

      TabManager.renderTabs();

      // Subscribe to tab updates
      window.horizon.tabs.onUpdate((data) => {
        TabManager.updateTab(data);
      });
    } catch (err) {
      console.error('Failed to initialize tabs:', err);
      TabManager.createTab();
    }
  } else {
    // Development mode - create initial tab
    TabManager.createTab();
  }

  console.log('Horizon initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * @file Extension Manager for Horizon browser
 * @description Handles Chrome extension installation, loading, and management
 * @module extensions/extensionManager
 */

'use strict';

const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

/**
 * Pre-installed extension metadata
 * @constant {Array<Object>}
 */
const DEFAULT_EXTENSIONS = [
  {
    id: 'ublock-origin',
    name: 'uBlock Origin',
    description: 'An efficient ad blocker for Chromium',
    version: '1.54.0',
    enabled: true,
    isPreinstalled: true
  },
  {
    id: 'dark-reader',
    name: 'Dark Reader',
    description: 'Dark mode for every website',
    version: '4.9.67',
    enabled: true,
    isPreinstalled: true
  }
];

/**
 * Manages browser extensions
 * @class ExtensionManager
 */
class ExtensionManager {
  /**
   * Creates a new ExtensionManager instance
   */
  constructor() {
    /** @type {Store} Extension configuration storage */
    this.store = new Store({
      name: 'extensions',
      defaults: {
        extensions: DEFAULT_EXTENSIONS,
        settings: {
          allowInstallation: true,
          autoUpdate: true
        }
      }
    });

    /** @type {Map<string, Object>} Loaded extensions */
    this.loadedExtensions = new Map();

    /** @type {string} Extensions directory path */
    this.extensionsPath = path.join(app.getPath('userData'), 'Extensions');
  }

  /**
   * Initializes the extension manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Create extensions directory
    await fs.mkdir(this.extensionsPath, { recursive: true });

    // Load enabled extensions
    await this.loadEnabledExtensions();
  }

  /**
   * Loads all enabled extensions
   * @async
   * @returns {Promise<void>}
   */
  async loadEnabledExtensions() {
    const extensions = this.getAllExtensions();

    for (const ext of extensions) {
      if (ext.enabled) {
        try {
          await this.loadExtension(ext.id);
        } catch {
          // Extension failed to load, disable it
          this.setExtensionEnabled(ext.id, false);
        }
      }
    }
  }

  /**
   * Gets all installed extensions
   * @returns {Array<Object>} List of extensions
   */
  getAllExtensions() {
    return this.store.get('extensions', []);
  }

  /**
   * Gets a specific extension by ID
   * @param {string} extensionId - The extension ID
   * @returns {Object|null} Extension data or null
   */
  getExtension(extensionId) {
    const extensions = this.getAllExtensions();
    return extensions.find(e => e.id === extensionId) || null;
  }

  /**
   * Installs an extension from a CRX file
   * @async
   * @param {string} crxPath - Path to the CRX file
   * @returns {Promise<Object>} Installed extension data
   * @throws {Error} If extension installation fails security validation
   * @note TODO: Full CRX signature verification and permission validation is required
   *       for production deployment. Current implementation is a placeholder.
   */
  async installFromCrx(crxPath) {
    // Validate file exists
    try {
      await fs.access(crxPath);
    } catch {
      throw new Error('CRX file not found');
    }

    // Validate file extension
    if (!crxPath.endsWith('.crx')) {
      throw new Error('Invalid extension file format. Only .crx files are supported.');
    }

    // Generate extension ID
    const extensionId = uuidv4();

    // Create extension directory
    const extensionDir = path.join(this.extensionsPath, extensionId);
    await fs.mkdir(extensionDir, { recursive: true });

    // TODO: Security validation required for production:
    // 1. Verify CRX signature using public key
    // 2. Extract and parse CRX contents safely
    // 3. Parse manifest.json and validate schema
    // 4. Check for dangerous permissions (e.g., <all_urls>, webRequest, etc.)
    // 5. Scan for known malicious patterns
    // 6. Present permission review to user before installation
    //
    // For now, this is a placeholder implementation.
    // Extensions should NOT be installed from untrusted sources.

    // For now, create a placeholder manifest
    const manifest = {
      name: `Extension ${extensionId.slice(0, 8)}`,
      version: '1.0.0',
      description: 'Installed extension'
    };

    const extension = {
      id: extensionId,
      name: manifest.name,
      description: manifest.description,
      version: manifest.version,
      path: extensionDir,
      enabled: true,
      isPreinstalled: false,
      installedAt: new Date().toISOString(),
      securityVerified: false // Flag indicating security verification status
    };

    // Save extension metadata
    const extensions = this.getAllExtensions();
    extensions.push(extension);
    this.store.set('extensions', extensions);

    // Load the extension
    await this.loadExtension(extensionId);

    return extension;
  }

  /**
   * Loads an extension into the browser session
   * @async
   * @param {string} extensionId - The extension ID to load
   * @returns {Promise<boolean>} True if loaded successfully
   */
  async loadExtension(extensionId) {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      return false;
    }

    // For pre-installed extensions, use bundled path
    let extensionPath;
    if (extension.isPreinstalled) {
      extensionPath = path.join(__dirname, '../../extensions', extensionId);
    } else {
      extensionPath = extension.path || path.join(this.extensionsPath, extensionId);
    }

    try {
      // Check if extension directory exists
      await fs.access(extensionPath);

      // Load extension using Electron's extension API
      // Note: Full Chrome extension support requires electron-chrome-extensions
      // This is a placeholder for the actual implementation
      this.loadedExtensions.set(extensionId, {
        ...extension,
        loaded: true,
        loadedAt: new Date().toISOString()
      });

      return true;
    } catch {
      // Extension directory doesn't exist or failed to load
      return false;
    }
  }

  /**
   * Unloads an extension from the browser session
   * @async
   * @param {string} extensionId - The extension ID to unload
   * @returns {Promise<boolean>} True if unloaded successfully
   */
  async unloadExtension(extensionId) {
    if (!this.loadedExtensions.has(extensionId)) {
      return false;
    }

    // Unload from session
    this.loadedExtensions.delete(extensionId);

    return true;
  }

  /**
   * Enables or disables an extension
   * @param {string} extensionId - The extension ID
   * @param {boolean} enabled - Whether to enable the extension
   * @returns {boolean} True if successful
   */
  setExtensionEnabled(extensionId, enabled) {
    const extensions = this.getAllExtensions();
    const index = extensions.findIndex(e => e.id === extensionId);

    if (index === -1) {
      return false;
    }

    extensions[index].enabled = enabled;
    this.store.set('extensions', extensions);

    // Load or unload based on state
    if (enabled) {
      this.loadExtension(extensionId);
    } else {
      this.unloadExtension(extensionId);
    }

    return true;
  }

  /**
   * Uninstalls an extension
   * @async
   * @param {string} extensionId - The extension ID to uninstall
   * @returns {Promise<boolean>} True if uninstalled
   */
  async uninstallExtension(extensionId) {
    const extension = this.getExtension(extensionId);
    if (!extension) {
      return false;
    }

    // Cannot uninstall pre-installed extensions
    if (extension.isPreinstalled) {
      throw new Error('Cannot uninstall pre-installed extensions');
    }

    // Unload from session
    await this.unloadExtension(extensionId);

    // Remove extension directory
    const extensionDir = extension.path || path.join(this.extensionsPath, extensionId);
    try {
      await fs.rm(extensionDir, { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }

    // Remove from store
    const extensions = this.getAllExtensions().filter(e => e.id !== extensionId);
    this.store.set('extensions', extensions);

    return true;
  }

  /**
   * Gets the status of all extensions
   * @returns {Array<Object>} Extension status list
   */
  getExtensionStatus() {
    const extensions = this.getAllExtensions();

    return extensions.map(ext => ({
      ...ext,
      loaded: this.loadedExtensions.has(ext.id)
    }));
  }

  /**
   * Checks for extension updates
   * @async
   * @returns {Promise<Array<Object>>} List of available updates
   */
  async checkForUpdates() {
    // In a real implementation, this would check Chrome Web Store
    // or a custom update server for new versions
    return [];
  }

  /**
   * Gets extension settings
   * @returns {Object} Extension manager settings
   */
  getSettings() {
    return this.store.get('settings', {
      allowInstallation: true,
      autoUpdate: true
    });
  }

  /**
   * Updates extension manager settings
   * @param {Object} settings - Settings to update
   * @returns {void}
   */
  updateSettings(settings) {
    const currentSettings = this.getSettings();
    this.store.set('settings', { ...currentSettings, ...settings });
  }

  /**
   * Resets extensions to default state
   * @async
   * @returns {Promise<void>}
   */
  async resetToDefaults() {
    // Unload all extensions
    for (const [extId] of this.loadedExtensions) {
      await this.unloadExtension(extId);
    }

    // Reset to default extensions only
    this.store.set('extensions', DEFAULT_EXTENSIONS);

    // Reload default extensions
    await this.loadEnabledExtensions();
  }
}

module.exports = { ExtensionManager, DEFAULT_EXTENSIONS };

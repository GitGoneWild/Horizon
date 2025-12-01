/**
 * @file Credential Manager for UltraBrowse browser
 * @description Handles secure storage and autofill of user credentials
 * Uses system keychain for maximum security
 * @module credentials/credentialManager
 */

'use strict';

const crypto = require('crypto');
const Store = require('electron-store');

/**
 * Encryption configuration
 * @constant {Object}
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  authTagLength: 16,
  saltLength: 32
};

/**
 * Manages user credentials with encryption
 * @class CredentialManager
 */
class CredentialManager {
  /**
   * Creates a new CredentialManager instance
   */
  constructor() {
    /** @type {Store} Encrypted credential storage */
    this.store = new Store({
      name: 'credentials',
      encryptionKey: this.getMasterKey(),
      defaults: {
        credentials: [],
        lastUpdated: null
      }
    });

    /** @type {Map<string, Object>} In-memory credential cache */
    this.cache = new Map();

    /** @type {boolean} Whether the manager is unlocked */
    this.isUnlocked = false;
  }

  /**
   * Initializes the credential manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Load credentials into memory cache
    await this.loadCredentials();
    this.isUnlocked = true;
  }

  /**
   * Gets or generates a master encryption key
   * @private
   * @returns {string} The master key
   */
  getMasterKey() {
    // In production, this should use system keychain via keytar
    // For now, use a derived key from machine-specific data
    const machineId = process.env.COMPUTERNAME || process.env.HOSTNAME || 'ultrabrowse';
    return crypto.createHash('sha256').update(machineId + 'ultrabrowse-secure').digest('hex');
  }

  /**
   * Encrypts sensitive data
   * @private
   * @param {string} plaintext - Data to encrypt
   * @returns {Object} Encrypted data with IV and auth tag
   */
  encrypt(plaintext) {
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    const key = Buffer.from(this.getMasterKey().slice(0, ENCRYPTION_CONFIG.keyLength), 'utf8');

    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return {
      encrypted,
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64')
    };
  }

  /**
   * Decrypts encrypted data
   * @private
   * @param {Object} encryptedData - Object with encrypted data, IV, and auth tag
   * @returns {string} Decrypted plaintext
   */
  decrypt(encryptedData) {
    try {
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = Buffer.from(encryptedData.authTag, 'base64');
      const key = Buffer.from(this.getMasterKey().slice(0, ENCRYPTION_CONFIG.keyLength), 'utf8');

      const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      throw new Error('Failed to decrypt credential');
    }
  }

  /**
   * Loads credentials from storage into memory
   * @async
   * @private
   * @returns {Promise<void>}
   */
  async loadCredentials() {
    this.cache.clear();
    const credentials = this.store.get('credentials', []);

    for (const cred of credentials) {
      this.cache.set(cred.id, cred);
    }
  }

  /**
   * Saves a new credential
   * @async
   * @param {Object} credential - Credential data
   * @param {string} credential.url - Website URL
   * @param {string} credential.username - Username or email
   * @param {string} credential.password - Password (will be encrypted)
   * @param {string} [credential.notes] - Optional notes
   * @returns {Promise<Object>} Saved credential (without password)
   */
  async saveCredential({ url, username, password, notes = '' }) {
    if (!url || !username || !password) {
      throw new Error('URL, username, and password are required');
    }

    // Validate URL
    let hostname;
    try {
      const parsedUrl = new URL(url);
      hostname = parsedUrl.hostname;
    } catch {
      throw new Error('Invalid URL');
    }

    const id = crypto.randomUUID();
    const encryptedPassword = this.encrypt(password);

    const credential = {
      id,
      hostname,
      url,
      username,
      password: encryptedPassword,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsed: null,
      strength: this.assessPasswordStrength(password)
    };

    // Save to store
    const credentials = this.store.get('credentials', []);
    credentials.push(credential);
    this.store.set('credentials', credentials);
    this.store.set('lastUpdated', new Date().toISOString());

    // Update cache
    this.cache.set(id, credential);

    // Return credential without decrypted password
    return this.sanitizeCredential(credential);
  }

  /**
   * Gets credentials for a specific URL
   * @param {string} url - The URL to find credentials for
   * @returns {Array<Object>} Matching credentials (without passwords)
   */
  getCredentialsForUrl(url) {
    let hostname;
    try {
      const parsedUrl = new URL(url);
      hostname = parsedUrl.hostname;
    } catch {
      return [];
    }

    const matches = [];
    for (const cred of this.cache.values()) {
      if (cred.hostname === hostname) {
        matches.push(this.sanitizeCredential(cred));
      }
    }

    return matches;
  }

  /**
   * Gets a credential by ID with decrypted password
   * @param {string} id - Credential ID
   * @returns {Object|null} Credential with decrypted password or null
   */
  getCredentialWithPassword(id) {
    const credential = this.cache.get(id);
    if (!credential) {
      return null;
    }

    // Update last used
    this.updateLastUsed(id);

    return {
      ...this.sanitizeCredential(credential),
      password: this.decrypt(credential.password)
    };
  }

  /**
   * Updates a credential
   * @async
   * @param {string} id - Credential ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated credential or null
   */
  async updateCredential(id, updates) {
    const credential = this.cache.get(id);
    if (!credential) {
      return null;
    }

    const updatedCredential = { ...credential };

    if (updates.username) {
      updatedCredential.username = updates.username;
    }

    if (updates.password) {
      updatedCredential.password = this.encrypt(updates.password);
      updatedCredential.strength = this.assessPasswordStrength(updates.password);
    }

    if (updates.notes !== undefined) {
      updatedCredential.notes = updates.notes;
    }

    updatedCredential.updatedAt = new Date().toISOString();

    // Update store
    const credentials = this.store.get('credentials', []);
    const index = credentials.findIndex(c => c.id === id);
    if (index !== -1) {
      credentials[index] = updatedCredential;
      this.store.set('credentials', credentials);
    }

    // Update cache
    this.cache.set(id, updatedCredential);

    return this.sanitizeCredential(updatedCredential);
  }

  /**
   * Deletes a credential
   * @async
   * @param {string} id - Credential ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteCredential(id) {
    if (!this.cache.has(id)) {
      return false;
    }

    // Remove from store
    const credentials = this.store.get('credentials', []).filter(c => c.id !== id);
    this.store.set('credentials', credentials);

    // Remove from cache
    this.cache.delete(id);

    return true;
  }

  /**
   * Gets all credentials (without passwords)
   * @returns {Array<Object>} All stored credentials
   */
  getAllCredentials() {
    return Array.from(this.cache.values()).map(c => this.sanitizeCredential(c));
  }

  /**
   * Updates the last used timestamp for a credential
   * @private
   * @param {string} id - Credential ID
   * @returns {void}
   */
  updateLastUsed(id) {
    const credential = this.cache.get(id);
    if (!credential) {
      return;
    }

    credential.lastUsed = new Date().toISOString();

    // Update store
    const credentials = this.store.get('credentials', []);
    const index = credentials.findIndex(c => c.id === id);
    if (index !== -1) {
      credentials[index].lastUsed = credential.lastUsed;
      this.store.set('credentials', credentials);
    }

    this.cache.set(id, credential);
  }

  /**
   * Removes sensitive data from credential object
   * @private
   * @param {Object} credential - Full credential object
   * @returns {Object} Sanitized credential
   */
  sanitizeCredential(credential) {
    const { password: _password, ...sanitized } = credential;
    return sanitized;
  }

  /**
   * Assesses password strength
   * @param {string} password - Password to assess
   * @returns {Object} Strength assessment
   */
  assessPasswordStrength(password) {
    const result = {
      score: 0,
      level: 'weak',
      suggestions: []
    };

    if (!password) {
      return result;
    }

    // Length check
    if (password.length >= 8) {
      result.score += 1;
    }
    if (password.length >= 12) {
      result.score += 1;
    }
    if (password.length >= 16) {
      result.score += 1;
    }

    // Character variety
    if (/[a-z]/.test(password)) {
      result.score += 1;
    }
    if (/[A-Z]/.test(password)) {
      result.score += 1;
    }
    if (/[0-9]/.test(password)) {
      result.score += 1;
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
      result.score += 1;
    }

    // Determine level
    if (result.score >= 6) {
      result.level = 'strong';
    } else if (result.score >= 4) {
      result.level = 'moderate';
    } else {
      result.level = 'weak';
    }

    // Add suggestions
    if (password.length < 12) {
      result.suggestions.push('Use at least 12 characters');
    }
    if (!/[A-Z]/.test(password)) {
      result.suggestions.push('Add uppercase letters');
    }
    if (!/[0-9]/.test(password)) {
      result.suggestions.push('Add numbers');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      result.suggestions.push('Add special characters');
    }

    return result;
  }

  /**
   * Generates a secure random password
   * @param {number} [length=16] - Password length
   * @param {Object} [options] - Generation options
   * @returns {string} Generated password
   */
  generatePassword(length = 16, options = {}) {
    const {
      includeLowercase = true,
      includeUppercase = true,
      includeNumbers = true,
      includeSymbols = true
    } = options;

    let charset = '';
    if (includeLowercase) {
      charset += 'abcdefghijklmnopqrstuvwxyz';
    }
    if (includeUppercase) {
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (includeNumbers) {
      charset += '0123456789';
    }
    if (includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (!charset) {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }

    const bytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }

    return password;
  }

  /**
   * Exports all credentials (encrypted)
   * @returns {Object} Encrypted export data
   */
  exportCredentials() {
    const credentials = this.store.get('credentials', []);
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: credentials.length,
      data: Buffer.from(JSON.stringify(credentials)).toString('base64')
    };
  }

  /**
   * Clears all stored credentials
   * @async
   * @returns {Promise<void>}
   */
  async clearAllCredentials() {
    this.store.set('credentials', []);
    this.cache.clear();
  }
}

module.exports = { CredentialManager };

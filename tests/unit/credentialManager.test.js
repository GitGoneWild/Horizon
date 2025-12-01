/**
 * @file Unit tests for CredentialManager
 * @description Tests for credential storage, encryption, and password strength assessment
 */

'use strict';

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => {
    const store = {};
    return {
      get: jest.fn((key, defaultValue) => store[key] ?? defaultValue),
      set: jest.fn((key, value) => { store[key] = value; }),
      delete: jest.fn((key) => { delete store[key]; })
    };
  });
});

const { CredentialManager } = require('../../src/main/credentials/credentialManager');

describe('CredentialManager', () => {
  let credentialManager;

  beforeEach(() => {
    jest.clearAllMocks();
    credentialManager = new CredentialManager();
  });

  describe('constructor', () => {
    test('should initialize with empty cache', () => {
      expect(credentialManager.cache).toBeInstanceOf(Map);
      expect(credentialManager.cache.size).toBe(0);
    });
  });

  describe('assessPasswordStrength', () => {
    test('should return weak for empty password', () => {
      const result = credentialManager.assessPasswordStrength('');
      expect(result.level).toBe('weak');
      expect(result.score).toBe(0);
    });

    test('should return weak for short password', () => {
      const result = credentialManager.assessPasswordStrength('abc');
      expect(result.level).toBe('weak');
    });

    test('should return moderate for medium password', () => {
      const result = credentialManager.assessPasswordStrength('Password123');
      expect(result.level).toBe('moderate');
    });

    test('should return strong for complex password', () => {
      const result = credentialManager.assessPasswordStrength('MyP@ssw0rd!Complex123');
      expect(result.level).toBe('strong');
    });

    test('should include suggestions for weak passwords', () => {
      const result = credentialManager.assessPasswordStrength('weak');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('should suggest uppercase letters if missing', () => {
      const result = credentialManager.assessPasswordStrength('lowercase123!');
      expect(result.suggestions).toContain('Add uppercase letters');
    });

    test('should suggest numbers if missing', () => {
      const result = credentialManager.assessPasswordStrength('PasswordOnly!');
      expect(result.suggestions).toContain('Add numbers');
    });

    test('should suggest special characters if missing', () => {
      const result = credentialManager.assessPasswordStrength('Password123');
      expect(result.suggestions).toContain('Add special characters');
    });
  });

  describe('generatePassword', () => {
    test('should generate password of specified length', () => {
      const password = credentialManager.generatePassword(16);
      expect(password.length).toBe(16);
    });

    test('should generate password of default length', () => {
      const password = credentialManager.generatePassword();
      expect(password.length).toBe(16);
    });

    test('should generate different passwords each time', () => {
      const password1 = credentialManager.generatePassword(16);
      const password2 = credentialManager.generatePassword(16);
      expect(password1).not.toBe(password2);
    });

    test('should include lowercase letters by default', () => {
      const password = credentialManager.generatePassword(100);
      expect(/[a-z]/.test(password)).toBe(true);
    });

    test('should include uppercase letters by default', () => {
      const password = credentialManager.generatePassword(100);
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    test('should include numbers by default', () => {
      const password = credentialManager.generatePassword(100);
      expect(/[0-9]/.test(password)).toBe(true);
    });

    test('should respect options to exclude character types', () => {
      const password = credentialManager.generatePassword(100, {
        includeLowercase: true,
        includeUppercase: false,
        includeNumbers: false,
        includeSymbols: false
      });

      expect(/[A-Z]/.test(password)).toBe(false);
      expect(/[0-9]/.test(password)).toBe(false);
      expect(/[^a-z]/.test(password)).toBe(false);
    });
  });

  describe('saveCredential', () => {
    test('should throw error if URL is missing', async () => {
      await expect(credentialManager.saveCredential({
        username: 'user',
        password: 'pass'
      })).rejects.toThrow('URL, username, and password are required');
    });

    test('should throw error if username is missing', async () => {
      await expect(credentialManager.saveCredential({
        url: 'https://example.com',
        password: 'pass'
      })).rejects.toThrow('URL, username, and password are required');
    });

    test('should throw error if password is missing', async () => {
      await expect(credentialManager.saveCredential({
        url: 'https://example.com',
        username: 'user'
      })).rejects.toThrow('URL, username, and password are required');
    });

    test('should throw error for invalid URL', async () => {
      await expect(credentialManager.saveCredential({
        url: 'not-a-valid-url',
        username: 'user',
        password: 'pass'
      })).rejects.toThrow('Invalid URL');
    });

    test('should save valid credential', async () => {
      const credential = await credentialManager.saveCredential({
        url: 'https://example.com',
        username: 'testuser',
        password: 'testpass123'
      });

      expect(credential).toBeDefined();
      expect(credential.hostname).toBe('example.com');
      expect(credential.username).toBe('testuser');
      expect(credential.password).toBeUndefined(); // Sanitized output
    });
  });

  describe('getCredentialsForUrl', () => {
    test('should return empty array for invalid URL', () => {
      const result = credentialManager.getCredentialsForUrl('not-a-url');
      expect(result).toEqual([]);
    });

    test('should return empty array when no credentials match', () => {
      const result = credentialManager.getCredentialsForUrl('https://unknown.com');
      expect(result).toEqual([]);
    });
  });

  describe('deleteCredential', () => {
    test('should return false for non-existent credential', async () => {
      const result = await credentialManager.deleteCredential('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getAllCredentials', () => {
    test('should return empty array when no credentials', () => {
      const result = credentialManager.getAllCredentials();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('exportCredentials', () => {
    test('should return export object with metadata', () => {
      const result = credentialManager.exportCredentials();

      expect(result.version).toBe('1.0');
      expect(result.exportedAt).toBeDefined();
      expect(result.count).toBeDefined();
      expect(result.data).toBeDefined();
    });
  });

  describe('clearAllCredentials', () => {
    test('should clear all credentials', async () => {
      await credentialManager.clearAllCredentials();
      expect(credentialManager.cache.size).toBe(0);
    });
  });
});

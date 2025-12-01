/**
 * @file Unit tests for ProfileManager
 * @description Tests for profile creation, deletion, and management
 */

'use strict';

// Mock electron modules
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/ultrabrowse-test')
  },
  session: {
    fromPartition: jest.fn(() => ({
      setUserAgent: jest.fn(),
      cookies: {
        flushStore: jest.fn()
      },
      clearStorageData: jest.fn(),
      clearCache: jest.fn()
    }))
  }
}));

jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key, defaultValue) => defaultValue),
    set: jest.fn(),
    delete: jest.fn()
  }));
});

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    rm: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined)
  }
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-12345')
}));

const { ProfileManager, DEFAULT_PROFILE } = require('../../src/main/profiles/profileManager');

describe('ProfileManager', () => {
  let profileManager;

  beforeEach(() => {
    jest.clearAllMocks();
    profileManager = new ProfileManager();
  });

  describe('constructor', () => {
    test('should initialize with default profile', () => {
      expect(profileManager).toBeDefined();
      expect(profileManager.sessions).toBeInstanceOf(Map);
    });
  });

  describe('getAllProfiles', () => {
    test('should return array of profiles', () => {
      const profiles = profileManager.getAllProfiles();
      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe('getProfile', () => {
    test('should return null for non-existent profile', () => {
      const profile = profileManager.getProfile('non-existent');
      expect(profile).toBeNull();
    });
  });

  describe('createProfile', () => {
    test('should throw error when name is empty', async () => {
      await expect(profileManager.createProfile({ name: '' }))
        .rejects.toThrow('Profile name is required');
    });

    test('should throw error when name is not provided', async () => {
      await expect(profileManager.createProfile({}))
        .rejects.toThrow('Profile name is required');
    });

    test('should create profile with valid name', async () => {
      const profile = await profileManager.createProfile({ name: 'Test Profile' });

      expect(profile).toBeDefined();
      expect(profile.id).toBe('test-uuid-12345');
      expect(profile.name).toBe('Test Profile');
      expect(profile.isIncognito).toBe(false);
    });

    test('should trim profile name', async () => {
      const profile = await profileManager.createProfile({ name: '  Trimmed Name  ' });

      expect(profile.name).toBe('Trimmed Name');
    });

    test('should use default values for optional fields', async () => {
      const profile = await profileManager.createProfile({ name: 'Test' });

      expect(profile.avatar).toBe('default');
      expect(profile.color).toBe('#4285f4');
    });

    test('should use custom avatar and color', async () => {
      const profile = await profileManager.createProfile({
        name: 'Custom Profile',
        avatar: 'custom-avatar',
        color: '#ff0000'
      });

      expect(profile.avatar).toBe('custom-avatar');
      expect(profile.color).toBe('#ff0000');
    });
  });

  describe('deleteProfile', () => {
    test('should throw error when deleting default profile', async () => {
      await expect(profileManager.deleteProfile('default'))
        .rejects.toThrow('Cannot delete the default profile');
    });

    test('should return false for non-existent profile', async () => {
      const result = await profileManager.deleteProfile('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('updateProfile', () => {
    test('should return null for non-existent profile', () => {
      const result = profileManager.updateProfile('non-existent', { name: 'New Name' });
      expect(result).toBeNull();
    });
  });

  describe('getSanitizedUserAgent', () => {
    test('should return a valid user agent string', () => {
      const userAgent = profileManager.getSanitizedUserAgent();

      expect(userAgent).toContain('Mozilla/5.0');
      expect(userAgent).toContain('AppleWebKit');
      expect(userAgent).toContain('Chrome');
    });
  });

  describe('DEFAULT_PROFILE', () => {
    test('should have correct structure', () => {
      expect(DEFAULT_PROFILE.id).toBe('default');
      expect(DEFAULT_PROFILE.name).toBe('Default');
      expect(DEFAULT_PROFILE.isIncognito).toBe(false);
    });
  });
});

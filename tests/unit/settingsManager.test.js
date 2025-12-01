/**
 * @file Unit tests for SettingsManager
 * @description Tests for settings storage, retrieval, and management
 */

'use strict';

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => {
    const store = {};
    return {
      get: jest.fn((key, defaultValue) => {
        if (key in store) {
          return store[key];
        }
        return defaultValue;
      }),
      set: jest.fn((key, value) => {
        store[key] = value;
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      })
    };
  });
});

const { SettingsManager, DEFAULT_SETTINGS, SEARCH_ENGINES } = require('../../src/main/settings/settingsManager');

describe('SettingsManager', () => {
  let settingsManager;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsManager = new SettingsManager();
  });

  describe('constructor', () => {
    test('should initialize with empty listeners array', () => {
      expect(settingsManager.listeners).toEqual([]);
    });
  });

  describe('get', () => {
    test('should return default value when key not found', () => {
      const result = settingsManager.get('nonexistent.key', 'defaultValue');
      expect(result).toBe('defaultValue');
    });
  });

  describe('set', () => {
    test('should set value and notify listeners', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);

      settingsManager.set('general.homepage', 'https://example.com');

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('getCategory', () => {
    test('should return default settings for category', () => {
      const general = settingsManager.getCategory('general');
      expect(general).toBeDefined();
    });

    test('should return empty object for unknown category', () => {
      const unknown = settingsManager.getCategory('unknown');
      expect(unknown).toEqual({});
    });
  });

  describe('setCategory', () => {
    test('should merge settings and notify listeners', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);

      settingsManager.setCategory('general', { homepage: 'https://new.com' });

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('getAllSettings', () => {
    test('should return all categories', () => {
      const settings = settingsManager.getAllSettings();

      expect(settings).toHaveProperty('general');
      expect(settings).toHaveProperty('appearance');
      expect(settings).toHaveProperty('privacy');
      expect(settings).toHaveProperty('security');
      expect(settings).toHaveProperty('performance');
    });
  });

  describe('getSearchEngines', () => {
    test('should return search engines configuration', () => {
      const engines = settingsManager.getSearchEngines();

      expect(engines.duckduckgo).toBeDefined();
      expect(engines.google).toBeDefined();
      expect(engines.bing).toBeDefined();
    });
  });

  describe('getSearchUrl', () => {
    test('should return DuckDuckGo URL by default', () => {
      const url = settingsManager.getSearchUrl();
      expect(url).toContain('duckduckgo.com');
    });
  });

  describe('setSearchEngine', () => {
    test('should return true for valid engine', () => {
      const result = settingsManager.setSearchEngine('google');
      expect(result).toBe(true);
    });

    test('should return false for invalid engine', () => {
      const result = settingsManager.setSearchEngine('invalid-engine');
      expect(result).toBe(false);
    });
  });

  describe('getTheme', () => {
    test('should return theme setting', () => {
      const theme = settingsManager.getTheme();
      expect(['light', 'dark', 'system']).toContain(theme);
    });
  });

  describe('setTheme', () => {
    test('should set valid theme', () => {
      settingsManager.setTheme('dark');
      // Theme is set via settings.set which is mocked
    });

    test('should not set invalid theme', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);

      settingsManager.setTheme('invalid-theme');

      // Should not call listener for invalid theme
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('isHardwareAccelerationEnabled', () => {
    test('should return boolean', () => {
      const enabled = settingsManager.isHardwareAccelerationEnabled();
      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('isHttpsOnlyMode', () => {
    test('should return boolean', () => {
      const enabled = settingsManager.isHttpsOnlyMode();
      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('addListener', () => {
    test('should add listener', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);
      expect(settingsManager.listeners).toContain(listener);
    });
  });

  describe('removeListener', () => {
    test('should remove listener', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);
      settingsManager.removeListener(listener);
      expect(settingsManager.listeners).not.toContain(listener);
    });

    test('should handle non-existent listener gracefully', () => {
      const listener = jest.fn();
      expect(() => settingsManager.removeListener(listener)).not.toThrow();
    });
  });

  describe('exportSettings', () => {
    test('should return export object with metadata', () => {
      const exported = settingsManager.exportSettings();

      expect(exported.version).toBe('1.0');
      expect(exported.exportedAt).toBeDefined();
      expect(exported.settings).toBeDefined();
    });
  });

  describe('importSettings', () => {
    test('should return false for null input', () => {
      const result = settingsManager.importSettings(null);
      expect(result).toBe(false);
    });

    test('should return false for missing settings', () => {
      const result = settingsManager.importSettings({});
      expect(result).toBe(false);
    });

    test('should return true for valid import data', () => {
      const result = settingsManager.importSettings({
        settings: {
          general: { homepage: 'https://new.com' }
        }
      });
      expect(result).toBe(true);
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    test('should have general settings', () => {
      expect(DEFAULT_SETTINGS.general).toBeDefined();
      expect(DEFAULT_SETTINGS.general.homepage).toBe('horizon://newtab');
      expect(DEFAULT_SETTINGS.general.searchEngine).toBe('duckduckgo');
    });

    test('should have appearance settings', () => {
      expect(DEFAULT_SETTINGS.appearance).toBeDefined();
      expect(DEFAULT_SETTINGS.appearance.theme).toBe('system');
    });

    test('should have privacy settings', () => {
      expect(DEFAULT_SETTINGS.privacy).toBeDefined();
      expect(DEFAULT_SETTINGS.privacy.doNotTrack).toBe(true);
    });

    test('should have security settings', () => {
      expect(DEFAULT_SETTINGS.security).toBeDefined();
      expect(DEFAULT_SETTINGS.security.safeBrowsing).toBe(true);
    });

    test('should have performance settings', () => {
      expect(DEFAULT_SETTINGS.performance).toBeDefined();
      expect(DEFAULT_SETTINGS.performance.hardwareAcceleration).toBe(true);
    });
  });

  describe('SEARCH_ENGINES', () => {
    test('should have DuckDuckGo as default', () => {
      expect(SEARCH_ENGINES.duckduckgo).toBeDefined();
      expect(SEARCH_ENGINES.duckduckgo.name).toBe('DuckDuckGo');
    });

    test('should have search URLs for all engines', () => {
      Object.keys(SEARCH_ENGINES).forEach(key => {
        expect(SEARCH_ENGINES[key].url).toBeDefined();
        expect(SEARCH_ENGINES[key].url).toContain('http');
      });
    });
  });
});

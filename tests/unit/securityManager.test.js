/**
 * @file Unit tests for SecurityManager
 * @description Tests for URL validation, security policies, and protection mechanisms
 */

'use strict';

// Mock electron modules
jest.mock('electron', () => ({
  session: {
    defaultSession: {
      webRequest: {
        onHeadersReceived: jest.fn(),
        onBeforeRequest: jest.fn()
      }
    }
  }
}));

const { SecurityManager } = require('../../src/main/security/securityManager');

describe('SecurityManager', () => {
  let securityManager;

  beforeEach(() => {
    jest.clearAllMocks();
    securityManager = new SecurityManager();
  });

  describe('constructor', () => {
    test('should initialize with default settings', () => {
      expect(securityManager.enforceHttps).toBe(true);
      expect(securityManager.blockMixedContent).toBe(true);
      expect(securityManager.fingerprintProtection).toBe(true);
      expect(securityManager.blockedDomains).toBeInstanceOf(Set);
      expect(securityManager.allowedDomains).toBeInstanceOf(Set);
    });
  });

  describe('isUrlSafe', () => {
    test('should return true for valid HTTPS URLs', () => {
      expect(securityManager.isUrlSafe('https://example.com')).toBe(true);
      expect(securityManager.isUrlSafe('https://google.com/search?q=test')).toBe(true);
    });

    test('should return true for valid HTTP URLs', () => {
      expect(securityManager.isUrlSafe('http://example.com')).toBe(true);
    });

    test('should return true for internal URLs', () => {
      expect(securityManager.isUrlSafe('ultrabrowse://newtab')).toBe(true);
      expect(securityManager.isUrlSafe('ultrabrowse://settings')).toBe(true);
    });

    test('should return true for devtools URLs', () => {
      expect(securityManager.isUrlSafe('devtools://devtools/bundled/inspector.html')).toBe(true);
    });

    test('should return false for null/undefined URLs', () => {
      expect(securityManager.isUrlSafe(null)).toBe(false);
      expect(securityManager.isUrlSafe(undefined)).toBe(false);
      expect(securityManager.isUrlSafe('')).toBe(false);
    });

    test('should return false for invalid URLs', () => {
      expect(securityManager.isUrlSafe('not a url')).toBe(false);
    });

    test('should return false for blocked protocols', () => {
      expect(securityManager.isUrlSafe('ftp://example.com')).toBe(false);
      expect(securityManager.isUrlSafe('file:///etc/passwd')).toBe(false);
    });

    test('should return false for blocked domains', () => {
      securityManager.blockDomain('malware.com');
      expect(securityManager.isUrlSafe('https://malware.com')).toBe(false);
    });

    test('should return true for data URLs containing images', () => {
      expect(securityManager.isUrlSafe('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    });

    test('should return false for non-image data URLs', () => {
      expect(securityManager.isUrlSafe('data:text/html,<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    test('should return valid result for HTTPS URLs', () => {
      const result = securityManager.sanitizeUrl('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://example.com/');
    });

    test('should block JavaScript URLs', () => {
      const result = securityManager.sanitizeUrl('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('javascript');
    });

    test('should block vbscript URLs', () => {
      const result = securityManager.sanitizeUrl('vbscript:msgbox("test")');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('vbscript');
    });

    test('should return invalid for null/empty input', () => {
      expect(securityManager.sanitizeUrl(null).isValid).toBe(false);
      expect(securityManager.sanitizeUrl('').isValid).toBe(false);
      expect(securityManager.sanitizeUrl(undefined).isValid).toBe(false);
    });

    test('should add https:// to domain-like input', () => {
      const result = securityManager.sanitizeUrl('example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://example.com/');
    });

    test('should convert plain text to search query', () => {
      const result = securityManager.sanitizeUrl('what is javascript');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toContain('duckduckgo.com');
      expect(result.sanitizedUrl).toContain('what%20is%20javascript');
    });

    test('should handle URLs with special characters', () => {
      const result = securityManager.sanitizeUrl('https://example.com/path?query=test&foo=bar');
      expect(result.isValid).toBe(true);
    });
  });

  describe('blockDomain', () => {
    test('should add domain to blocklist', () => {
      securityManager.blockDomain('blocked.com');
      expect(securityManager.blockedDomains.has('blocked.com')).toBe(true);
    });

    test('should lowercase domain', () => {
      securityManager.blockDomain('BLOCKED.COM');
      expect(securityManager.blockedDomains.has('blocked.com')).toBe(true);
    });

    test('should handle null/undefined gracefully', () => {
      expect(() => securityManager.blockDomain(null)).not.toThrow();
      expect(() => securityManager.blockDomain(undefined)).not.toThrow();
    });
  });

  describe('unblockDomain', () => {
    test('should remove domain from blocklist', () => {
      securityManager.blockDomain('blocked.com');
      securityManager.unblockDomain('blocked.com');
      expect(securityManager.blockedDomains.has('blocked.com')).toBe(false);
    });
  });

  describe('allowDomain', () => {
    test('should add domain to allowlist', () => {
      securityManager.allowDomain('allowed.com');
      expect(securityManager.allowedDomains.has('allowed.com')).toBe(true);
    });
  });

  describe('getSettings', () => {
    test('should return current security settings', () => {
      const settings = securityManager.getSettings();

      expect(settings.enforceHttps).toBe(true);
      expect(settings.blockMixedContent).toBe(true);
      expect(settings.fingerprintProtection).toBe(true);
      expect(typeof settings.blockedDomainsCount).toBe('number');
      expect(typeof settings.allowedDomainsCount).toBe('number');
    });
  });

  describe('updateSettings', () => {
    test('should update security settings', () => {
      securityManager.updateSettings({
        enforceHttps: false,
        blockMixedContent: false,
        fingerprintProtection: false
      });

      expect(securityManager.enforceHttps).toBe(false);
      expect(securityManager.blockMixedContent).toBe(false);
      expect(securityManager.fingerprintProtection).toBe(false);
    });

    test('should ignore invalid settings', () => {
      const originalHttps = securityManager.enforceHttps;
      securityManager.updateSettings({
        enforceHttps: 'not a boolean',
        invalidSetting: true
      });

      expect(securityManager.enforceHttps).toBe(originalHttps);
    });
  });

  describe('getSanitizedUserAgent', () => {
    test('should return a valid user agent string', () => {
      const userAgent = securityManager.getSanitizedUserAgent();

      expect(userAgent).toContain('Mozilla/5.0');
      expect(userAgent).toContain('AppleWebKit');
      expect(userAgent).toContain('Chrome/120.0.0.0');
    });
  });

  describe('validateCertificate', () => {
    test('should return invalid for null certificate', () => {
      const result = securityManager.validateCertificate(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('No certificate provided');
    });

    test('should return invalid for expired certificate', () => {
      const expiredCert = {
        validStart: Date.now() / 1000 - 86400 * 365 * 2, // 2 years ago
        validExpiry: Date.now() / 1000 - 86400 // Yesterday
      };

      const result = securityManager.validateCertificate(expiredCert);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Certificate has expired');
    });

    test('should return valid for current certificate', () => {
      const validCert = {
        validStart: Date.now() / 1000 - 86400, // Yesterday
        validExpiry: Date.now() / 1000 + 86400 * 365 // 1 year from now
      };

      const result = securityManager.validateCertificate(validCert);
      expect(result.valid).toBe(true);
    });
  });
});

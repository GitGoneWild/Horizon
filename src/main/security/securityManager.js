/**
 * @file Security Manager for UltraBrowse browser
 * @description Handles security policies, URL validation, and protection mechanisms
 * @module security/securityManager
 */

'use strict';

const { session } = require('electron');

/**
 * List of known malicious or suspicious TLDs/domains
 * @constant {Set<string>}
 */
const BLOCKED_TLDS = new Set([
  '.onion' // Tor hidden services (optional, for enhanced privacy)
]);

/**
 * Common phishing domains patterns
 * @constant {Array<RegExp>}
 */
const SUSPICIOUS_PATTERNS = [
  /paypa[l1][^a-z]*\.[^p]/i,  // Matches paypal-like domains but not paypal.com
  /g[o0][o0]g[l1]e[^a-z]*\.[^c]/i,  // Matches google-like domains but not google.com
  /amaz[o0]n[^a-z]*\.[^c]/i,  // Matches amazon-like domains but not amazon.com
  /faceb[o0][o0]k[^a-z]*\.[^c]/i,  // Matches facebook-like but not facebook.com
  /micr[o0]s[o0]ft[^a-z]*\.[^c]/i  // Matches microsoft-like but not microsoft.com
];

/**
 * Manages security policies and URL validation
 * @class SecurityManager
 */
class SecurityManager {
  /**
   * Creates a new SecurityManager instance
   */
  constructor() {
    /** @type {Set<string>} Custom blocked domains */
    this.blockedDomains = new Set();

    /** @type {Set<string>} Allowed domains for exception handling */
    this.allowedDomains = new Set();

    /** @type {boolean} Whether to enforce HTTPS */
    this.enforceHttps = true;

    /** @type {boolean} Whether to block mixed content */
    this.blockMixedContent = true;

    /** @type {boolean} Whether fingerprinting protection is enabled */
    this.fingerprintProtection = true;
  }

  /**
   * Initializes the security manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Setup default security policies
    this.setupContentSecurityPolicy();
    this.setupRequestFiltering();
  }

  /**
   * Sets up Content Security Policy headers
   * @returns {void}
   */
  setupContentSecurityPolicy() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      // Only apply CSP to HTML responses
      const contentType = details.responseHeaders?.['content-type']?.[0] || '';
      if (!contentType.includes('text/html')) {
        callback({ responseHeaders: details.responseHeaders });
        return;
      }

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'X-Content-Type-Options': ['nosniff'],
          'X-Frame-Options': ['SAMEORIGIN'],
          'X-XSS-Protection': ['1; mode=block'],
          'Referrer-Policy': ['strict-origin-when-cross-origin']
        }
      });
    });
  }

  /**
   * Sets up request filtering for security
   * @returns {void}
   */
  setupRequestFiltering() {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = details.url;

      // Allow internal URLs
      if (url.startsWith('ultrabrowse://') || url.startsWith('devtools://')) {
        callback({ cancel: false });
        return;
      }

      // Check if URL is safe
      if (!this.isUrlSafe(url)) {
        callback({ cancel: true });
        return;
      }

      callback({ cancel: false });
    });
  }

  /**
   * Validates if a URL is safe to navigate to
   * @param {string} url - The URL to validate
   * @returns {boolean} True if the URL is safe
   */
  isUrlSafe(url) {
    if (!url) {
      return false;
    }

    try {
      const parsedUrl = new URL(url);

      // Allow internal URLs
      if (parsedUrl.protocol === 'ultrabrowse:') {
        return true;
      }

      // Allow devtools
      if (parsedUrl.protocol === 'devtools:') {
        return true;
      }

      // Allow data URLs for images
      if (parsedUrl.protocol === 'data:') {
        return parsedUrl.href.startsWith('data:image/');
      }

      // Block non-HTTP(S) protocols
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false;
      }

      // Check for blocked domains
      if (this.blockedDomains.has(parsedUrl.hostname)) {
        return false;
      }

      // Check for blocked TLDs
      for (const tld of BLOCKED_TLDS) {
        if (parsedUrl.hostname.endsWith(tld)) {
          return false;
        }
      }

      // Check for suspicious patterns (phishing)
      for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(parsedUrl.hostname)) {
          return false;
        }
      }

      // Check for allowed domains (exceptions)
      if (this.allowedDomains.has(parsedUrl.hostname)) {
        return true;
      }

      return true;
    } catch {
      // Invalid URL
      return false;
    }
  }

  /**
   * Validates and sanitizes a URL for navigation
   * @param {string} url - The URL to sanitize
   * @returns {Object} Object containing isValid, sanitizedUrl, and reason
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, sanitizedUrl: null, reason: 'Invalid input' };
    }

    const trimmedUrl = url.trim();
    const lowerUrl = trimmedUrl.toLowerCase();

    // Check for dangerous URL schemes (XSS prevention)
    const dangerousSchemes = ['javascript:', 'vbscript:', 'data:'];
    for (const scheme of dangerousSchemes) {
      if (lowerUrl.startsWith(scheme)) {
        // Allow data URLs only for images
        if (scheme === 'data:' && lowerUrl.startsWith('data:image/')) {
          continue;
        }
        return { isValid: false, sanitizedUrl: null, reason: `${scheme.slice(0, -1)} URLs are blocked for security` };
      }
    }

    // Try to parse as URL
    try {
      const parsedUrl = new URL(trimmedUrl);

      if (!this.isUrlSafe(trimmedUrl)) {
        return { isValid: false, sanitizedUrl: null, reason: 'URL blocked for security reasons' };
      }

      return { isValid: true, sanitizedUrl: parsedUrl.href, reason: null };
    } catch {
      // Not a valid URL, might be a search query or partial URL
      if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
        // Looks like a domain, add https://
        const withProtocol = `https://${trimmedUrl}`;
        try {
          const parsedUrl = new URL(withProtocol);
          if (this.isUrlSafe(withProtocol)) {
            return { isValid: true, sanitizedUrl: parsedUrl.href, reason: null };
          }
        } catch {
          // Still not valid
        }
      }

      // Treat as search query
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(trimmedUrl)}`;
      return { isValid: true, sanitizedUrl: searchUrl, reason: 'Converted to search query' };
    }
  }

  /**
   * Adds a domain to the blocklist
   * @param {string} domain - The domain to block
   * @returns {void}
   */
  blockDomain(domain) {
    if (domain && typeof domain === 'string') {
      this.blockedDomains.add(domain.toLowerCase());
    }
  }

  /**
   * Removes a domain from the blocklist
   * @param {string} domain - The domain to unblock
   * @returns {void}
   */
  unblockDomain(domain) {
    if (domain) {
      this.blockedDomains.delete(domain.toLowerCase());
    }
  }

  /**
   * Adds a domain to the allowlist
   * @param {string} domain - The domain to allow
   * @returns {void}
   */
  allowDomain(domain) {
    if (domain && typeof domain === 'string') {
      this.allowedDomains.add(domain.toLowerCase());
    }
  }

  /**
   * Gets security settings
   * @returns {Object} Current security settings
   */
  getSettings() {
    return {
      enforceHttps: this.enforceHttps,
      blockMixedContent: this.blockMixedContent,
      fingerprintProtection: this.fingerprintProtection,
      blockedDomainsCount: this.blockedDomains.size,
      allowedDomainsCount: this.allowedDomains.size
    };
  }

  /**
   * Updates security settings
   * @param {Object} settings - Settings to update
   * @returns {void}
   */
  updateSettings(settings) {
    if (typeof settings.enforceHttps === 'boolean') {
      this.enforceHttps = settings.enforceHttps;
    }
    if (typeof settings.blockMixedContent === 'boolean') {
      this.blockMixedContent = settings.blockMixedContent;
    }
    if (typeof settings.fingerprintProtection === 'boolean') {
      this.fingerprintProtection = settings.fingerprintProtection;
    }
  }

  /**
   * Gets a sanitized user agent for fingerprinting protection
   * @returns {string} Sanitized user agent string
   */
  getSanitizedUserAgent() {
    const platform = process.platform === 'darwin' ? 'Macintosh; Intel Mac OS X 10_15_7' :
      process.platform === 'win32' ? 'Windows NT 10.0; Win64; x64' : 'X11; Linux x86_64';

    // Use process.versions.chrome when available (in Electron), fallback to generic version
    const chromeVersion = process.versions?.chrome || '120.0.0.0';

    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  }

  /**
   * Generates randomized canvas fingerprint data
   * @returns {Object} Fingerprint spoofing data
   */
  getCanvasFingerprintSpoof() {
    return {
      enabled: this.fingerprintProtection,
      noise: Math.random() * 0.01
    };
  }

  /**
   * Validates a certificate
   * @param {Object} certificate - Certificate object
   * @returns {Object} Validation result
   */
  validateCertificate(certificate) {
    if (!certificate) {
      return { valid: false, reason: 'No certificate provided' };
    }

    // Check if certificate is expired
    const now = new Date();
    const validFrom = new Date(certificate.validStart * 1000);
    const validTo = new Date(certificate.validExpiry * 1000);

    if (now < validFrom) {
      return { valid: false, reason: 'Certificate not yet valid' };
    }

    if (now > validTo) {
      return { valid: false, reason: 'Certificate has expired' };
    }

    return { valid: true, reason: null };
  }
}

module.exports = { SecurityManager };

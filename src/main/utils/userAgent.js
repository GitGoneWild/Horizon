/**
 * @file User Agent utility for UltraBrowse browser
 * @description Provides a consistent, sanitized user agent string across the application
 * @module utils/userAgent
 */

'use strict';

/**
 * Gets a sanitized user agent string for fingerprinting protection
 * This is a shared utility to avoid duplication across managers
 * @returns {string} Sanitized user agent string
 */
function getSanitizedUserAgent() {
  const platform = process.platform === 'darwin' ? 'Macintosh; Intel Mac OS X 10_15_7' :
    process.platform === 'win32' ? 'Windows NT 10.0; Win64; x64' : 'X11; Linux x86_64';

  // Use process.versions.chrome when available (in Electron), fallback to generic version
  const chromeVersion = process.versions?.chrome || '120.0.0.0';

  return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
}

module.exports = { getSanitizedUserAgent };

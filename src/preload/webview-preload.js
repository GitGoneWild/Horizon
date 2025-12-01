/**
 * @file Webview Preload script for Horizon browser
 * @description Minimal preload for webview content with security restrictions
 * @module preload/webview-preload
 */

'use strict';

// This preload script runs in the context of loaded web pages
// Keep it minimal for security - only expose what's absolutely necessary

// Prevent fingerprinting of navigator properties
const originalNavigator = window.navigator;

Object.defineProperty(window, 'navigator', {
  value: new Proxy(originalNavigator, {
    get(target, prop) {
      // Return generic values for fingerprinting properties
      switch (prop) {
      case 'hardwareConcurrency':
        return 4; // Generic value
      case 'deviceMemory':
        return 8; // Generic value
      case 'platform':
        return 'Win32'; // Generic value
      default:
        return target[prop];
      }
    }
  }),
  configurable: false,
  writable: false
});

// Block access to certain APIs that could be used for fingerprinting
// Note: This is a basic implementation; a full solution would require
// more comprehensive fingerprinting protection

// Disable WebGL fingerprinting (basic)
const getParameterOriginal = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
  // Block renderer and vendor info
  if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
    return 'Intel Inc.';
  }
  if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
    return 'Intel Iris OpenGL Engine';
  }
  return getParameterOriginal.call(this, parameter);
};

// Log page load for debugging (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log('[Horizon] Page loaded:', window.location.href);
}

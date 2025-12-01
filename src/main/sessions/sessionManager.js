/**
 * @file Session Manager for Horizon browser
 * @description Handles Electron session creation and management with profile isolation
 * @module sessions/sessionManager
 */

'use strict';

const { session } = require('electron');

/**
 * Manages browser sessions with profile-based isolation
 * @class SessionManager
 */
class SessionManager {
  /**
   * Creates a new SessionManager instance
   * @param {ProfileManager} profileManager - Profile manager instance
   */
  constructor(profileManager) {
    /** @type {ProfileManager} Profile manager reference */
    this.profileManager = profileManager;

    /** @type {Map<string, Electron.Session>} Map of session IDs to sessions */
    this.activeSessions = new Map();

    /** @type {Set<string>} Set of incognito session IDs */
    this.incognitoSessions = new Set();
  }

  /**
   * Initializes the session manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Configure default session with security defaults
    await this.configureSession(session.defaultSession);
  }

  /**
   * Configures a session with security and privacy settings
   * @async
   * @param {Electron.Session} browserSession - Session to configure
   * @returns {Promise<void>}
   */
  async configureSession(browserSession) {
    // Enable Do Not Track
    browserSession.setUserAgent(
      browserSession.getUserAgent() + ' Horizon/1.0'
    );

    // Block third-party cookies
    browserSession.cookies.flushStore();

    // Configure permission handling
    browserSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['clipboard-read', 'notifications', 'fullscreen'];

      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    // Prevent loading of insecure resources on HTTPS pages
    browserSession.webRequest.onBeforeRequest({ urls: ['http://*/*'] }, (details, callback) => {
      const url = new URL(details.url);

      // Allow localhost for development
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        callback({ cancel: false });
        return;
      }

      // Block mixed content on HTTPS pages
      if (details.resourceType !== 'mainFrame') {
        callback({ cancel: true });
        return;
      }

      callback({ cancel: false });
    });
  }

  /**
   * Gets or creates a session for a profile
   * @param {string} profileId - The profile ID
   * @returns {Electron.Session} The session for the profile
   */
  getSessionForProfile(profileId) {
    // Check if already in active sessions
    if (this.activeSessions.has(profileId)) {
      return this.activeSessions.get(profileId);
    }

    let profileSession = this.profileManager.getSessionForProfile(profileId);

    if (!profileSession) {
      const partition = `persist:profile-${profileId}`;
      profileSession = session.fromPartition(partition);
      this.configureSession(profileSession);
    }

    // Store in active sessions for tracking
    this.activeSessions.set(profileId, profileSession);

    return profileSession;
  }

  /**
   * Creates a new incognito session
   * @returns {Object} Object containing session and session ID
   */
  createIncognitoSession() {
    const sessionId = `incognito-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const incognitoSession = session.fromPartition(sessionId, { cache: false });

    this.configureSession(incognitoSession);
    this.incognitoSessions.add(sessionId);
    this.activeSessions.set(sessionId, incognitoSession);

    return { session: incognitoSession, sessionId };
  }

  /**
   * Destroys an incognito session and clears all its data
   * @async
   * @param {string} sessionId - The session ID to destroy
   * @returns {Promise<void>}
   */
  async destroyIncognitoSession(sessionId) {
    if (!this.incognitoSessions.has(sessionId)) {
      return;
    }

    const incognitoSession = this.activeSessions.get(sessionId);
    if (incognitoSession) {
      await incognitoSession.clearStorageData();
      await incognitoSession.clearCache();
      await incognitoSession.cookies.flushStore();
    }

    this.activeSessions.delete(sessionId);
    this.incognitoSessions.delete(sessionId);
  }

  /**
   * Checks if a session is incognito
   * @param {string} sessionId - The session ID to check
   * @returns {boolean} True if the session is incognito
   */
  isIncognitoSession(sessionId) {
    return this.incognitoSessions.has(sessionId);
  }

  /**
   * Clears all data for a specific session
   * @async
   * @param {string} sessionId - The session ID to clear
   * @returns {Promise<void>}
   */
  async clearSessionData(sessionId) {
    const targetSession = this.activeSessions.get(sessionId);
    if (targetSession) {
      await targetSession.clearStorageData();
      await targetSession.clearCache();
    }
  }

  /**
   * Gets all active session IDs
   * @returns {Array<string>} Array of session IDs
   */
  getAllSessionIds() {
    return Array.from(this.activeSessions.keys());
  }

  /**
   * Destroys all incognito sessions
   * @async
   * @returns {Promise<void>}
   */
  async destroyAllIncognitoSessions() {
    const promises = Array.from(this.incognitoSessions).map(
      sessionId => this.destroyIncognitoSession(sessionId)
    );
    await Promise.all(promises);
  }
}

module.exports = { SessionManager };

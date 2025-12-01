/**
 * @file Profile Manager for Horizon browser
 * @description Handles creation, deletion, and management of user profiles
 * with isolated storage for cookies, localStorage, and session data
 * @module profiles/profileManager
 */

'use strict';

const { app, session } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Store = require('electron-store');
const { getSanitizedUserAgent } = require('../utils/userAgent');

/**
 * Default profile configuration
 * @constant {Object}
 */
const DEFAULT_PROFILE = {
  id: 'default',
  name: 'Default',
  avatar: 'default',
  color: '#4285f4',
  createdAt: null,
  lastUsed: null,
  isIncognito: false
};

/**
 * Manages user profiles with isolated browsing sessions
 * @class ProfileManager
 */
class ProfileManager {
  /**
   * Creates a new ProfileManager instance
   * @constructor
   */
  constructor() {
    /** @type {Store} Persistent storage for profiles */
    this.store = new Store({
      name: 'profiles',
      defaults: {
        profiles: [{ ...DEFAULT_PROFILE, createdAt: new Date().toISOString() }],
        activeProfileId: 'default'
      }
    });

    /** @type {Map<string, Electron.Session>} Map of profile IDs to Electron sessions */
    this.sessions = new Map();

    /** @type {string} Path to profile data directory */
    this.profilesPath = path.join(app.getPath('userData'), 'Profiles');
  }

  /**
   * Initializes the profile manager
   * @async
   * @returns {Promise<void>}
   */
  async initialize() {
    // Ensure profiles directory exists
    await fs.mkdir(this.profilesPath, { recursive: true });

    // Create sessions for all existing profiles
    const profiles = this.getAllProfiles();
    for (const profile of profiles) {
      if (!profile.isIncognito) {
        await this.createSessionForProfile(profile.id);
      }
    }
  }

  /**
   * Gets all user profiles
   * @returns {Array<Object>} Array of profile objects
   */
  getAllProfiles() {
    return this.store.get('profiles', []);
  }

  /**
   * Gets a specific profile by ID
   * @param {string} profileId - The profile ID to retrieve
   * @returns {Object|null} The profile object or null if not found
   */
  getProfile(profileId) {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === profileId) || null;
  }

  /**
   * Gets the currently active profile
   * @returns {Object} The active profile object
   */
  getActiveProfile() {
    const activeId = this.store.get('activeProfileId', 'default');
    return this.getProfile(activeId) || this.getProfile('default');
  }

  /**
   * Sets the active profile
   * @param {string} profileId - The profile ID to set as active
   * @returns {boolean} True if successful, false otherwise
   */
  setActiveProfile(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) {
      return false;
    }

    this.store.set('activeProfileId', profileId);
    this.updateProfileLastUsed(profileId);
    return true;
  }

  /**
   * Creates a new user profile
   * @async
   * @param {Object} options - Profile creation options
   * @param {string} options.name - Display name for the profile
   * @param {string} [options.avatar='default'] - Avatar identifier
   * @param {string} [options.color='#4285f4'] - Theme color
   * @returns {Promise<Object>} The created profile object
   */
  async createProfile({ name, avatar = 'default', color = '#4285f4' }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Profile name is required');
    }

    const profile = {
      id: uuidv4(),
      name: name.trim(),
      avatar,
      color,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isIncognito: false
    };

    // Create profile directory
    const profileDir = path.join(this.profilesPath, profile.id);
    await fs.mkdir(profileDir, { recursive: true });

    // Create session for the new profile
    await this.createSessionForProfile(profile.id);

    // Save profile to store
    const profiles = this.getAllProfiles();
    profiles.push(profile);
    this.store.set('profiles', profiles);

    return profile;
  }

  /**
   * Deletes a user profile
   * @async
   * @param {string} profileId - The profile ID to delete
   * @returns {Promise<boolean>} True if successful
   * @throws {Error} If attempting to delete the default profile
   */
  async deleteProfile(profileId) {
    if (profileId === 'default') {
      throw new Error('Cannot delete the default profile');
    }

    const profile = this.getProfile(profileId);
    if (!profile) {
      return false;
    }

    // Clear session data
    const profileSession = this.sessions.get(profileId);
    if (profileSession) {
      await profileSession.clearStorageData();
      this.sessions.delete(profileId);
    }

    // Delete profile directory
    const profileDir = path.join(this.profilesPath, profileId);
    try {
      await fs.rm(profileDir, { recursive: true, force: true });
    } catch {
      // Directory may not exist, which is fine
    }

    // Remove from store
    const profiles = this.getAllProfiles().filter(p => p.id !== profileId);
    this.store.set('profiles', profiles);

    // If the deleted profile was active, switch to default
    if (this.store.get('activeProfileId') === profileId) {
      this.store.set('activeProfileId', 'default');
    }

    return true;
  }

  /**
   * Updates a profile's properties
   * @param {string} profileId - The profile ID to update
   * @param {Object} updates - Properties to update
   * @returns {Object|null} The updated profile or null if not found
   */
  updateProfile(profileId, updates) {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === profileId);

    if (index === -1) {
      return null;
    }

    // Only allow updating specific fields
    const allowedFields = ['name', 'avatar', 'color'];
    const safeUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    profiles[index] = { ...profiles[index], ...safeUpdates };
    this.store.set('profiles', profiles);

    return profiles[index];
  }

  /**
   * Updates the lastUsed timestamp for a profile
   * @param {string} profileId - The profile ID to update
   * @returns {void}
   */
  updateProfileLastUsed(profileId) {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === profileId);

    if (index !== -1) {
      profiles[index].lastUsed = new Date().toISOString();
      this.store.set('profiles', profiles);
    }
  }

  /**
   * Creates an Electron session for a profile with isolated storage
   * @async
   * @param {string} profileId - The profile ID to create a session for
   * @returns {Promise<Electron.Session>} The created session
   */
  async createSessionForProfile(profileId) {
    const partition = `persist:profile-${profileId}`;
    const profileSession = session.fromPartition(partition);

    // Configure session security settings
    profileSession.setUserAgent(this.getSanitizedUserAgent());

    // Block third-party cookies by default
    await profileSession.cookies.flushStore();

    this.sessions.set(profileId, profileSession);
    return profileSession;
  }

  /**
   * Gets the session for a specific profile
   * @param {string} profileId - The profile ID
   * @returns {Electron.Session|null} The session or null if not found
   */
  getSessionForProfile(profileId) {
    return this.sessions.get(profileId) || null;
  }

  /**
   * Creates an incognito (private) session
   * @returns {Electron.Session} A non-persistent session
   */
  createIncognitoSession() {
    const incognitoId = `incognito-${uuidv4()}`;
    const incognitoSession = session.fromPartition(incognitoId, { cache: false });

    // Configure for privacy
    incognitoSession.setUserAgent(this.getSanitizedUserAgent());

    return incognitoSession;
  }

  /**
   * Gets a sanitized user agent string for fingerprinting protection
   * @returns {string} Sanitized user agent
   */
  getSanitizedUserAgent() {
    return getSanitizedUserAgent();
  }

  /**
   * Clears all data for a specific profile
   * @async
   * @param {string} profileId - The profile ID to clear
   * @returns {Promise<void>}
   */
  async clearProfileData(profileId) {
    const profileSession = this.sessions.get(profileId);
    if (profileSession) {
      await profileSession.clearStorageData();
      await profileSession.clearCache();
      await profileSession.cookies.flushStore();
    }
  }

  /**
   * Exports profile data for backup
   * @async
   * @param {string} profileId - The profile ID to export
   * @returns {Promise<Object>} Profile data object
   */
  async exportProfile(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    return {
      profile: { ...profile },
      exportedAt: new Date().toISOString()
    };
  }
}

module.exports = { ProfileManager, DEFAULT_PROFILE };

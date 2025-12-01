/**
 * @file Logger utility for Horizon browser
 * @description Provides structured logging with levels and timestamps
 * @module utils/logger
 */

'use strict';

/**
 * Log levels enumeration
 * @constant {Object}
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

/**
 * Current log level (can be set via environment variable)
 * @type {number}
 */
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Logger class for structured logging
 * @class Logger
 */
class Logger {
  /**
   * Creates a new Logger instance
   * @param {string} namespace - Logger namespace/module name
   */
  constructor(namespace) {
    /** @type {string} Logger namespace */
    this.namespace = namespace;
  }

  /**
   * Formats a log message with timestamp and namespace
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted message
   */
  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.namespace}] ${message}`;
  }

  /**
   * Logs a debug message
   * @param {string} message - Message to log
   * @param {...*} args - Additional arguments
   * @returns {void}
   */
  debug(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  /**
   * Logs an info message
   * @param {string} message - Message to log
   * @param {...*} args - Additional arguments
   * @returns {void}
   */
  info(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  /**
   * Logs a warning message
   * @param {string} message - Message to log
   * @param {...*} args - Additional arguments
   * @returns {void}
   */
  warn(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  /**
   * Logs an error message
   * @param {string} message - Message to log
   * @param {...*} args - Additional arguments
   * @returns {void}
   */
  error(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  /**
   * Creates a child logger with a sub-namespace
   * @param {string} subNamespace - Child namespace
   * @returns {Logger} Child logger instance
   */
  child(subNamespace) {
    return new Logger(`${this.namespace}:${subNamespace}`);
  }
}

module.exports = { Logger, LOG_LEVELS };

/// Password service for Horizon Browser
///
/// Provides password generation and strength assessment.
library;

import 'dart:math';
import 'dart:typed_data';

import 'package:horizon_flutter/core/models/credential.dart';

/// Password generation options
class PasswordOptions {
  /// Creates password generation options
  const PasswordOptions({
    this.length = 16,
    this.includeLowercase = true,
    this.includeUppercase = true,
    this.includeNumbers = true,
    this.includeSymbols = true,
  });

  /// Password length
  final int length;

  /// Include lowercase letters
  final bool includeLowercase;

  /// Include uppercase letters
  final bool includeUppercase;

  /// Include numbers
  final bool includeNumbers;

  /// Include symbols
  final bool includeSymbols;
}

/// Service for password generation and strength assessment
class PasswordService {
  /// Creates a password service
  const PasswordService();

  static const String _lowercase = 'abcdefghijklmnopqrstuvwxyz';
  static const String _uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static const String _numbers = '0123456789';
  static const String _symbols = r'!@#$%^&*()_+-=[]{}|;:,.<>?';

  /// Generates a secure random password
  String generatePassword([PasswordOptions options = const PasswordOptions()]) {
    var charset = '';
    if (options.includeLowercase) charset += _lowercase;
    if (options.includeUppercase) charset += _uppercase;
    if (options.includeNumbers) charset += _numbers;
    if (options.includeSymbols) charset += _symbols;

    if (charset.isEmpty) {
      charset = _lowercase + _uppercase + _numbers;
    }

    final random = Random.secure();
    final charsetLength = charset.length;

    // Use rejection sampling to avoid modulo bias
    final maxValidValue = 256 - (256 % charsetLength);

    final password = StringBuffer();
    while (password.length < options.length) {
      final byte = random.nextInt(256);
      // Reject values that would cause bias
      if (byte < maxValidValue) {
        password.write(charset[byte % charsetLength]);
      }
    }

    return password.toString();
  }

  /// Assesses password strength
  PasswordStrength assessStrength(String password) {
    if (password.isEmpty) {
      return const PasswordStrength(
        score: 0,
        level: PasswordStrengthLevel.weak,
        suggestions: ['Enter a password'],
      );
    }

    var score = 0;
    final suggestions = <String>[];

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety checks
    if (RegExp('[a-z]').hasMatch(password)) score++;
    if (RegExp('[A-Z]').hasMatch(password)) score++;
    if (RegExp('[0-9]').hasMatch(password)) score++;
    if (RegExp('[^a-zA-Z0-9]').hasMatch(password)) score++;

    // Generate suggestions
    if (password.length < 12) {
      suggestions.add('Use at least 12 characters');
    }
    if (!RegExp('[A-Z]').hasMatch(password)) {
      suggestions.add('Add uppercase letters');
    }
    if (!RegExp('[0-9]').hasMatch(password)) {
      suggestions.add('Add numbers');
    }
    if (!RegExp('[^a-zA-Z0-9]').hasMatch(password)) {
      suggestions.add('Add special characters');
    }

    // Determine level
    final PasswordStrengthLevel level;
    if (score >= 6) {
      level = PasswordStrengthLevel.strong;
    } else if (score >= 4) {
      level = PasswordStrengthLevel.moderate;
    } else {
      level = PasswordStrengthLevel.weak;
    }

    return PasswordStrength(
      score: score,
      level: level,
      suggestions: suggestions,
    );
  }
}

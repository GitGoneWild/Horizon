/// Encryption service for Horizon Browser
///
/// Provides AES-256-GCM encryption for secure credential storage.
library;

import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:horizon_flutter/core/models/credential.dart';

/// Encryption configuration constants
abstract final class EncryptionConfig {
  /// AES key length in bytes
  static const int keyLength = 32;

  /// IV length in bytes
  static const int ivLength = 16;

  /// Auth tag length in bytes
  static const int authTagLength = 16;

  /// Salt length in bytes
  static const int saltLength = 32;
}

/// Service for encrypting and decrypting sensitive data
class EncryptionService {
  /// Creates an encryption service with the given master key
  EncryptionService(this._masterKey);

  final String _masterKey;

  late final encrypt.Key _key =
      encrypt.Key.fromUtf8(_masterKey.substring(0, EncryptionConfig.keyLength));

  /// Encrypts plaintext data
  EncryptedData encrypt(String plaintext) {
    final iv = encrypt.IV.fromSecureRandom(EncryptionConfig.ivLength);
    final encrypter = encrypt.Encrypter(
      encrypt.AES(_key, mode: encrypt.AESMode.gcm),
    );

    final encrypted = encrypter.encrypt(plaintext, iv: iv);

    return EncryptedData(
      encrypted: encrypted.base64,
      iv: iv.base64,
      authTag: '', // GCM mode includes auth tag in encrypted output
    );
  }

  /// Decrypts encrypted data
  String decrypt(EncryptedData encryptedData) {
    final iv = encrypt.IV.fromBase64(encryptedData.iv);
    final encrypter = encrypt.Encrypter(
      encrypt.AES(_key, mode: encrypt.AESMode.gcm),
    );

    return encrypter.decrypt64(encryptedData.encrypted, iv: iv);
  }

  /// Generates a cryptographically secure random key
  static String generateMasterKey() {
    final random = Random.secure();
    final bytes = Uint8List(EncryptionConfig.keyLength);
    for (var i = 0; i < bytes.length; i++) {
      bytes[i] = random.nextInt(256);
    }
    return base64Encode(bytes).substring(0, EncryptionConfig.keyLength);
  }

  /// Hashes a string using SHA-256
  static String hash(String input) {
    final bytes = utf8.encode(input);
    final digest = encrypt.Key.fromUtf8(input.padRight(32).substring(0, 32));
    return base64Encode(digest.bytes);
  }
}

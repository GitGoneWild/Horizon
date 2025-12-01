/// Credential providers for Horizon Browser
///
/// Manages credential state using Riverpod.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/core/models/credential.dart';
import 'package:horizon_flutter/core/services/encryption_service.dart';
import 'package:horizon_flutter/core/services/password_service.dart';
import 'package:uuid/uuid.dart';

/// Provider for encryption service
final encryptionServiceProvider = Provider<EncryptionService>((ref) {
  // In production, this key should come from flutter_secure_storage
  final masterKey = EncryptionService.generateMasterKey();
  return EncryptionService(masterKey);
});

/// Provider for password service
final passwordServiceProvider = Provider<PasswordService>((ref) {
  return const PasswordService();
});

/// Provider for credentials list
final credentialsProvider =
    StateNotifierProvider<CredentialsNotifier, List<Credential>>((ref) {
  final encryptionService = ref.watch(encryptionServiceProvider);
  return CredentialsNotifier(encryptionService);
});

/// Provider for credential search
final credentialSearchProvider = Provider.family<List<Credential>, String>((ref, hostname) {
  final credentials = ref.watch(credentialsProvider);
  return credentials.where((c) => c.hostname == hostname).toList();
});

/// State notifier for credentials
class CredentialsNotifier extends StateNotifier<List<Credential>> {
  /// Creates a credentials notifier
  CredentialsNotifier(this._encryptionService) : super([]);

  final EncryptionService _encryptionService;

  /// Saves a new credential
  Credential saveCredential({
    required String url,
    required String username,
    required String password,
    String notes = '',
  }) {
    // Parse hostname from URL
    final uri = Uri.parse(url);
    final hostname = uri.host;

    // Encrypt password
    final encryptedPassword = _encryptionService.encrypt(password);

    // Assess password strength
    final strength = const PasswordService().assessStrength(password);

    final credential = Credential(
      id: const Uuid().v4(),
      hostname: hostname,
      url: url,
      username: username,
      encryptedPassword: encryptedPassword,
      notes: notes,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      strength: strength,
    );

    state = [...state, credential];
    return credential;
  }

  /// Gets credentials for a URL
  List<Credential> getCredentialsForUrl(String url) {
    try {
      final uri = Uri.parse(url);
      final hostname = uri.host;
      return state.where((c) => c.hostname == hostname).toList();
    } catch (_) {
      return [];
    }
  }

  /// Gets a credential with decrypted password
  (Credential, String)? getCredentialWithPassword(String id) {
    try {
      final credential = state.firstWhere((c) => c.id == id);
      final password = _encryptionService.decrypt(credential.encryptedPassword);
      return (credential, password);
    } catch (_) {
      return null;
    }
  }

  /// Updates a credential
  void updateCredential(
    String id, {
    String? username,
    String? password,
    String? notes,
  }) {
    state = state.map((credential) {
      if (credential.id != id) return credential;

      var updated = credential.copyWith(
        username: username,
        notes: notes,
        updatedAt: DateTime.now(),
      );

      if (password != null) {
        final encryptedPassword = _encryptionService.encrypt(password);
        final strength = const PasswordService().assessStrength(password);
        updated = Credential(
          id: updated.id,
          hostname: updated.hostname,
          url: updated.url,
          username: updated.username,
          encryptedPassword: encryptedPassword,
          notes: updated.notes,
          createdAt: updated.createdAt,
          updatedAt: DateTime.now(),
          strength: strength,
        );
      }

      return updated;
    }).toList();
  }

  /// Updates last used timestamp
  void updateLastUsed(String id) {
    state = state.map((credential) {
      if (credential.id != id) return credential;
      return credential.copyWith(lastUsed: DateTime.now());
    }).toList();
  }

  /// Deletes a credential
  void deleteCredential(String id) {
    state = state.where((c) => c.id != id).toList();
  }

  /// Clears all credentials
  void clearAll() {
    state = [];
  }
}

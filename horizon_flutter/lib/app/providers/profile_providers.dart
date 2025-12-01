/// Profile providers for Horizon Browser
///
/// Manages profile state using Riverpod.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/core/models/profile.dart';
import 'package:uuid/uuid.dart';

/// Provider for profile repository
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepository();
});

/// Provider for the list of profiles
final profilesProvider =
    StateNotifierProvider<ProfilesNotifier, List<Profile>>((ref) {
  final repository = ref.watch(profileRepositoryProvider);
  return ProfilesNotifier(repository);
});

/// Provider for the active profile
final activeProfileProvider = Provider<Profile>((ref) {
  final profiles = ref.watch(profilesProvider);
  final activeId = ref.watch(activeProfileIdProvider);
  return profiles.firstWhere(
    (p) => p.id == activeId,
    orElse: () => profiles.first,
  );
});

/// Provider for the active profile ID
final activeProfileIdProvider = StateProvider<String>((ref) => 'default');

/// Profile repository for persistent storage
class ProfileRepository {
  final List<Profile> _profiles = [Profile.defaultProfile()];
  String _activeProfileId = 'default';

  /// Gets all profiles
  List<Profile> getAllProfiles() => List.unmodifiable(_profiles);

  /// Gets a profile by ID
  Profile? getProfile(String id) {
    try {
      return _profiles.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Gets the active profile ID
  String getActiveProfileId() => _activeProfileId;

  /// Sets the active profile
  void setActiveProfile(String id) {
    _activeProfileId = id;
  }

  /// Creates a new profile
  Profile createProfile({
    required String name,
    String avatar = 'default',
    String color = '#4285f4',
  }) {
    final profile = Profile(
      id: const Uuid().v4(),
      name: name,
      avatar: avatar,
      color: color,
      createdAt: DateTime.now(),
    );
    _profiles.add(profile);
    return profile;
  }

  /// Updates a profile
  Profile? updateProfile(String id, {String? name, String? avatar, String? color}) {
    final index = _profiles.indexWhere((p) => p.id == id);
    if (index == -1) return null;

    _profiles[index] = _profiles[index].copyWith(
      name: name,
      avatar: avatar,
      color: color,
    );
    return _profiles[index];
  }

  /// Deletes a profile
  bool deleteProfile(String id) {
    if (id == 'default') return false;
    return _profiles.removeWhere((p) => p.id == id) > 0;
  }
}

/// State notifier for profiles
class ProfilesNotifier extends StateNotifier<List<Profile>> {
  /// Creates a profiles notifier
  ProfilesNotifier(this._repository)
      : super(_repository.getAllProfiles());

  final ProfileRepository _repository;

  /// Creates a new profile
  Profile createProfile({
    required String name,
    String avatar = 'default',
    String color = '#4285f4',
  }) {
    final profile = _repository.createProfile(
      name: name,
      avatar: avatar,
      color: color,
    );
    state = _repository.getAllProfiles();
    return profile;
  }

  /// Updates a profile
  void updateProfile(
    String id, {
    String? name,
    String? avatar,
    String? color,
  }) {
    _repository.updateProfile(id, name: name, avatar: avatar, color: color);
    state = _repository.getAllProfiles();
  }

  /// Deletes a profile
  void deleteProfile(String id) {
    _repository.deleteProfile(id);
    state = _repository.getAllProfiles();
  }

  /// Refreshes the profiles list
  void refresh() {
    state = _repository.getAllProfiles();
  }
}

/// Settings providers for Horizon Browser
///
/// Manages settings state using Riverpod.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/core/models/settings.dart';

/// Provider for settings
final settingsProvider =
    StateNotifierProvider<SettingsNotifier, AppSettings>((ref) {
  return SettingsNotifier();
});

/// Provider for theme mode
final themeModeProvider = Provider<ThemeMode>((ref) {
  return ref.watch(settingsProvider).appearance.theme;
});

/// Provider for search engine
final searchEngineProvider = Provider<String>((ref) {
  return ref.watch(settingsProvider).general.searchEngine.url;
});

/// Provider for privacy settings
final privacySettingsProvider = Provider<PrivacySettings>((ref) {
  return ref.watch(settingsProvider).privacy;
});

/// Provider for security settings
final securitySettingsProvider = Provider<SecuritySettings>((ref) {
  return ref.watch(settingsProvider).security;
});

/// Provider for performance settings
final performanceSettingsProvider = Provider<PerformanceSettings>((ref) {
  return ref.watch(settingsProvider).performance;
});

/// State notifier for settings
class SettingsNotifier extends StateNotifier<AppSettings> {
  /// Creates a settings notifier
  SettingsNotifier() : super(AppSettings.defaults());

  /// Updates general settings
  void updateGeneral(GeneralSettings settings) {
    state = state.copyWith(general: settings);
  }

  /// Updates appearance settings
  void updateAppearance(AppearanceSettings settings) {
    state = state.copyWith(appearance: settings);
  }

  /// Updates privacy settings
  void updatePrivacy(PrivacySettings settings) {
    state = state.copyWith(privacy: settings);
  }

  /// Updates security settings
  void updateSecurity(SecuritySettings settings) {
    state = state.copyWith(security: settings);
  }

  /// Updates performance settings
  void updatePerformance(PerformanceSettings settings) {
    state = state.copyWith(performance: settings);
  }

  /// Updates sync settings
  void updateSync(SyncSettings settings) {
    state = state.copyWith(sync: settings);
  }

  /// Sets the theme mode
  void setTheme(ThemeMode theme) {
    state = state.copyWith(
      appearance: state.appearance.copyWith(theme: theme),
    );
  }

  /// Sets the homepage
  void setHomepage(String homepage) {
    state = state.copyWith(
      general: state.general.copyWith(homepage: homepage),
    );
  }

  /// Sets the search engine
  void setSearchEngine(
      horizon_flutter_core_constants_app_constants.SearchEngine engine) {
    state = state.copyWith(
      general: state.general.copyWith(searchEngine: engine),
    );
  }

  /// Toggles a privacy setting
  void togglePrivacySetting(String key) {
    final privacy = state.privacy;
    switch (key) {
      case 'doNotTrack':
        state = state.copyWith(
          privacy: privacy.copyWith(doNotTrack: !privacy.doNotTrack),
        );
      case 'blockThirdPartyCookies':
        state = state.copyWith(
          privacy: privacy.copyWith(
            blockThirdPartyCookies: !privacy.blockThirdPartyCookies,
          ),
        );
      case 'clearDataOnExit':
        state = state.copyWith(
          privacy: privacy.copyWith(clearDataOnExit: !privacy.clearDataOnExit),
        );
      case 'fingerprintProtection':
        state = state.copyWith(
          privacy: privacy.copyWith(
            fingerprintProtection: !privacy.fingerprintProtection,
          ),
        );
      case 'blockTrackers':
        state = state.copyWith(
          privacy: privacy.copyWith(blockTrackers: !privacy.blockTrackers),
        );
      case 'httpsOnly':
        state = state.copyWith(
          privacy: privacy.copyWith(httpsOnly: !privacy.httpsOnly),
        );
    }
  }

  /// Resets settings to defaults
  void resetToDefaults() {
    state = AppSettings.defaults();
  }

  /// Loads settings from JSON
  void loadFromJson(Map<String, dynamic> json) {
    state = AppSettings.fromJson(json);
  }
}

// Import for SearchEngine enum reference
import 'package:horizon_flutter/core/constants/app_constants.dart'
    as horizon_flutter_core_constants_app_constants;

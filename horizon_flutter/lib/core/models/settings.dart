/// Settings model for Horizon Browser
///
/// Represents application settings with typed configuration.
library;

import 'package:equatable/equatable.dart';
import 'package:horizon_flutter/core/constants/app_constants.dart';

/// Application settings model
class AppSettings extends Equatable {
  /// Creates new app settings
  const AppSettings({
    required this.general,
    required this.appearance,
    required this.privacy,
    required this.security,
    required this.performance,
    required this.sync,
  });

  /// Creates settings from JSON map
  factory AppSettings.fromJson(Map<String, dynamic> json) => AppSettings(
        general: GeneralSettings.fromJson(
          json['general'] as Map<String, dynamic>? ?? {},
        ),
        appearance: AppearanceSettings.fromJson(
          json['appearance'] as Map<String, dynamic>? ?? {},
        ),
        privacy: PrivacySettings.fromJson(
          json['privacy'] as Map<String, dynamic>? ?? {},
        ),
        security: SecuritySettings.fromJson(
          json['security'] as Map<String, dynamic>? ?? {},
        ),
        performance: PerformanceSettings.fromJson(
          json['performance'] as Map<String, dynamic>? ?? {},
        ),
        sync: SyncSettings.fromJson(
          json['sync'] as Map<String, dynamic>? ?? {},
        ),
      );

  /// Creates default settings
  factory AppSettings.defaults() => const AppSettings(
        general: GeneralSettings(),
        appearance: AppearanceSettings(),
        privacy: PrivacySettings(),
        security: SecuritySettings(),
        performance: PerformanceSettings(),
        sync: SyncSettings(),
      );

  /// General settings
  final GeneralSettings general;

  /// Appearance settings
  final AppearanceSettings appearance;

  /// Privacy settings
  final PrivacySettings privacy;

  /// Security settings
  final SecuritySettings security;

  /// Performance settings
  final PerformanceSettings performance;

  /// Sync settings
  final SyncSettings sync;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'general': general.toJson(),
        'appearance': appearance.toJson(),
        'privacy': privacy.toJson(),
        'security': security.toJson(),
        'performance': performance.toJson(),
        'sync': sync.toJson(),
      };

  /// Creates a copy with the given fields replaced
  AppSettings copyWith({
    GeneralSettings? general,
    AppearanceSettings? appearance,
    PrivacySettings? privacy,
    SecuritySettings? security,
    PerformanceSettings? performance,
    SyncSettings? sync,
  }) =>
      AppSettings(
        general: general ?? this.general,
        appearance: appearance ?? this.appearance,
        privacy: privacy ?? this.privacy,
        security: security ?? this.security,
        performance: performance ?? this.performance,
        sync: sync ?? this.sync,
      );

  @override
  List<Object?> get props => [
        general,
        appearance,
        privacy,
        security,
        performance,
        sync,
      ];
}

/// General browser settings
class GeneralSettings extends Equatable {
  /// Creates general settings
  const GeneralSettings({
    this.homepage = AppConstants.defaultHomepage,
    this.searchEngine = SearchEngine.duckduckgo,
    this.startupBehavior = StartupBehavior.lastSession,
    this.downloadLocation,
    this.language = 'en-US',
  });

  /// Creates from JSON map
  factory GeneralSettings.fromJson(Map<String, dynamic> json) =>
      GeneralSettings(
        homepage: json['homepage'] as String? ?? AppConstants.defaultHomepage,
        searchEngine: SearchEngine.values.firstWhere(
          (e) => e.name == json['searchEngine'],
          orElse: () => SearchEngine.duckduckgo,
        ),
        startupBehavior: StartupBehavior.values.firstWhere(
          (e) => e.name == json['startupBehavior'],
          orElse: () => StartupBehavior.lastSession,
        ),
        downloadLocation: json['downloadLocation'] as String?,
        language: json['language'] as String? ?? 'en-US',
      );

  /// Homepage URL
  final String homepage;

  /// Default search engine
  final SearchEngine searchEngine;

  /// Startup behavior
  final StartupBehavior startupBehavior;

  /// Download location (null = ask each time)
  final String? downloadLocation;

  /// Language code
  final String language;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'homepage': homepage,
        'searchEngine': searchEngine.name,
        'startupBehavior': startupBehavior.name,
        'downloadLocation': downloadLocation,
        'language': language,
      };

  /// Creates a copy with the given fields replaced
  GeneralSettings copyWith({
    String? homepage,
    SearchEngine? searchEngine,
    StartupBehavior? startupBehavior,
    String? downloadLocation,
    String? language,
  }) =>
      GeneralSettings(
        homepage: homepage ?? this.homepage,
        searchEngine: searchEngine ?? this.searchEngine,
        startupBehavior: startupBehavior ?? this.startupBehavior,
        downloadLocation: downloadLocation ?? this.downloadLocation,
        language: language ?? this.language,
      );

  @override
  List<Object?> get props => [
        homepage,
        searchEngine,
        startupBehavior,
        downloadLocation,
        language,
      ];
}

/// Startup behavior options
enum StartupBehavior {
  /// Open homepage on startup
  homepage,

  /// Restore last session
  lastSession,

  /// Open blank page
  blank,
}

/// Appearance settings
class AppearanceSettings extends Equatable {
  /// Creates appearance settings
  const AppearanceSettings({
    this.theme = ThemeMode.system,
    this.fontSize = FontSize.medium,
    this.showBookmarksBar = true,
    this.showHomeButton = true,
    this.compactMode = false,
  });

  /// Creates from JSON map
  factory AppearanceSettings.fromJson(Map<String, dynamic> json) =>
      AppearanceSettings(
        theme: ThemeMode.values.firstWhere(
          (e) => e.name == json['theme'],
          orElse: () => ThemeMode.system,
        ),
        fontSize: FontSize.values.firstWhere(
          (e) => e.name == json['fontSize'],
          orElse: () => FontSize.medium,
        ),
        showBookmarksBar: json['showBookmarksBar'] as bool? ?? true,
        showHomeButton: json['showHomeButton'] as bool? ?? true,
        compactMode: json['compactMode'] as bool? ?? false,
      );

  /// Theme mode
  final ThemeMode theme;

  /// Font size
  final FontSize fontSize;

  /// Show bookmarks bar
  final bool showBookmarksBar;

  /// Show home button
  final bool showHomeButton;

  /// Use compact mode
  final bool compactMode;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'theme': theme.name,
        'fontSize': fontSize.name,
        'showBookmarksBar': showBookmarksBar,
        'showHomeButton': showHomeButton,
        'compactMode': compactMode,
      };

  /// Creates a copy with the given fields replaced
  AppearanceSettings copyWith({
    ThemeMode? theme,
    FontSize? fontSize,
    bool? showBookmarksBar,
    bool? showHomeButton,
    bool? compactMode,
  }) =>
      AppearanceSettings(
        theme: theme ?? this.theme,
        fontSize: fontSize ?? this.fontSize,
        showBookmarksBar: showBookmarksBar ?? this.showBookmarksBar,
        showHomeButton: showHomeButton ?? this.showHomeButton,
        compactMode: compactMode ?? this.compactMode,
      );

  @override
  List<Object?> get props => [
        theme,
        fontSize,
        showBookmarksBar,
        showHomeButton,
        compactMode,
      ];
}

/// Theme mode options
enum ThemeMode {
  /// Light theme
  light,

  /// Dark theme
  dark,

  /// Follow system setting
  system,
}

/// Font size options
enum FontSize {
  /// Small font size
  small,

  /// Medium font size
  medium,

  /// Large font size
  large,
}

/// Privacy settings
class PrivacySettings extends Equatable {
  /// Creates privacy settings
  const PrivacySettings({
    this.doNotTrack = true,
    this.blockThirdPartyCookies = true,
    this.clearDataOnExit = false,
    this.fingerprintProtection = true,
    this.blockTrackers = true,
    this.httpsOnly = false,
  });

  /// Creates from JSON map
  factory PrivacySettings.fromJson(Map<String, dynamic> json) =>
      PrivacySettings(
        doNotTrack: json['doNotTrack'] as bool? ?? true,
        blockThirdPartyCookies:
            json['blockThirdPartyCookies'] as bool? ?? true,
        clearDataOnExit: json['clearDataOnExit'] as bool? ?? false,
        fingerprintProtection: json['fingerprintProtection'] as bool? ?? true,
        blockTrackers: json['blockTrackers'] as bool? ?? true,
        httpsOnly: json['httpsOnly'] as bool? ?? false,
      );

  /// Send Do Not Track header
  final bool doNotTrack;

  /// Block third-party cookies
  final bool blockThirdPartyCookies;

  /// Clear data on exit
  final bool clearDataOnExit;

  /// Enable fingerprint protection
  final bool fingerprintProtection;

  /// Block trackers
  final bool blockTrackers;

  /// HTTPS-only mode
  final bool httpsOnly;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'doNotTrack': doNotTrack,
        'blockThirdPartyCookies': blockThirdPartyCookies,
        'clearDataOnExit': clearDataOnExit,
        'fingerprintProtection': fingerprintProtection,
        'blockTrackers': blockTrackers,
        'httpsOnly': httpsOnly,
      };

  /// Creates a copy with the given fields replaced
  PrivacySettings copyWith({
    bool? doNotTrack,
    bool? blockThirdPartyCookies,
    bool? clearDataOnExit,
    bool? fingerprintProtection,
    bool? blockTrackers,
    bool? httpsOnly,
  }) =>
      PrivacySettings(
        doNotTrack: doNotTrack ?? this.doNotTrack,
        blockThirdPartyCookies:
            blockThirdPartyCookies ?? this.blockThirdPartyCookies,
        clearDataOnExit: clearDataOnExit ?? this.clearDataOnExit,
        fingerprintProtection:
            fingerprintProtection ?? this.fingerprintProtection,
        blockTrackers: blockTrackers ?? this.blockTrackers,
        httpsOnly: httpsOnly ?? this.httpsOnly,
      );

  @override
  List<Object?> get props => [
        doNotTrack,
        blockThirdPartyCookies,
        clearDataOnExit,
        fingerprintProtection,
        blockTrackers,
        httpsOnly,
      ];
}

/// Security settings
class SecuritySettings extends Equatable {
  /// Creates security settings
  const SecuritySettings({
    this.safeBrowsing = true,
    this.blockMixedContent = true,
    this.warnOnUnsecurePasswords = true,
    this.blockDangerousDownloads = true,
  });

  /// Creates from JSON map
  factory SecuritySettings.fromJson(Map<String, dynamic> json) =>
      SecuritySettings(
        safeBrowsing: json['safeBrowsing'] as bool? ?? true,
        blockMixedContent: json['blockMixedContent'] as bool? ?? true,
        warnOnUnsecurePasswords: json['warnOnUnsecurePasswords'] as bool? ?? true,
        blockDangerousDownloads: json['blockDangerousDownloads'] as bool? ?? true,
      );

  /// Enable safe browsing
  final bool safeBrowsing;

  /// Block mixed content
  final bool blockMixedContent;

  /// Warn on unsecure password forms
  final bool warnOnUnsecurePasswords;

  /// Block dangerous downloads
  final bool blockDangerousDownloads;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'safeBrowsing': safeBrowsing,
        'blockMixedContent': blockMixedContent,
        'warnOnUnsecurePasswords': warnOnUnsecurePasswords,
        'blockDangerousDownloads': blockDangerousDownloads,
      };

  /// Creates a copy with the given fields replaced
  SecuritySettings copyWith({
    bool? safeBrowsing,
    bool? blockMixedContent,
    bool? warnOnUnsecurePasswords,
    bool? blockDangerousDownloads,
  }) =>
      SecuritySettings(
        safeBrowsing: safeBrowsing ?? this.safeBrowsing,
        blockMixedContent: blockMixedContent ?? this.blockMixedContent,
        warnOnUnsecurePasswords:
            warnOnUnsecurePasswords ?? this.warnOnUnsecurePasswords,
        blockDangerousDownloads:
            blockDangerousDownloads ?? this.blockDangerousDownloads,
      );

  @override
  List<Object?> get props => [
        safeBrowsing,
        blockMixedContent,
        warnOnUnsecurePasswords,
        blockDangerousDownloads,
      ];
}

/// Performance settings
class PerformanceSettings extends Equatable {
  /// Creates performance settings
  const PerformanceSettings({
    this.hardwareAcceleration = true,
    this.lazyLoadTabs = true,
    this.suspendInactiveTabs = true,
    this.inactiveTabTimeout = 30,
    this.preloadTopSites = true,
  });

  /// Creates from JSON map
  factory PerformanceSettings.fromJson(Map<String, dynamic> json) =>
      PerformanceSettings(
        hardwareAcceleration: json['hardwareAcceleration'] as bool? ?? true,
        lazyLoadTabs: json['lazyLoadTabs'] as bool? ?? true,
        suspendInactiveTabs: json['suspendInactiveTabs'] as bool? ?? true,
        inactiveTabTimeout: json['inactiveTabTimeout'] as int? ?? 30,
        preloadTopSites: json['preloadTopSites'] as bool? ?? true,
      );

  /// Enable hardware acceleration
  final bool hardwareAcceleration;

  /// Lazy load tabs
  final bool lazyLoadTabs;

  /// Suspend inactive tabs
  final bool suspendInactiveTabs;

  /// Inactive tab timeout (minutes)
  final int inactiveTabTimeout;

  /// Preload top sites
  final bool preloadTopSites;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'hardwareAcceleration': hardwareAcceleration,
        'lazyLoadTabs': lazyLoadTabs,
        'suspendInactiveTabs': suspendInactiveTabs,
        'inactiveTabTimeout': inactiveTabTimeout,
        'preloadTopSites': preloadTopSites,
      };

  /// Creates a copy with the given fields replaced
  PerformanceSettings copyWith({
    bool? hardwareAcceleration,
    bool? lazyLoadTabs,
    bool? suspendInactiveTabs,
    int? inactiveTabTimeout,
    bool? preloadTopSites,
  }) =>
      PerformanceSettings(
        hardwareAcceleration: hardwareAcceleration ?? this.hardwareAcceleration,
        lazyLoadTabs: lazyLoadTabs ?? this.lazyLoadTabs,
        suspendInactiveTabs: suspendInactiveTabs ?? this.suspendInactiveTabs,
        inactiveTabTimeout: inactiveTabTimeout ?? this.inactiveTabTimeout,
        preloadTopSites: preloadTopSites ?? this.preloadTopSites,
      );

  @override
  List<Object?> get props => [
        hardwareAcceleration,
        lazyLoadTabs,
        suspendInactiveTabs,
        inactiveTabTimeout,
        preloadTopSites,
      ];
}

/// Sync settings
class SyncSettings extends Equatable {
  /// Creates sync settings
  const SyncSettings({
    this.enabled = false,
    this.bookmarks = true,
    this.history = true,
    this.passwords = true,
    this.extensions = true,
  });

  /// Creates from JSON map
  factory SyncSettings.fromJson(Map<String, dynamic> json) => SyncSettings(
        enabled: json['enabled'] as bool? ?? false,
        bookmarks: json['bookmarks'] as bool? ?? true,
        history: json['history'] as bool? ?? true,
        passwords: json['passwords'] as bool? ?? true,
        extensions: json['extensions'] as bool? ?? true,
      );

  /// Sync enabled
  final bool enabled;

  /// Sync bookmarks
  final bool bookmarks;

  /// Sync history
  final bool history;

  /// Sync passwords
  final bool passwords;

  /// Sync extensions
  final bool extensions;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'enabled': enabled,
        'bookmarks': bookmarks,
        'history': history,
        'passwords': passwords,
        'extensions': extensions,
      };

  /// Creates a copy with the given fields replaced
  SyncSettings copyWith({
    bool? enabled,
    bool? bookmarks,
    bool? history,
    bool? passwords,
    bool? extensions,
  }) =>
      SyncSettings(
        enabled: enabled ?? this.enabled,
        bookmarks: bookmarks ?? this.bookmarks,
        history: history ?? this.history,
        passwords: passwords ?? this.passwords,
        extensions: extensions ?? this.extensions,
      );

  @override
  List<Object?> get props => [
        enabled,
        bookmarks,
        history,
        passwords,
        extensions,
      ];
}

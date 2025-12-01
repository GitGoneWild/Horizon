/// Tab model for Horizon Browser
///
/// Represents a browser tab with navigation state.
library;

import 'package:equatable/equatable.dart';

/// Represents a browser tab
class BrowserTab extends Equatable {
  /// Creates a new browser tab
  const BrowserTab({
    required this.id,
    required this.url,
    this.title = 'New Tab',
    this.isActive = false,
    this.isLoading = false,
    this.canGoBack = false,
    this.canGoForward = false,
    this.favicon,
    this.isIncognito = false,
    required this.profileId,
    required this.sessionId,
    required this.createdAt,
    this.error,
  });

  /// Creates a tab from JSON map
  factory BrowserTab.fromJson(Map<String, dynamic> json) => BrowserTab(
        id: json['id'] as String,
        url: json['url'] as String,
        title: json['title'] as String? ?? 'New Tab',
        isActive: json['isActive'] as bool? ?? false,
        isLoading: json['isLoading'] as bool? ?? false,
        canGoBack: json['canGoBack'] as bool? ?? false,
        canGoForward: json['canGoForward'] as bool? ?? false,
        favicon: json['favicon'] as String?,
        isIncognito: json['isIncognito'] as bool? ?? false,
        profileId: json['profileId'] as String,
        sessionId: json['sessionId'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        error: json['error'] != null
            ? TabError.fromJson(json['error'] as Map<String, dynamic>)
            : null,
      );

  /// Creates a new tab with default values
  factory BrowserTab.create({
    required String id,
    String url = 'horizon://newtab',
    String profileId = 'default',
    String? sessionId,
    bool isIncognito = false,
  }) =>
      BrowserTab(
        id: id,
        url: url,
        profileId: profileId,
        sessionId: sessionId ?? profileId,
        isIncognito: isIncognito,
        createdAt: DateTime.now(),
      );

  /// Unique tab identifier
  final String id;

  /// Current URL
  final String url;

  /// Page title
  final String title;

  /// Whether this tab is currently active
  final bool isActive;

  /// Whether the tab is loading
  final bool isLoading;

  /// Whether the tab can navigate back
  final bool canGoBack;

  /// Whether the tab can navigate forward
  final bool canGoForward;

  /// Favicon URL
  final String? favicon;

  /// Whether this is an incognito tab
  final bool isIncognito;

  /// Associated profile ID
  final String profileId;

  /// Session ID for isolation
  final String sessionId;

  /// When the tab was created
  final DateTime createdAt;

  /// Error information if loading failed
  final TabError? error;

  /// Converts the tab to a JSON map
  Map<String, dynamic> toJson() => {
        'id': id,
        'url': url,
        'title': title,
        'isActive': isActive,
        'isLoading': isLoading,
        'canGoBack': canGoBack,
        'canGoForward': canGoForward,
        'favicon': favicon,
        'isIncognito': isIncognito,
        'profileId': profileId,
        'sessionId': sessionId,
        'createdAt': createdAt.toIso8601String(),
        'error': error?.toJson(),
      };

  /// Creates a copy of this tab with the given fields replaced
  BrowserTab copyWith({
    String? id,
    String? url,
    String? title,
    bool? isActive,
    bool? isLoading,
    bool? canGoBack,
    bool? canGoForward,
    String? favicon,
    bool? isIncognito,
    String? profileId,
    String? sessionId,
    DateTime? createdAt,
    TabError? error,
  }) =>
      BrowserTab(
        id: id ?? this.id,
        url: url ?? this.url,
        title: title ?? this.title,
        isActive: isActive ?? this.isActive,
        isLoading: isLoading ?? this.isLoading,
        canGoBack: canGoBack ?? this.canGoBack,
        canGoForward: canGoForward ?? this.canGoForward,
        favicon: favicon ?? this.favicon,
        isIncognito: isIncognito ?? this.isIncognito,
        profileId: profileId ?? this.profileId,
        sessionId: sessionId ?? this.sessionId,
        createdAt: createdAt ?? this.createdAt,
        error: error ?? this.error,
      );

  @override
  List<Object?> get props => [
        id,
        url,
        title,
        isActive,
        isLoading,
        canGoBack,
        canGoForward,
        favicon,
        isIncognito,
        profileId,
        sessionId,
        createdAt,
        error,
      ];
}

/// Represents an error that occurred while loading a tab
class TabError extends Equatable {
  /// Creates a new tab error
  const TabError({
    required this.code,
    required this.description,
  });

  /// Creates a tab error from JSON map
  factory TabError.fromJson(Map<String, dynamic> json) => TabError(
        code: json['code'] as int,
        description: json['description'] as String,
      );

  /// Error code
  final int code;

  /// Error description
  final String description;

  /// Converts the error to a JSON map
  Map<String, dynamic> toJson() => {
        'code': code,
        'description': description,
      };

  @override
  List<Object?> get props => [code, description];
}

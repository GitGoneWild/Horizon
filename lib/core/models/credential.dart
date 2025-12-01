/// Credential model for Horizon Browser
///
/// Represents stored credentials with encryption support.
library;

import 'package:equatable/equatable.dart';

/// Represents a stored credential
class Credential extends Equatable {
  /// Creates a new credential
  const Credential({
    required this.id,
    required this.hostname,
    required this.url,
    required this.username,
    required this.encryptedPassword,
    this.notes = '',
    required this.createdAt,
    required this.updatedAt,
    this.lastUsed,
    required this.strength,
  });

  /// Creates a credential from JSON map
  factory Credential.fromJson(Map<String, dynamic> json) => Credential(
        id: json['id'] as String,
        hostname: json['hostname'] as String,
        url: json['url'] as String,
        username: json['username'] as String,
        encryptedPassword: EncryptedData.fromJson(
          json['password'] as Map<String, dynamic>,
        ),
        notes: json['notes'] as String? ?? '',
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        lastUsed: json['lastUsed'] != null
            ? DateTime.parse(json['lastUsed'] as String)
            : null,
        strength: PasswordStrength.fromJson(
          json['strength'] as Map<String, dynamic>,
        ),
      );

  /// Unique credential identifier
  final String id;

  /// Website hostname
  final String hostname;

  /// Full URL
  final String url;

  /// Username or email
  final String username;

  /// Encrypted password data
  final EncryptedData encryptedPassword;

  /// Optional notes
  final String notes;

  /// When the credential was created
  final DateTime createdAt;

  /// When the credential was last updated
  final DateTime updatedAt;

  /// When the credential was last used
  final DateTime? lastUsed;

  /// Password strength assessment
  final PasswordStrength strength;

  /// Converts the credential to a JSON map
  Map<String, dynamic> toJson() => {
        'id': id,
        'hostname': hostname,
        'url': url,
        'username': username,
        'password': encryptedPassword.toJson(),
        'notes': notes,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'lastUsed': lastUsed?.toIso8601String(),
        'strength': strength.toJson(),
      };

  /// Creates a copy with the given fields replaced
  Credential copyWith({
    String? id,
    String? hostname,
    String? url,
    String? username,
    EncryptedData? encryptedPassword,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastUsed,
    PasswordStrength? strength,
  }) =>
      Credential(
        id: id ?? this.id,
        hostname: hostname ?? this.hostname,
        url: url ?? this.url,
        username: username ?? this.username,
        encryptedPassword: encryptedPassword ?? this.encryptedPassword,
        notes: notes ?? this.notes,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        lastUsed: lastUsed ?? this.lastUsed,
        strength: strength ?? this.strength,
      );

  @override
  List<Object?> get props => [
        id,
        hostname,
        url,
        username,
        encryptedPassword,
        notes,
        createdAt,
        updatedAt,
        lastUsed,
        strength,
      ];
}

/// Represents encrypted data with IV and auth tag
class EncryptedData extends Equatable {
  /// Creates encrypted data
  const EncryptedData({
    required this.encrypted,
    required this.iv,
    required this.authTag,
  });

  /// Creates from JSON map
  factory EncryptedData.fromJson(Map<String, dynamic> json) => EncryptedData(
        encrypted: json['encrypted'] as String,
        iv: json['iv'] as String,
        authTag: json['authTag'] as String,
      );

  /// The encrypted data (base64)
  final String encrypted;

  /// Initialization vector (base64)
  final String iv;

  /// Authentication tag (base64)
  final String authTag;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'encrypted': encrypted,
        'iv': iv,
        'authTag': authTag,
      };

  @override
  List<Object?> get props => [encrypted, iv, authTag];
}

/// Password strength assessment result
class PasswordStrength extends Equatable {
  /// Creates a password strength assessment
  const PasswordStrength({
    required this.score,
    required this.level,
    required this.suggestions,
  });

  /// Creates from JSON map
  factory PasswordStrength.fromJson(Map<String, dynamic> json) =>
      PasswordStrength(
        score: json['score'] as int,
        level: PasswordStrengthLevel.values.firstWhere(
          (e) => e.name == json['level'],
          orElse: () => PasswordStrengthLevel.weak,
        ),
        suggestions: (json['suggestions'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
      );

  /// Creates a weak strength result
  factory PasswordStrength.weak() => const PasswordStrength(
        score: 0,
        level: PasswordStrengthLevel.weak,
        suggestions: [],
      );

  /// Strength score (0-7)
  final int score;

  /// Overall strength level
  final PasswordStrengthLevel level;

  /// Suggestions for improvement
  final List<String> suggestions;

  /// Converts to JSON map
  Map<String, dynamic> toJson() => {
        'score': score,
        'level': level.name,
        'suggestions': suggestions,
      };

  @override
  List<Object?> get props => [score, level, suggestions];
}

/// Password strength levels
enum PasswordStrengthLevel {
  /// Weak password
  weak,

  /// Moderate password
  moderate,

  /// Strong password
  strong,
}

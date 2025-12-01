/// Profile model for Horizon Browser
///
/// Represents a user profile with isolated browsing sessions.
library;

import 'package:equatable/equatable.dart';

/// Represents a user profile with isolated browsing data
class Profile extends Equatable {
  /// Creates a new profile
  const Profile({
    required this.id,
    required this.name,
    this.avatar = 'default',
    this.color = '#4285f4',
    required this.createdAt,
    this.lastUsed,
    this.isIncognito = false,
  });

  /// Creates a profile from JSON map
  factory Profile.fromJson(Map<String, dynamic> json) => Profile(
        id: json['id'] as String,
        name: json['name'] as String,
        avatar: json['avatar'] as String? ?? 'default',
        color: json['color'] as String? ?? '#4285f4',
        createdAt: DateTime.parse(json['createdAt'] as String),
        lastUsed: json['lastUsed'] != null
            ? DateTime.parse(json['lastUsed'] as String)
            : null,
        isIncognito: json['isIncognito'] as bool? ?? false,
      );

  /// Creates a default profile
  factory Profile.defaultProfile() => Profile(
        id: 'default',
        name: 'Default',
        avatar: 'default',
        color: '#4285f4',
        createdAt: DateTime.now(),
      );

  /// Unique profile identifier
  final String id;

  /// Display name for the profile
  final String name;

  /// Avatar identifier
  final String avatar;

  /// Theme color (hex)
  final String color;

  /// When the profile was created
  final DateTime createdAt;

  /// When the profile was last used
  final DateTime? lastUsed;

  /// Whether this is an incognito session
  final bool isIncognito;

  /// Converts the profile to a JSON map
  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'avatar': avatar,
        'color': color,
        'createdAt': createdAt.toIso8601String(),
        'lastUsed': lastUsed?.toIso8601String(),
        'isIncognito': isIncognito,
      };

  /// Creates a copy of this profile with the given fields replaced
  Profile copyWith({
    String? id,
    String? name,
    String? avatar,
    String? color,
    DateTime? createdAt,
    DateTime? lastUsed,
    bool? isIncognito,
  }) =>
      Profile(
        id: id ?? this.id,
        name: name ?? this.name,
        avatar: avatar ?? this.avatar,
        color: color ?? this.color,
        createdAt: createdAt ?? this.createdAt,
        lastUsed: lastUsed ?? this.lastUsed,
        isIncognito: isIncognito ?? this.isIncognito,
      );

  @override
  List<Object?> get props => [
        id,
        name,
        avatar,
        color,
        createdAt,
        lastUsed,
        isIncognito,
      ];
}

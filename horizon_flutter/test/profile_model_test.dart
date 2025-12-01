import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/core/models/profile.dart';

void main() {
  group('Profile', () {
    test('creates profile with required fields', () {
      final profile = Profile(
        id: 'test-id',
        name: 'Test Profile',
        createdAt: DateTime(2024, 1, 1),
      );

      expect(profile.id, 'test-id');
      expect(profile.name, 'Test Profile');
      expect(profile.avatar, 'default');
      expect(profile.color, '#4285f4');
      expect(profile.isIncognito, false);
    });

    test('creates default profile', () {
      final profile = Profile.defaultProfile();

      expect(profile.id, 'default');
      expect(profile.name, 'Default');
      expect(profile.isIncognito, false);
    });

    test('serializes to JSON', () {
      final profile = Profile(
        id: 'test-id',
        name: 'Test Profile',
        avatar: 'custom',
        color: '#ff0000',
        createdAt: DateTime(2024, 1, 1),
        lastUsed: DateTime(2024, 1, 2),
        isIncognito: false,
      );

      final json = profile.toJson();

      expect(json['id'], 'test-id');
      expect(json['name'], 'Test Profile');
      expect(json['avatar'], 'custom');
      expect(json['color'], '#ff0000');
      expect(json['isIncognito'], false);
    });

    test('deserializes from JSON', () {
      final json = {
        'id': 'test-id',
        'name': 'Test Profile',
        'avatar': 'custom',
        'color': '#ff0000',
        'createdAt': '2024-01-01T00:00:00.000',
        'lastUsed': '2024-01-02T00:00:00.000',
        'isIncognito': true,
      };

      final profile = Profile.fromJson(json);

      expect(profile.id, 'test-id');
      expect(profile.name, 'Test Profile');
      expect(profile.avatar, 'custom');
      expect(profile.color, '#ff0000');
      expect(profile.isIncognito, true);
    });

    test('copyWith creates modified copy', () {
      final original = Profile(
        id: 'test-id',
        name: 'Original',
        createdAt: DateTime(2024, 1, 1),
      );

      final modified = original.copyWith(
        name: 'Modified',
        color: '#00ff00',
      );

      expect(modified.id, 'test-id');
      expect(modified.name, 'Modified');
      expect(modified.color, '#00ff00');
      expect(original.name, 'Original');
    });

    test('equals checks all properties', () {
      final profile1 = Profile(
        id: 'test-id',
        name: 'Test',
        createdAt: DateTime(2024, 1, 1),
      );

      final profile2 = Profile(
        id: 'test-id',
        name: 'Test',
        createdAt: DateTime(2024, 1, 1),
      );

      final profile3 = Profile(
        id: 'different-id',
        name: 'Test',
        createdAt: DateTime(2024, 1, 1),
      );

      expect(profile1, profile2);
      expect(profile1, isNot(profile3));
    });
  });
}

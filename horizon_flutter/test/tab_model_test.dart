import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/core/models/tab.dart';

void main() {
  group('BrowserTab', () {
    test('creates tab with required fields', () {
      final tab = BrowserTab(
        id: 'test-id',
        url: 'https://example.com',
        profileId: 'default',
        sessionId: 'default',
        createdAt: DateTime(2024, 1, 1),
      );

      expect(tab.id, 'test-id');
      expect(tab.url, 'https://example.com');
      expect(tab.title, 'New Tab');
      expect(tab.isActive, false);
      expect(tab.isLoading, false);
      expect(tab.isIncognito, false);
    });

    test('creates tab with factory method', () {
      final tab = BrowserTab.create(
        id: 'test-id',
        url: 'https://example.com',
        isIncognito: true,
      );

      expect(tab.id, 'test-id');
      expect(tab.url, 'https://example.com');
      expect(tab.isIncognito, true);
    });

    test('serializes to JSON', () {
      final tab = BrowserTab(
        id: 'test-id',
        url: 'https://example.com',
        title: 'Example',
        isActive: true,
        isLoading: false,
        canGoBack: true,
        canGoForward: false,
        profileId: 'default',
        sessionId: 'default',
        isIncognito: false,
        createdAt: DateTime(2024, 1, 1),
      );

      final json = tab.toJson();

      expect(json['id'], 'test-id');
      expect(json['url'], 'https://example.com');
      expect(json['title'], 'Example');
      expect(json['isActive'], true);
      expect(json['canGoBack'], true);
      expect(json['isIncognito'], false);
    });

    test('deserializes from JSON', () {
      final json = {
        'id': 'test-id',
        'url': 'https://example.com',
        'title': 'Example',
        'isActive': true,
        'isLoading': true,
        'canGoBack': true,
        'canGoForward': false,
        'isIncognito': true,
        'profileId': 'incognito',
        'sessionId': 'incognito-session',
        'createdAt': '2024-01-01T00:00:00.000',
      };

      final tab = BrowserTab.fromJson(json);

      expect(tab.id, 'test-id');
      expect(tab.url, 'https://example.com');
      expect(tab.title, 'Example');
      expect(tab.isActive, true);
      expect(tab.isLoading, true);
      expect(tab.isIncognito, true);
    });

    test('copyWith creates modified copy', () {
      final original = BrowserTab(
        id: 'test-id',
        url: 'https://example.com',
        profileId: 'default',
        sessionId: 'default',
        createdAt: DateTime(2024, 1, 1),
      );

      final modified = original.copyWith(
        url: 'https://modified.com',
        isActive: true,
        isLoading: true,
      );

      expect(modified.url, 'https://modified.com');
      expect(modified.isActive, true);
      expect(modified.isLoading, true);
      expect(original.url, 'https://example.com');
      expect(original.isActive, false);
    });

    test('equals checks all properties', () {
      final tab1 = BrowserTab(
        id: 'test-id',
        url: 'https://example.com',
        profileId: 'default',
        sessionId: 'default',
        createdAt: DateTime(2024, 1, 1),
      );

      final tab2 = BrowserTab(
        id: 'test-id',
        url: 'https://example.com',
        profileId: 'default',
        sessionId: 'default',
        createdAt: DateTime(2024, 1, 1),
      );

      final tab3 = BrowserTab(
        id: 'different-id',
        url: 'https://example.com',
        profileId: 'default',
        sessionId: 'default',
        createdAt: DateTime(2024, 1, 1),
      );

      expect(tab1, tab2);
      expect(tab1, isNot(tab3));
    });
  });

  group('TabError', () {
    test('creates error with required fields', () {
      const error = TabError(code: 404, description: 'Not Found');

      expect(error.code, 404);
      expect(error.description, 'Not Found');
    });

    test('serializes to JSON', () {
      const error = TabError(code: 500, description: 'Server Error');
      final json = error.toJson();

      expect(json['code'], 500);
      expect(json['description'], 'Server Error');
    });

    test('deserializes from JSON', () {
      final json = {'code': 403, 'description': 'Forbidden'};
      final error = TabError.fromJson(json);

      expect(error.code, 403);
      expect(error.description, 'Forbidden');
    });
  });
}

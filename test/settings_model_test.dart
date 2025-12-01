import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/core/models/settings.dart';
import 'package:horizon_flutter/core/constants/app_constants.dart';

void main() {
  group('AppSettings', () {
    test('creates default settings', () {
      final settings = AppSettings.defaults();

      expect(settings.general.homepage, AppConstants.defaultHomepage);
      expect(settings.general.searchEngine, SearchEngine.duckduckgo);
      expect(settings.appearance.theme, ThemeMode.system);
      expect(settings.privacy.doNotTrack, true);
      expect(settings.security.safeBrowsing, true);
      expect(settings.performance.hardwareAcceleration, true);
    });

    test('serializes to JSON', () {
      final settings = AppSettings.defaults();
      final json = settings.toJson();

      expect(json['general'], isNotNull);
      expect(json['appearance'], isNotNull);
      expect(json['privacy'], isNotNull);
      expect(json['security'], isNotNull);
      expect(json['performance'], isNotNull);
      expect(json['sync'], isNotNull);
    });

    test('deserializes from JSON', () {
      final json = {
        'general': {
          'homepage': 'https://example.com',
          'searchEngine': 'google',
          'startupBehavior': 'homepage',
          'language': 'en-US',
        },
        'appearance': {
          'theme': 'dark',
          'fontSize': 'large',
          'showBookmarksBar': false,
        },
        'privacy': {
          'doNotTrack': false,
          'httpsOnly': true,
        },
        'security': {
          'safeBrowsing': false,
        },
        'performance': {
          'hardwareAcceleration': false,
        },
        'sync': {
          'enabled': true,
        },
      };

      final settings = AppSettings.fromJson(json);

      expect(settings.general.homepage, 'https://example.com');
      expect(settings.general.searchEngine, SearchEngine.google);
      expect(settings.appearance.theme, ThemeMode.dark);
      expect(settings.privacy.doNotTrack, false);
      expect(settings.privacy.httpsOnly, true);
    });

    test('copyWith creates modified copy', () {
      final original = AppSettings.defaults();
      final modified = original.copyWith(
        appearance: original.appearance.copyWith(theme: ThemeMode.dark),
      );

      expect(modified.appearance.theme, ThemeMode.dark);
      expect(original.appearance.theme, ThemeMode.system);
    });
  });

  group('GeneralSettings', () {
    test('has correct defaults', () {
      const settings = GeneralSettings();

      expect(settings.homepage, AppConstants.defaultHomepage);
      expect(settings.searchEngine, SearchEngine.duckduckgo);
      expect(settings.startupBehavior, StartupBehavior.lastSession);
      expect(settings.language, 'en-US');
    });
  });

  group('PrivacySettings', () {
    test('has correct defaults', () {
      const settings = PrivacySettings();

      expect(settings.doNotTrack, true);
      expect(settings.blockThirdPartyCookies, true);
      expect(settings.clearDataOnExit, false);
      expect(settings.fingerprintProtection, true);
      expect(settings.blockTrackers, true);
      expect(settings.httpsOnly, false);
    });
  });

  group('SecuritySettings', () {
    test('has correct defaults', () {
      const settings = SecuritySettings();

      expect(settings.safeBrowsing, true);
      expect(settings.blockMixedContent, true);
      expect(settings.warnOnUnsecurePasswords, true);
      expect(settings.blockDangerousDownloads, true);
    });
  });

  group('PerformanceSettings', () {
    test('has correct defaults', () {
      const settings = PerformanceSettings();

      expect(settings.hardwareAcceleration, true);
      expect(settings.lazyLoadTabs, true);
      expect(settings.suspendInactiveTabs, true);
      expect(settings.inactiveTabTimeout, 30);
      expect(settings.preloadTopSites, true);
    });
  });
}

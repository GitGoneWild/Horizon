import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/core/services/url_service.dart';

void main() {
  group('UrlService', () {
    const urlService = UrlService();

    group('isUrlSafe', () {
      test('returns false for empty URL', () {
        expect(urlService.isUrlSafe(''), false);
      });

      test('returns true for HTTPS URLs', () {
        expect(urlService.isUrlSafe('https://example.com'), true);
        expect(urlService.isUrlSafe('https://google.com'), true);
        expect(urlService.isUrlSafe('https://github.com/path'), true);
      });

      test('returns true for HTTP URLs', () {
        expect(urlService.isUrlSafe('http://example.com'), true);
      });

      test('returns true for horizon:// URLs', () {
        expect(urlService.isUrlSafe('horizon://newtab'), true);
        expect(urlService.isUrlSafe('horizon://settings'), true);
      });

      test('returns true for devtools:// URLs', () {
        expect(urlService.isUrlSafe('devtools://'), true);
      });

      test('returns true for data:image URLs', () {
        expect(urlService.isUrlSafe('data:image/png;base64,abc'), true);
      });

      test('returns false for data: non-image URLs', () {
        expect(urlService.isUrlSafe('data:text/html,<script>'), false);
      });

      test('returns false for file:// URLs', () {
        expect(urlService.isUrlSafe('file:///etc/passwd'), false);
      });

      test('returns false for blocked TLDs', () {
        expect(urlService.isUrlSafe('http://example.onion'), false);
      });

      test('returns false for suspicious phishing patterns', () {
        expect(urlService.isUrlSafe('https://paypa1.com'), false);
        expect(urlService.isUrlSafe('https://g00gle.fake'), false);
        expect(urlService.isUrlSafe('https://amaz0n.fake'), false);
        expect(urlService.isUrlSafe('https://faceb00k.fake'), false);
      });

      test('returns true for legitimate domains', () {
        expect(urlService.isUrlSafe('https://paypal.com'), true);
        expect(urlService.isUrlSafe('https://google.com'), true);
        expect(urlService.isUrlSafe('https://amazon.com'), true);
        expect(urlService.isUrlSafe('https://facebook.com'), true);
      });
    });

    group('sanitizeUrl', () {
      test('returns invalid for empty URL', () {
        final result = urlService.sanitizeUrl('');
        expect(result.isValid, false);
      });

      test('blocks javascript: URLs', () {
        final result = urlService.sanitizeUrl("javascript:alert('xss')");
        expect(result.isValid, false);
        expect(result.reason, contains('javascript'));
      });

      test('blocks vbscript: URLs', () {
        final result = urlService.sanitizeUrl('vbscript:msgbox');
        expect(result.isValid, false);
        expect(result.reason, contains('vbscript'));
      });

      test('allows valid HTTPS URLs', () {
        final result = urlService.sanitizeUrl('https://example.com');
        expect(result.isValid, true);
        expect(result.sanitizedUrl, 'https://example.com');
      });

      test('adds https:// to domain-like input', () {
        final result = urlService.sanitizeUrl('example.com');
        expect(result.isValid, true);
        expect(result.sanitizedUrl, 'https://example.com');
      });

      test('converts search queries to search URL', () {
        final result = urlService.sanitizeUrl('flutter tutorial');
        expect(result.isValid, true);
        expect(result.sanitizedUrl, contains('duckduckgo.com'));
        expect(result.sanitizedUrl, contains('flutter%20tutorial'));
      });

      test('uses custom search URL', () {
        final result = urlService.sanitizeUrl(
          'flutter tutorial',
          searchUrl: 'https://google.com/search?q=',
        );
        expect(result.isValid, true);
        expect(result.sanitizedUrl, contains('google.com'));
      });

      test('blocks unsafe URLs', () {
        final result = urlService.sanitizeUrl('https://paypa1.fake');
        expect(result.isValid, false);
      });
    });

    group('getSecurityState', () {
      test('returns secure for HTTPS', () {
        expect(
          urlService.getSecurityState('https://example.com'),
          UrlSecurityState.secure,
        );
      });

      test('returns insecure for HTTP', () {
        expect(
          urlService.getSecurityState('http://example.com'),
          UrlSecurityState.insecure,
        );
      });

      test('returns internal for horizon://', () {
        expect(
          urlService.getSecurityState('horizon://newtab'),
          UrlSecurityState.internal,
        );
      });

      test('returns dangerous for empty URL', () {
        expect(
          urlService.getSecurityState(''),
          UrlSecurityState.dangerous,
        );
      });
    });

    group('getHostname', () {
      test('extracts hostname from URL', () {
        expect(urlService.getHostname('https://example.com/path'), 'example.com');
        expect(urlService.getHostname('https://sub.example.com'), 'sub.example.com');
      });

      test('returns null for invalid URL', () {
        expect(urlService.getHostname('not a url'), null);
      });
    });

    group('isSearchQuery', () {
      test('returns true for text with spaces', () {
        expect(urlService.isSearchQuery('hello world'), true);
      });

      test('returns true for text without dots', () {
        expect(urlService.isSearchQuery('hello'), true);
      });

      test('returns false for URLs with protocol', () {
        expect(urlService.isSearchQuery('https://example.com'), false);
        expect(urlService.isSearchQuery('horizon://newtab'), false);
      });
    });
  });
}

/// URL service for Horizon Browser
///
/// Provides URL validation, sanitization, and security checks.
library;

/// Common phishing domain patterns
final List<RegExp> _suspiciousPatterns = [
  RegExp(r'paypa[l1][^a-z]*\.[^p]', caseSensitive: false),
  RegExp(r'g[o0][o0]g[l1]e[^a-z]*\.[^c]', caseSensitive: false),
  RegExp(r'amaz[o0]n[^a-z]*\.[^c]', caseSensitive: false),
  RegExp(r'faceb[o0][o0]k[^a-z]*\.[^c]', caseSensitive: false),
  RegExp(r'micr[o0]s[o0]ft[^a-z]*\.[^c]', caseSensitive: false),
];

/// Blocked TLDs for security
const Set<String> _blockedTLDs = {'.onion'};

/// Dangerous URL schemes
const Set<String> _dangerousSchemes = {'javascript:', 'vbscript:'};

/// Result of URL sanitization
class SanitizedUrl {
  /// Creates a sanitized URL result
  const SanitizedUrl({
    required this.isValid,
    this.sanitizedUrl,
    this.reason,
  });

  /// Whether the URL is valid
  final bool isValid;

  /// The sanitized URL
  final String? sanitizedUrl;

  /// Reason if invalid
  final String? reason;
}

/// Security state for a URL
enum UrlSecurityState {
  /// Secure (HTTPS)
  secure,

  /// Insecure (HTTP)
  insecure,

  /// Internal URL (horizon://)
  internal,

  /// Dangerous (blocked scheme)
  dangerous,
}

/// Service for URL handling and security
class UrlService {
  /// Creates a URL service
  const UrlService();

  /// Default search engine URL
  static const String defaultSearchUrl = 'https://duckduckgo.com/?q=';

  /// Validates if a URL is safe to navigate to
  bool isUrlSafe(String url) {
    if (url.isEmpty) return false;

    try {
      final uri = Uri.parse(url);

      // Allow internal URLs
      if (uri.scheme == 'horizon') return true;

      // Allow devtools
      if (uri.scheme == 'devtools') return true;

      // Allow data URLs only for images
      if (uri.scheme == 'data') {
        return url.startsWith('data:image/');
      }

      // Block non-HTTP(S) protocols
      if (uri.scheme != 'http' && uri.scheme != 'https') {
        return false;
      }

      // Check for blocked TLDs
      for (final tld in _blockedTLDs) {
        if (uri.host.endsWith(tld)) return false;
      }

      // Check for suspicious patterns (phishing)
      for (final pattern in _suspiciousPatterns) {
        if (pattern.hasMatch(uri.host)) return false;
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  /// Sanitizes and validates a URL for navigation
  SanitizedUrl sanitizeUrl(String url, {String? searchUrl}) {
    if (url.isEmpty) {
      return const SanitizedUrl(
        isValid: false,
        reason: 'Empty URL',
      );
    }

    final trimmedUrl = url.trim();
    final lowerUrl = trimmedUrl.toLowerCase();

    // Check for dangerous schemes
    for (final scheme in _dangerousSchemes) {
      if (lowerUrl.startsWith(scheme)) {
        return SanitizedUrl(
          isValid: false,
          reason: '${scheme.replaceAll(':', '')} URLs are blocked for security',
        );
      }
    }

    // Allow data URLs only for images
    if (lowerUrl.startsWith('data:') && !lowerUrl.startsWith('data:image/')) {
      return const SanitizedUrl(
        isValid: false,
        reason: 'Non-image data URLs are blocked',
      );
    }

    // Try to parse as URL
    try {
      final uri = Uri.parse(trimmedUrl);

      if (uri.hasScheme) {
        if (!isUrlSafe(trimmedUrl)) {
          return const SanitizedUrl(
            isValid: false,
            reason: 'URL blocked for security reasons',
          );
        }
        return SanitizedUrl(
          isValid: true,
          sanitizedUrl: uri.toString(),
        );
      }
    } catch (_) {
      // Not a valid URL
    }

    // Check if it looks like a domain
    if (trimmedUrl.contains('.') && !trimmedUrl.contains(' ')) {
      final withProtocol = 'https://$trimmedUrl';
      try {
        final uri = Uri.parse(withProtocol);
        if (isUrlSafe(withProtocol)) {
          return SanitizedUrl(
            isValid: true,
            sanitizedUrl: uri.toString(),
          );
        }
      } catch (_) {
        // Still not valid
      }
    }

    // Treat as search query
    final effectiveSearchUrl = searchUrl ?? defaultSearchUrl;
    final encodedQuery = Uri.encodeComponent(trimmedUrl);
    return SanitizedUrl(
      isValid: true,
      sanitizedUrl: '$effectiveSearchUrl$encodedQuery',
      reason: 'Converted to search query',
    );
  }

  /// Gets the security state for a URL
  UrlSecurityState getSecurityState(String url) {
    if (url.isEmpty) return UrlSecurityState.dangerous;

    try {
      final uri = Uri.parse(url);

      if (uri.scheme == 'horizon') {
        return UrlSecurityState.internal;
      }

      if (uri.scheme == 'https') {
        return UrlSecurityState.secure;
      }

      if (uri.scheme == 'http') {
        return UrlSecurityState.insecure;
      }

      return UrlSecurityState.dangerous;
    } catch (_) {
      return UrlSecurityState.dangerous;
    }
  }

  /// Extracts the hostname from a URL
  String? getHostname(String url) {
    try {
      final uri = Uri.parse(url);
      return uri.host.isEmpty ? null : uri.host;
    } catch (_) {
      return null;
    }
  }

  /// Checks if the URL is a search query
  bool isSearchQuery(String input) {
    final trimmed = input.trim();

    // If it contains spaces, it's likely a search query
    if (trimmed.contains(' ')) return true;

    // If it doesn't contain a dot, it's likely a search query
    if (!trimmed.contains('.')) return true;

    // If it starts with a protocol, it's a URL
    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('horizon://')) {
      return false;
    }

    return false;
  }
}

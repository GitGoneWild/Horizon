/// Horizon Browser - Core Constants
///
/// Contains application-wide constants and configuration values.
library;

/// Application configuration constants
abstract final class AppConstants {
  /// Minimum window width in pixels
  static const int minWindowWidth = 800;

  /// Minimum window height in pixels
  static const int minWindowHeight = 600;

  /// Default window width in pixels
  static const int defaultWindowWidth = 1280;

  /// Default window height in pixels
  static const int defaultWindowHeight = 800;

  /// Default homepage URL
  static const String defaultHomepage = 'horizon://newtab';

  /// Application protocol
  static const String protocol = 'horizon';

  /// Default search engine
  static const String defaultSearchEngine = 'duckduckgo';

  /// Application name
  static const String appName = 'Horizon';

  /// Application version
  static const String appVersion = '0.1.0';
}

/// Toolbar and UI dimensions
abstract final class UIDimensions {
  /// Title bar height in pixels
  static const double titleBarHeight = 32;

  /// Tab bar height in pixels
  static const double tabBarHeight = 40;

  /// Navigation bar height in pixels
  static const double navBarHeight = 48;

  /// Total toolbar height
  static const double toolbarHeight =
      titleBarHeight + tabBarHeight + navBarHeight;

  /// Minimum tab width
  static const double tabMinWidth = 100;

  /// Maximum tab width
  static const double tabMaxWidth = 240;

  /// Tab height
  static const double tabHeight = 36;
}

/// Search engine definitions
enum SearchEngine {
  duckduckgo(
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: 'duckduckgo.png',
  ),
  google(
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'google.png',
  ),
  bing(
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'bing.png',
  ),
  startpage(
    name: 'Startpage',
    url: 'https://www.startpage.com/search?q=',
    icon: 'startpage.png',
  ),
  ecosia(
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    icon: 'ecosia.png',
  );

  const SearchEngine({
    required this.name,
    required this.url,
    required this.icon,
  });

  final String name;
  final String url;
  final String icon;
}

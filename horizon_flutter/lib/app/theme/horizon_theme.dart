/// Horizon Browser Theme
///
/// Cosmic-themed design system with light and dark modes.
library;

import 'package:flutter/material.dart';

/// Horizon color palette
abstract final class HorizonColors {
  // Light theme colors
  static const Color lightBgPrimary = Color(0xFFFFFFFF);
  static const Color lightBgSecondary = Color(0xFFF5F5F5);
  static const Color lightBgTertiary = Color(0xFFE8E8E8);
  static const Color lightBgHover = Color(0xFFE0E0E0);
  static const Color lightBgActive = Color(0xFFD0D0D0);

  static const Color lightTextPrimary = Color(0xFF202124);
  static const Color lightTextSecondary = Color(0xFF5F6368);
  static const Color lightTextTertiary = Color(0xFF80868B);

  static const Color lightBorder = Color(0xFFDADCE0);
  static const Color lightBorderFocus = Color(0xFF6366F1);

  // Dark theme colors
  static const Color darkBgPrimary = Color(0xFF0F0F23);
  static const Color darkBgSecondary = Color(0xFF1A1A2E);
  static const Color darkBgTertiary = Color(0xFF252542);
  static const Color darkBgHover = Color(0xFF2D2D4A);
  static const Color darkBgActive = Color(0xFF3A3A5A);

  static const Color darkTextPrimary = Color(0xFFE8EAED);
  static const Color darkTextSecondary = Color(0xFF9AA0A6);
  static const Color darkTextTertiary = Color(0xFF80868B);

  static const Color darkBorder = Color(0xFF3C4043);
  static const Color darkBorderFocus = Color(0xFF8B5CF6);

  // Cosmic accent colors
  static const Color accentPrimary = Color(0xFF6366F1);
  static const Color accentSecondary = Color(0xFF4F46E5);
  static const Color accentTertiary = Color(0xFF8B5CF6);

  static const Color accentSuccess = Color(0xFF10B981);
  static const Color accentWarning = Color(0xFFF59E0B);
  static const Color accentDanger = Color(0xFFEF4444);

  // Cosmic gradient colors
  static const Color cosmicStart = Color(0xFF6366F1);
  static const Color cosmicMid = Color(0xFF8B5CF6);
  static const Color cosmicEnd = Color(0xFFA855F7);

  // Incognito colors
  static const Color incognitoBg = Color(0xFF363B3E);
  static const Color incognitoBgActive = Color(0xFF2D3134);
}

/// Horizon theme data
abstract final class HorizonTheme {
  /// Light theme
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.light(
          primary: HorizonColors.accentPrimary,
          secondary: HorizonColors.accentSecondary,
          tertiary: HorizonColors.accentTertiary,
          surface: HorizonColors.lightBgPrimary,
          error: HorizonColors.accentDanger,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: HorizonColors.lightTextPrimary,
          onError: Colors.white,
          outline: HorizonColors.lightBorder,
        ),
        scaffoldBackgroundColor: HorizonColors.lightBgPrimary,
        appBarTheme: const AppBarTheme(
          backgroundColor: HorizonColors.lightBgSecondary,
          foregroundColor: HorizonColors.lightTextPrimary,
          elevation: 0,
        ),
        cardTheme: CardTheme(
          color: HorizonColors.lightBgSecondary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: HorizonColors.lightBorder),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: HorizonColors.lightBgSecondary,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: const BorderSide(
              color: HorizonColors.lightBorderFocus,
              width: 2,
            ),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: HorizonColors.accentPrimary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        iconButtonTheme: IconButtonThemeData(
          style: IconButton.styleFrom(
            foregroundColor: HorizonColors.lightTextSecondary,
          ),
        ),
        dividerTheme: const DividerThemeData(
          color: HorizonColors.lightBorder,
          thickness: 1,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 16,
          ),
          bodyMedium: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 14,
          ),
          bodySmall: TextStyle(
            color: HorizonColors.lightTextSecondary,
            fontSize: 12,
          ),
          labelLarge: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          labelMedium: TextStyle(
            color: HorizonColors.lightTextSecondary,
            fontSize: 12,
          ),
          labelSmall: TextStyle(
            color: HorizonColors.lightTextTertiary,
            fontSize: 11,
          ),
          headlineLarge: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          headlineMedium: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          headlineSmall: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          titleLarge: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
          titleMedium: TextStyle(
            color: HorizonColors.lightTextPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          titleSmall: TextStyle(
            color: HorizonColors.lightTextSecondary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      );

  /// Dark theme
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: HorizonColors.accentTertiary,
          secondary: HorizonColors.accentSecondary,
          tertiary: HorizonColors.accentPrimary,
          surface: HorizonColors.darkBgPrimary,
          error: HorizonColors.accentDanger,
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: HorizonColors.darkTextPrimary,
          onError: Colors.white,
          outline: HorizonColors.darkBorder,
        ),
        scaffoldBackgroundColor: HorizonColors.darkBgPrimary,
        appBarTheme: const AppBarTheme(
          backgroundColor: HorizonColors.darkBgSecondary,
          foregroundColor: HorizonColors.darkTextPrimary,
          elevation: 0,
        ),
        cardTheme: CardTheme(
          color: HorizonColors.darkBgSecondary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: HorizonColors.darkBorder),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: HorizonColors.darkBgSecondary,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(24),
            borderSide: const BorderSide(
              color: HorizonColors.darkBorderFocus,
              width: 2,
            ),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: HorizonColors.accentTertiary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        iconButtonTheme: IconButtonThemeData(
          style: IconButton.styleFrom(
            foregroundColor: HorizonColors.darkTextSecondary,
          ),
        ),
        dividerTheme: const DividerThemeData(
          color: HorizonColors.darkBorder,
          thickness: 1,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 16,
          ),
          bodyMedium: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 14,
          ),
          bodySmall: TextStyle(
            color: HorizonColors.darkTextSecondary,
            fontSize: 12,
          ),
          labelLarge: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          labelMedium: TextStyle(
            color: HorizonColors.darkTextSecondary,
            fontSize: 12,
          ),
          labelSmall: TextStyle(
            color: HorizonColors.darkTextTertiary,
            fontSize: 11,
          ),
          headlineLarge: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
          headlineMedium: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          headlineSmall: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
          titleLarge: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
          titleMedium: TextStyle(
            color: HorizonColors.darkTextPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          titleSmall: TextStyle(
            color: HorizonColors.darkTextSecondary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      );

  /// Cosmic gradient
  static const LinearGradient cosmicGradient = LinearGradient(
    colors: [
      HorizonColors.cosmicStart,
      HorizonColors.cosmicMid,
      HorizonColors.cosmicEnd,
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

/// Extension to access custom colors from BuildContext
extension HorizonColorsExtension on BuildContext {
  /// Gets the background colors for the current theme
  HorizonBgColors get bgColors {
    final brightness = Theme.of(this).brightness;
    return brightness == Brightness.dark
        ? const HorizonBgColors.dark()
        : const HorizonBgColors.light();
  }

  /// Gets the text colors for the current theme
  HorizonTextColors get textColors {
    final brightness = Theme.of(this).brightness;
    return brightness == Brightness.dark
        ? const HorizonTextColors.dark()
        : const HorizonTextColors.light();
  }
}

/// Background colors helper
class HorizonBgColors {
  /// Creates light background colors
  const HorizonBgColors.light()
      : primary = HorizonColors.lightBgPrimary,
        secondary = HorizonColors.lightBgSecondary,
        tertiary = HorizonColors.lightBgTertiary,
        hover = HorizonColors.lightBgHover,
        active = HorizonColors.lightBgActive;

  /// Creates dark background colors
  const HorizonBgColors.dark()
      : primary = HorizonColors.darkBgPrimary,
        secondary = HorizonColors.darkBgSecondary,
        tertiary = HorizonColors.darkBgTertiary,
        hover = HorizonColors.darkBgHover,
        active = HorizonColors.darkBgActive;

  /// Primary background
  final Color primary;

  /// Secondary background
  final Color secondary;

  /// Tertiary background
  final Color tertiary;

  /// Hover background
  final Color hover;

  /// Active background
  final Color active;
}

/// Text colors helper
class HorizonTextColors {
  /// Creates light text colors
  const HorizonTextColors.light()
      : primary = HorizonColors.lightTextPrimary,
        secondary = HorizonColors.lightTextSecondary,
        tertiary = HorizonColors.lightTextTertiary;

  /// Creates dark text colors
  const HorizonTextColors.dark()
      : primary = HorizonColors.darkTextPrimary,
        secondary = HorizonColors.darkTextSecondary,
        tertiary = HorizonColors.darkTextTertiary;

  /// Primary text
  final Color primary;

  /// Secondary text
  final Color secondary;

  /// Tertiary text
  final Color tertiary;
}

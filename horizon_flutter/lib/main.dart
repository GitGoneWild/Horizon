/// Horizon Browser - Flutter Edition
///
/// A futuristic, secure, and privacy-focused web browser built with Flutter.
///
/// This is the main entry point for the application.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/app/providers/settings_providers.dart';
import 'package:horizon_flutter/app/theme/horizon_theme.dart';
import 'package:horizon_flutter/core/models/settings.dart'
    as horizon_settings;
import 'package:horizon_flutter/features/tabs/browser_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    const ProviderScope(
      child: HorizonApp(),
    ),
  );
}

/// The main Horizon Browser application widget
class HorizonApp extends ConsumerWidget {
  /// Creates the Horizon app
  const HorizonApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp(
      title: 'Horizon Browser',
      debugShowCheckedModeBanner: false,
      theme: HorizonTheme.light,
      darkTheme: HorizonTheme.dark,
      themeMode: _convertThemeMode(themeMode),
      home: const BrowserShell(),
    );
  }

  ThemeMode _convertThemeMode(
    horizon_settings.ThemeMode mode,
  ) {
    switch (mode) {
      case horizon_settings.ThemeMode.light:
        return ThemeMode.light;
      case horizon_settings.ThemeMode.dark:
        return ThemeMode.dark;
      case horizon_settings.ThemeMode.system:
        return ThemeMode.system;
    }
  }
}

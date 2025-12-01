/// Browser shell widget for Horizon Browser
///
/// Main browser UI containing tab bar, navigation bar, and webview.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/app/providers/tab_providers.dart';
import 'package:horizon_flutter/app/theme/horizon_theme.dart';
import 'package:horizon_flutter/core/constants/app_constants.dart';
import 'package:horizon_flutter/features/new_tab/new_tab_page.dart';
import 'package:horizon_flutter/widgets/navigation/navigation_bar.dart'
    as horizon;
import 'package:horizon_flutter/widgets/tabs/tab_bar.dart';

/// Main browser shell widget
class BrowserShell extends ConsumerStatefulWidget {
  /// Creates a browser shell
  const BrowserShell({super.key});

  @override
  ConsumerState<BrowserShell> createState() => _BrowserShellState();
}

class _BrowserShellState extends ConsumerState<BrowserShell> {
  @override
  void initState() {
    super.initState();
    // Create initial tab if none exist
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final tabs = ref.read(tabsProvider);
      if (tabs.isEmpty) {
        final newTab = ref.read(tabsProvider.notifier).createTab();
        ref.read(activeTabIdProvider.notifier).state = newTab.id;
      }
    });
  }

  void _handleNavigate(String url) {
    final activeTab = ref.read(activeTabProvider);
    if (activeTab != null) {
      ref.read(tabsProvider.notifier).updateTabUrl(activeTab.id, url);
      ref.read(tabsProvider.notifier).updateTabLoading(activeTab.id, true);
      // Simulate navigation complete after a delay
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          ref.read(tabsProvider.notifier).updateTabLoading(activeTab.id, false);
          ref.read(tabsProvider.notifier).updateTabNavigation(
                activeTab.id,
                canGoBack: true,
                canGoForward: false,
              );
          // Update title based on URL
          final uri = Uri.tryParse(url);
          if (uri != null) {
            ref
                .read(tabsProvider.notifier)
                .updateTabTitle(activeTab.id, uri.host.isEmpty ? 'New Tab' : uri.host);
          }
        }
      });
    }
  }

  void _handleSearch(String query) {
    final searchUrl = 'https://duckduckgo.com/?q=${Uri.encodeComponent(query)}';
    _handleNavigate(searchUrl);
  }

  @override
  Widget build(BuildContext context) {
    final activeTab = ref.watch(activeTabProvider);
    final isNewTabPage = activeTab?.url.startsWith('horizon://newtab') ?? true;
    final isIncognito = activeTab?.isIncognito ?? false;

    return KeyboardListener(
      focusNode: FocusNode(),
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          _handleKeyboardShortcuts(event);
        }
      },
      child: Container(
        color: isIncognito
            ? HorizonColors.darkBgPrimary
            : context.bgColors.primary,
        child: Column(
          children: [
            // Title bar (for window controls on desktop)
            _TitleBar(isIncognito: isIncognito),
            // Tab bar
            const BrowserTabBar(),
            // Navigation bar
            horizon.NavigationBar(
              onNavigate: _handleNavigate,
              onBack: () => _handleNavigation('back'),
              onForward: () => _handleNavigation('forward'),
              onRefresh: () => _handleNavigation('refresh'),
              onHome: () => _handleNavigate(AppConstants.defaultHomepage),
            ),
            // Content area
            Expanded(
              child: isNewTabPage
                  ? NewTabPage(onSearch: _handleSearch)
                  : _WebViewPlaceholder(url: activeTab?.url ?? ''),
            ),
          ],
        ),
      ),
    );
  }

  void _handleNavigation(String action) {
    final activeTab = ref.read(activeTabProvider);
    if (activeTab == null) return;

    switch (action) {
      case 'back':
        // TODO: Implement with real WebView
        break;
      case 'forward':
        // TODO: Implement with real WebView
        break;
      case 'refresh':
        ref.read(tabsProvider.notifier).updateTabLoading(activeTab.id, true);
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            ref.read(tabsProvider.notifier).updateTabLoading(activeTab.id, false);
          }
        });
    }
  }

  void _handleKeyboardShortcuts(KeyEvent event) {
    final isCtrlPressed = HardwareKeyboard.instance.isControlPressed;
    final isShiftPressed = HardwareKeyboard.instance.isShiftPressed;

    if (isCtrlPressed) {
      switch (event.logicalKey) {
        case LogicalKeyboardKey.keyT:
          final newTab = ref.read(tabsProvider.notifier).createTab();
          ref.read(activeTabIdProvider.notifier).state = newTab.id;
        case LogicalKeyboardKey.keyW:
          final activeTab = ref.read(activeTabProvider);
          if (activeTab != null) {
            final nextId =
                ref.read(tabsProvider.notifier).closeTab(activeTab.id);
            if (nextId != null) {
              ref.read(activeTabIdProvider.notifier).state = nextId;
            }
          }
        case LogicalKeyboardKey.keyL:
          // Focus URL bar - TODO
          break;
        case LogicalKeyboardKey.keyR:
          _handleNavigation('refresh');
        case LogicalKeyboardKey.keyN when isShiftPressed:
          final newTab = ref.read(tabsProvider.notifier).createIncognitoTab();
          ref.read(activeTabIdProvider.notifier).state = newTab.id;
      }
    }
  }
}

class _TitleBar extends StatelessWidget {
  const _TitleBar({required this.isIncognito});

  final bool isIncognito;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: UIDimensions.titleBarHeight,
      color: isIncognito
          ? HorizonColors.darkBgSecondary
          : context.bgColors.secondary,
      child: Row(
        children: [
          // Drag region
          const Expanded(child: _DragRegion()),
          // Window controls (for non-macOS)
          if (Theme.of(context).platform != TargetPlatform.macOS)
            const _WindowControls(),
        ],
      ),
    );
  }
}

class _DragRegion extends StatelessWidget {
  const _DragRegion();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      // TODO: Implement window dragging with window_manager
      child: const SizedBox.expand(),
    );
  }
}

class _WindowControls extends StatelessWidget {
  const _WindowControls();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _WindowButton(
          icon: Icons.remove,
          onPressed: () {
            // TODO: Minimize window
          },
        ),
        _WindowButton(
          icon: Icons.crop_square,
          onPressed: () {
            // TODO: Maximize window
          },
        ),
        _WindowButton(
          icon: Icons.close,
          isClose: true,
          onPressed: () {
            // TODO: Close window
          },
        ),
      ],
    );
  }
}

class _WindowButton extends StatefulWidget {
  const _WindowButton({
    required this.icon,
    required this.onPressed,
    this.isClose = false,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final bool isClose;

  @override
  State<_WindowButton> createState() => _WindowButtonState();
}

class _WindowButtonState extends State<_WindowButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Container(
          width: 46,
          height: UIDimensions.titleBarHeight,
          color: _isHovered
              ? (widget.isClose
                  ? HorizonColors.accentDanger
                  : context.bgColors.hover)
              : Colors.transparent,
          child: Icon(
            widget.icon,
            size: 16,
            color: _isHovered && widget.isClose
                ? Colors.white
                : context.textColors.secondary,
          ),
        ),
      ),
    );
  }
}

class _WebViewPlaceholder extends StatelessWidget {
  const _WebViewPlaceholder({required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    // This is a placeholder for the actual WebView
    // In production, replace with flutter_inappwebview
    return Container(
      color: context.bgColors.primary,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.public,
              size: 64,
              color: context.textColors.tertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'WebView Placeholder',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              url,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.bgColors.secondary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'In production, this area displays the actual web content\n'
                'using flutter_inappwebview package.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

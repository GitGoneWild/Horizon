/// Navigation bar widget for Horizon Browser
///
/// Contains navigation buttons, URL bar, and action buttons.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/app/providers/tab_providers.dart';
import 'package:horizon_flutter/app/theme/horizon_theme.dart';
import 'package:horizon_flutter/core/constants/app_constants.dart';
import 'package:horizon_flutter/core/services/url_service.dart';

/// Navigation bar widget
class NavigationBar extends ConsumerStatefulWidget {
  /// Creates a navigation bar
  const NavigationBar({
    this.onNavigate,
    this.onBack,
    this.onForward,
    this.onRefresh,
    this.onHome,
    super.key,
  });

  /// Called when the user navigates to a URL
  final ValueChanged<String>? onNavigate;

  /// Called when the back button is pressed
  final VoidCallback? onBack;

  /// Called when the forward button is pressed
  final VoidCallback? onForward;

  /// Called when the refresh button is pressed
  final VoidCallback? onRefresh;

  /// Called when the home button is pressed
  final VoidCallback? onHome;

  @override
  ConsumerState<NavigationBar> createState() => _NavigationBarState();
}

class _NavigationBarState extends ConsumerState<NavigationBar> {
  final _urlController = TextEditingController();
  final _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void dispose() {
    _urlController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleSubmit(String value) {
    final sanitized = const UrlService().sanitizeUrl(value);
    if (sanitized.isValid && sanitized.sanitizedUrl != null) {
      widget.onNavigate?.call(sanitized.sanitizedUrl!);
      _focusNode.unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeTab = ref.watch(activeTabProvider);

    // Update URL controller when active tab changes
    if (!_isFocused && activeTab != null) {
      final url = activeTab.url;
      if (_urlController.text != url) {
        _urlController.text = url.startsWith('horizon://') ? '' : url;
      }
    }

    return Container(
      height: UIDimensions.navBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      color: context.bgColors.primary,
      child: Row(
        children: [
          // Navigation buttons
          _NavButtons(
            canGoBack: activeTab?.canGoBack ?? false,
            canGoForward: activeTab?.canGoForward ?? false,
            isLoading: activeTab?.isLoading ?? false,
            onBack: widget.onBack,
            onForward: widget.onForward,
            onRefresh: widget.onRefresh,
            onHome: widget.onHome,
          ),
          const SizedBox(width: 8),
          // URL bar
          Expanded(
            child: _UrlBar(
              controller: _urlController,
              focusNode: _focusNode,
              url: activeTab?.url ?? '',
              isSecure: activeTab?.url.startsWith('https://') ?? false,
              onSubmitted: _handleSubmit,
              onFocusChanged: (focused) => setState(() => _isFocused = focused),
            ),
          ),
          const SizedBox(width: 8),
          // Action buttons
          _ActionButtons(
            isIncognito: activeTab?.isIncognito ?? false,
            onNewIncognitoTab: () {
              final tab = ref.read(tabsProvider.notifier).createIncognitoTab();
              ref.read(activeTabIdProvider.notifier).state = tab.id;
            },
          ),
        ],
      ),
    );
  }
}

class _NavButtons extends StatelessWidget {
  const _NavButtons({
    required this.canGoBack,
    required this.canGoForward,
    required this.isLoading,
    this.onBack,
    this.onForward,
    this.onRefresh,
    this.onHome,
  });

  final bool canGoBack;
  final bool canGoForward;
  final bool isLoading;
  final VoidCallback? onBack;
  final VoidCallback? onForward;
  final VoidCallback? onRefresh;
  final VoidCallback? onHome;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _NavButton(
          icon: Icons.arrow_back,
          tooltip: 'Back (Alt+Left)',
          onPressed: canGoBack ? onBack : null,
        ),
        _NavButton(
          icon: Icons.arrow_forward,
          tooltip: 'Forward (Alt+Right)',
          onPressed: canGoForward ? onForward : null,
        ),
        _NavButton(
          icon: isLoading ? Icons.close : Icons.refresh,
          tooltip: isLoading ? 'Stop' : 'Reload (Ctrl+R)',
          onPressed: onRefresh,
        ),
        _NavButton(
          icon: Icons.home,
          tooltip: 'Home',
          onPressed: onHome,
        ),
      ],
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.icon,
    required this.tooltip,
    this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: 20),
      tooltip: tooltip,
      onPressed: onPressed,
      style: IconButton.styleFrom(
        foregroundColor: context.textColors.secondary,
        disabledForegroundColor: context.textColors.tertiary.withOpacity(0.4),
        shape: const CircleBorder(),
        minimumSize: const Size(32, 32),
      ),
    );
  }
}

class _UrlBar extends StatelessWidget {
  const _UrlBar({
    required this.controller,
    required this.focusNode,
    required this.url,
    required this.isSecure,
    required this.onSubmitted,
    required this.onFocusChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final String url;
  final bool isSecure;
  final ValueChanged<String> onSubmitted;
  final ValueChanged<bool> onFocusChanged;

  @override
  Widget build(BuildContext context) {
    final securityState = const UrlService().getSecurityState(url);

    return Focus(
      onFocusChange: onFocusChanged,
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        decoration: InputDecoration(
          prefixIcon: _SecurityIndicator(state: securityState),
          hintText: 'Search or enter URL',
          suffixIcon: IconButton(
            icon: const Icon(Icons.arrow_forward, size: 18),
            onPressed: () => onSubmitted(controller.text),
            tooltip: 'Go',
          ),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(vertical: 8),
        ),
        style: Theme.of(context).textTheme.bodyMedium,
        textInputAction: TextInputAction.go,
        onSubmitted: onSubmitted,
        onTap: () {
          // Select all text when tapped
          controller.selection = TextSelection(
            baseOffset: 0,
            extentOffset: controller.text.length,
          );
        },
      ),
    );
  }
}

class _SecurityIndicator extends StatelessWidget {
  const _SecurityIndicator({required this.state});

  final UrlSecurityState state;

  @override
  Widget build(BuildContext context) {
    IconData icon;
    Color color;

    switch (state) {
      case UrlSecurityState.secure:
        icon = Icons.lock;
        color = HorizonColors.accentSuccess;
      case UrlSecurityState.insecure:
        icon = Icons.lock_open;
        color = HorizonColors.accentWarning;
      case UrlSecurityState.internal:
        icon = Icons.home;
        color = HorizonColors.accentPrimary;
      case UrlSecurityState.dangerous:
        icon = Icons.warning;
        color = HorizonColors.accentDanger;
    }

    return Padding(
      padding: const EdgeInsets.only(left: 12),
      child: Icon(icon, size: 18, color: color),
    );
  }
}

class _ActionButtons extends StatelessWidget {
  const _ActionButtons({
    required this.isIncognito,
    required this.onNewIncognitoTab,
  });

  final bool isIncognito;
  final VoidCallback onNewIncognitoTab;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: Icon(
            Icons.visibility_off,
            size: 20,
            color: isIncognito
                ? HorizonColors.accentTertiary
                : context.textColors.secondary,
          ),
          tooltip: 'New Incognito Tab (Ctrl+Shift+N)',
          onPressed: onNewIncognitoTab,
        ),
        IconButton(
          icon: const Icon(Icons.bookmark_border, size: 20),
          tooltip: 'Bookmarks (Ctrl+Shift+B)',
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.more_vert, size: 20),
          tooltip: 'More',
          onPressed: () {},
        ),
      ],
    );
  }
}

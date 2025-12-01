/// Tab bar widget for Horizon Browser
///
/// Displays browser tabs with add/close functionality.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/app/providers/tab_providers.dart';
import 'package:horizon_flutter/app/theme/horizon_theme.dart';
import 'package:horizon_flutter/core/constants/app_constants.dart';
import 'package:horizon_flutter/core/models/tab.dart';

/// Tab bar for browser tabs
class BrowserTabBar extends ConsumerWidget {
  /// Creates a browser tab bar
  const BrowserTabBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tabs = ref.watch(tabsProvider);
    final activeTabId = ref.watch(activeTabIdProvider);

    return Container(
      height: UIDimensions.tabBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      color: context.bgColors.secondary,
      child: Row(
        children: [
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: tabs.length,
              itemBuilder: (context, index) {
                final tab = tabs[index];
                return TabItem(
                  tab: tab,
                  isActive: tab.id == activeTabId,
                  onTap: () {
                    ref.read(activeTabIdProvider.notifier).state = tab.id;
                    ref.read(tabsProvider.notifier).activateTab(tab.id);
                  },
                  onClose: () {
                    final nextTabId =
                        ref.read(tabsProvider.notifier).closeTab(tab.id);
                    if (nextTabId != null) {
                      ref.read(activeTabIdProvider.notifier).state = nextTabId;
                    } else if (tabs.length == 1) {
                      // Create a new tab if closing the last one
                      final newTab = ref.read(tabsProvider.notifier).createTab();
                      ref.read(activeTabIdProvider.notifier).state = newTab.id;
                    }
                  },
                );
              },
            ),
          ),
          const SizedBox(width: 4),
          _NewTabButton(
            onPressed: () {
              final newTab = ref.read(tabsProvider.notifier).createTab();
              ref.read(activeTabIdProvider.notifier).state = newTab.id;
              ref.read(tabsProvider.notifier).activateTab(newTab.id);
            },
          ),
        ],
      ),
    );
  }
}

/// Individual tab item
class TabItem extends StatefulWidget {
  /// Creates a tab item
  const TabItem({
    required this.tab,
    required this.isActive,
    required this.onTap,
    required this.onClose,
    super.key,
  });

  /// The tab data
  final BrowserTab tab;

  /// Whether this tab is active
  final bool isActive;

  /// Called when the tab is tapped
  final VoidCallback onTap;

  /// Called when the close button is tapped
  final VoidCallback onClose;

  @override
  State<TabItem> createState() => _TabItemState();
}

class _TabItemState extends State<TabItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final colors = context.bgColors;

    Color backgroundColor;
    if (widget.tab.isIncognito) {
      backgroundColor = widget.isActive
          ? HorizonColors.incognitoBgActive
          : HorizonColors.incognitoBg;
    } else if (widget.isActive) {
      backgroundColor = colors.primary;
    } else if (_isHovered) {
      backgroundColor = colors.hover;
    } else {
      backgroundColor = colors.tertiary;
    }

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          constraints: const BoxConstraints(
            minWidth: UIDimensions.tabMinWidth,
            maxWidth: UIDimensions.tabMaxWidth,
          ),
          height: UIDimensions.tabHeight,
          margin: const EdgeInsets.only(right: 2, bottom: 4),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(8),
              topRight: Radius.circular(8),
            ),
          ),
          child: Row(
            children: [
              // Favicon
              if (widget.tab.isLoading)
                const _LoadingIndicator()
              else if (widget.tab.isIncognito)
                const _IncognitoIcon()
              else
                _TabFavicon(favicon: widget.tab.favicon),
              const SizedBox(width: 8),
              // Title
              Expanded(
                child: Text(
                  widget.tab.title,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              // Close button
              if (widget.isActive || _isHovered)
                _CloseButton(onPressed: widget.onClose),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 16,
      height: 16,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        color: HorizonColors.accentPrimary,
      ),
    );
  }
}

class _IncognitoIcon extends StatelessWidget {
  const _IncognitoIcon();

  @override
  Widget build(BuildContext context) {
    return Icon(
      Icons.visibility_off,
      size: 16,
      color: context.textColors.tertiary,
    );
  }
}

class _TabFavicon extends StatelessWidget {
  const _TabFavicon({this.favicon});

  final String? favicon;

  @override
  Widget build(BuildContext context) {
    if (favicon != null && favicon!.isNotEmpty) {
      return Image.network(
        favicon!,
        width: 16,
        height: 16,
        errorBuilder: (_, __, ___) => _defaultIcon(context),
      );
    }
    return _defaultIcon(context);
  }

  Widget _defaultIcon(BuildContext context) => Icon(
        Icons.public,
        size: 16,
        color: context.textColors.tertiary,
      );
}

class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: IconButton(
        icon: const Icon(Icons.close, size: 14),
        onPressed: onPressed,
        padding: EdgeInsets.zero,
        splashRadius: 12,
        color: context.textColors.tertiary,
        hoverColor: context.bgColors.hover,
      ),
    );
  }
}

class _NewTabButton extends StatelessWidget {
  const _NewTabButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      child: IconButton(
        icon: const Icon(Icons.add, size: 20),
        onPressed: onPressed,
        tooltip: 'New Tab (Ctrl+T)',
        style: IconButton.styleFrom(
          foregroundColor: context.textColors.secondary,
          backgroundColor: Colors.transparent,
          shape: const CircleBorder(),
          padding: EdgeInsets.zero,
          minimumSize: const Size(28, 28),
        ),
      ),
    );
  }
}

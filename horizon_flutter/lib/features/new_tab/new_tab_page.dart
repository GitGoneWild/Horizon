/// New tab page widget for Horizon Browser
///
/// Displays the new tab page with search and quick links.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/app/theme/horizon_theme.dart';

/// New tab page widget
class NewTabPage extends ConsumerStatefulWidget {
  /// Creates a new tab page
  const NewTabPage({
    this.onSearch,
    super.key,
  });

  /// Called when the user searches
  final ValueChanged<String>? onSearch;

  @override
  ConsumerState<NewTabPage> createState() => _NewTabPageState();
}

class _NewTabPageState extends ConsumerState<NewTabPage> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      widget.onSearch?.call(query);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            context.bgColors.secondary,
            context.bgColors.primary,
            context.bgColors.secondary,
          ],
        ),
      ),
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              _Logo(isDark: isDark),
              const SizedBox(height: 40),
              // Search box
              _SearchBox(
                controller: _searchController,
                onSearch: _handleSearch,
              ),
              const SizedBox(height: 40),
              // Quick links
              const _QuickLinks(),
              const SizedBox(height: 60),
              // Features
              const _Features(),
            ],
          ),
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ShaderMask(
          shaderCallback: (bounds) => HorizonTheme.cosmicGradient.createShader(
            Rect.fromLTWH(0, 0, bounds.width, bounds.height),
          ),
          child: const Text(
            '🌌 Horizon',
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Explore Beyond Limits',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: context.textColors.tertiary,
              ),
        ),
      ],
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox({
    required this.controller,
    required this.onSearch,
  });

  final TextEditingController controller;
  final VoidCallback onSearch;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 500),
      decoration: BoxDecoration(
        color: context.bgColors.primary,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'Search the web...',
                prefixIcon: Icon(Icons.search),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => onSearch(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ElevatedButton(
              onPressed: onSearch,
              style: ElevatedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(12),
              ),
              child: const Icon(Icons.arrow_forward, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickLinks extends StatelessWidget {
  const _QuickLinks();

  static const _links = [
    ('🔍', 'Search', 'https://duckduckgo.com'),
    ('📰', 'News', 'https://news.ycombinator.com'),
    ('🎬', 'Videos', 'https://www.youtube.com'),
    ('📚', 'Wikipedia', 'https://www.wikipedia.org'),
    ('💻', 'GitHub', 'https://github.com'),
    ('📧', 'Email', 'https://mail.google.com'),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 24,
      runSpacing: 16,
      alignment: WrapAlignment.center,
      children: _links
          .map((link) => _QuickLinkItem(
                icon: link.$1,
                label: link.$2,
                url: link.$3,
              ))
          .toList(),
    );
  }
}

class _QuickLinkItem extends StatefulWidget {
  const _QuickLinkItem({
    required this.icon,
    required this.label,
    required this.url,
  });

  final String icon;
  final String label;
  final String url;

  @override
  State<_QuickLinkItem> createState() => _QuickLinkItemState();
}

class _QuickLinkItemState extends State<_QuickLinkItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: () {
          // TODO: Navigate to URL
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _isHovered
                ? context.bgColors.hover
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: context.bgColors.secondary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    widget.icon,
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Features extends StatelessWidget {
  const _Features();

  static const _features = [
    ('🔒', 'Privacy First', 'Built-in ad blocker and tracker protection'),
    ('⚡', 'Lightning Fast', 'Hardware accelerated for smooth browsing'),
    ('🎨', 'Customizable', 'Themes, profiles, and more'),
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 40,
      runSpacing: 24,
      alignment: WrapAlignment.center,
      children: _features
          .map((feature) => _FeatureItem(
                icon: feature.$1,
                title: feature.$2,
                description: feature.$3,
              ))
          .toList(),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  final String icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 180,
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 32)),
          const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

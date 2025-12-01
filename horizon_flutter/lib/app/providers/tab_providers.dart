/// Tab providers for Horizon Browser
///
/// Manages tab state using Riverpod.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:horizon_flutter/core/models/tab.dart';
import 'package:uuid/uuid.dart';

/// Provider for the tabs list
final tabsProvider = StateNotifierProvider<TabsNotifier, List<BrowserTab>>((ref) {
  return TabsNotifier();
});

/// Provider for the active tab ID
final activeTabIdProvider = StateProvider<String?>((ref) => null);

/// Provider for the active tab
final activeTabProvider = Provider<BrowserTab?>((ref) {
  final tabs = ref.watch(tabsProvider);
  final activeId = ref.watch(activeTabIdProvider);
  if (activeId == null) return null;
  try {
    return tabs.firstWhere((t) => t.id == activeId);
  } catch (_) {
    return tabs.isEmpty ? null : tabs.first;
  }
});

/// Provider for tab count
final tabCountProvider = Provider<int>((ref) {
  return ref.watch(tabsProvider).length;
});

/// Provider for incognito tab count
final incognitoTabCountProvider = Provider<int>((ref) {
  return ref.watch(tabsProvider).where((t) => t.isIncognito).length;
});

/// State notifier for tabs
class TabsNotifier extends StateNotifier<List<BrowserTab>> {
  /// Creates a tabs notifier
  TabsNotifier() : super([]);

  /// Creates a new tab
  BrowserTab createTab({
    String url = 'horizon://newtab',
    String profileId = 'default',
    bool isIncognito = false,
  }) {
    final tab = BrowserTab.create(
      id: const Uuid().v4(),
      url: url,
      profileId: profileId,
      isIncognito: isIncognito,
    );
    state = [...state, tab];
    return tab;
  }

  /// Creates a new incognito tab
  BrowserTab createIncognitoTab({String url = 'horizon://newtab'}) {
    return createTab(
      url: url,
      isIncognito: true,
      profileId: 'incognito-${const Uuid().v4()}',
    );
  }

  /// Activates a tab
  void activateTab(String id) {
    state = state.map((tab) {
      if (tab.id == id) {
        return tab.copyWith(isActive: true);
      }
      return tab.copyWith(isActive: false);
    }).toList();
  }

  /// Closes a tab
  String? closeTab(String id) {
    final index = state.indexWhere((t) => t.id == id);
    if (index == -1) return null;

    final wasActive = state[index].isActive;
    state = state.where((t) => t.id != id).toList();

    // Return the ID of the tab to activate
    if (wasActive && state.isNotEmpty) {
      final newIndex = index >= state.length ? state.length - 1 : index;
      return state[newIndex].id;
    }
    return null;
  }

  /// Updates a tab
  void updateTab(String id, BrowserTab Function(BrowserTab) update) {
    state = state.map((tab) {
      if (tab.id == id) {
        return update(tab);
      }
      return tab;
    }).toList();
  }

  /// Updates tab URL
  void updateTabUrl(String id, String url) {
    updateTab(id, (tab) => tab.copyWith(url: url));
  }

  /// Updates tab title
  void updateTabTitle(String id, String title) {
    updateTab(id, (tab) => tab.copyWith(title: title));
  }

  /// Updates tab loading state
  void updateTabLoading(String id, bool isLoading) {
    updateTab(id, (tab) => tab.copyWith(isLoading: isLoading));
  }

  /// Updates tab navigation state
  void updateTabNavigation(String id, {bool? canGoBack, bool? canGoForward}) {
    updateTab(id, (tab) => tab.copyWith(
      canGoBack: canGoBack ?? tab.canGoBack,
      canGoForward: canGoForward ?? tab.canGoForward,
    ));
  }

  /// Updates tab favicon
  void updateTabFavicon(String id, String? favicon) {
    updateTab(id, (tab) => tab.copyWith(favicon: favicon));
  }

  /// Gets a tab by ID
  BrowserTab? getTab(String id) {
    try {
      return state.firstWhere((t) => t.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Gets all tabs for a profile
  List<BrowserTab> getTabsForProfile(String profileId) {
    return state.where((t) => t.profileId == profileId).toList();
  }

  /// Duplicates a tab
  BrowserTab? duplicateTab(String id) {
    final tab = getTab(id);
    if (tab == null) return null;

    return createTab(
      url: tab.url,
      profileId: tab.profileId,
      isIncognito: tab.isIncognito,
    );
  }

  /// Closes all tabs for a profile
  void closeTabsForProfile(String profileId) {
    state = state.where((t) => t.profileId != profileId).toList();
  }

  /// Closes all incognito tabs
  void closeAllIncognitoTabs() {
    state = state.where((t) => !t.isIncognito).toList();
  }
}

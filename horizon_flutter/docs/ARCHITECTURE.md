# Horizon Browser - Architecture Overview

This document describes the architecture of Horizon Browser's Flutter implementation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Widgets │  │   Features   │  │     Pages/Screens     │  │
│  └──────────┘  └──────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Riverpod Providers                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │    │
│  │  │   Tabs   │ │ Profiles │ │ Settings │ │ Creds  │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Models    │  │   Services  │  │      Utilities      │  │
│  │             │  │             │  │                     │  │
│  │ • Profile   │  │ • Password  │  │ • URL Validation    │  │
│  │ • Tab       │  │ • Encryption│  │ • Encryption Helpers│  │
│  │ • Credential│  │ • URL       │  │ • Constants         │  │
│  │ • Settings  │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Platform Layer                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Flutter/Dart                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐   │  │
│  │  │  InAppWeb  │  │   Hive     │  │ Secure Storage │   │  │
│  │  │    View    │  │  Storage   │  │                │   │  │
│  │  └────────────┘  └────────────┘  └────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
lib/
├── app/                          # Application configuration
│   ├── providers/                # Riverpod state providers
│   │   ├── credential_providers.dart
│   │   ├── profile_providers.dart
│   │   ├── settings_providers.dart
│   │   └── tab_providers.dart
│   ├── routing/                  # Navigation configuration
│   └── theme/                    # Theme definitions
│       └── horizon_theme.dart
│
├── core/                         # Domain layer
│   ├── constants/                # Application constants
│   │   └── app_constants.dart
│   ├── models/                   # Data models
│   │   ├── credential.dart
│   │   ├── profile.dart
│   │   ├── settings.dart
│   │   └── tab.dart
│   ├── services/                 # Business logic services
│   │   ├── encryption_service.dart
│   │   ├── password_service.dart
│   │   └── url_service.dart
│   └── utils/                    # Utility functions
│
├── features/                     # Feature modules
│   ├── credentials/              # Password management
│   ├── new_tab/                  # New tab page
│   │   └── new_tab_page.dart
│   ├── profiles/                 # Profile management
│   ├── security/                 # Security features
│   ├── sessions/                 # Session isolation
│   ├── settings/                 # Settings UI
│   └── tabs/                     # Tab management
│       └── browser_shell.dart
│
├── widgets/                      # Reusable UI components
│   ├── common/                   # Common widgets
│   ├── navigation/               # Navigation bar
│   │   └── navigation_bar.dart
│   └── tabs/                     # Tab bar
│       └── tab_bar.dart
│
└── main.dart                     # Application entry point
```

## State Management with Riverpod

Horizon uses **Riverpod** for state management due to its:
- Compile-time safety
- Dependency injection capabilities
- Easy testing support
- Separation of concerns

### Provider Types

| Provider | Purpose |
|----------|---------|
| `tabsProvider` | Manages open tabs state |
| `activeTabProvider` | Tracks currently active tab |
| `profilesProvider` | Manages user profiles |
| `settingsProvider` | Application settings |
| `credentialsProvider` | Stored passwords |

### State Flow

```
User Action → Widget → Ref.read() → Notifier → State Update → UI Rebuild
```

## Key Design Decisions

### 1. Feature-First Organization

Each feature is self-contained with its own:
- Widgets
- Providers
- Models (if feature-specific)
- Services (if feature-specific)

### 2. Immutable Models with Equatable

All models extend `Equatable` for:
- Value equality comparison
- Immutability enforcement
- Efficient rebuilds

### 3. Service Layer Pattern

Services handle:
- Business logic separate from UI
- External integrations
- Complex computations

### 4. Repository Pattern

Repositories abstract data storage:
- `ProfileRepository` - Profile persistence
- Future: `CredentialRepository`, `SettingsRepository`

## Security Architecture

```
┌─────────────────────────────────────────────┐
│              Security Layer                  │
├─────────────────────────────────────────────┤
│  URL Validation                             │
│  • Phishing pattern detection               │
│  • Dangerous scheme blocking                │
│  • TLD validation                           │
├─────────────────────────────────────────────┤
│  Credential Security                        │
│  • AES-256-GCM encryption                   │
│  • Secure key derivation                    │
│  • Platform keychain integration            │
├─────────────────────────────────────────────┤
│  Password Generation                        │
│  • Cryptographically secure random          │
│  • Rejection sampling for unbiased output   │
│  • Configurable character sets              │
└─────────────────────────────────────────────┘
```

## WebView Integration

Horizon uses `flutter_inappwebview` for:
- Multi-tab support with isolated sessions
- Custom user agent configuration
- Ad/tracker blocking via request interception
- Incognito mode without persistence

### Tab Lifecycle

```
Create Tab → Load URL → Navigate → Update State → Close Tab
     │                      │
     ▼                      ▼
Session Created      Progress Events
(from Profile)       (loading, error, etc.)
```

## Theming System

```dart
// Cosmic color palette
HorizonColors.cosmicStart   // #6366F1
HorizonColors.cosmicMid     // #8B5CF6  
HorizonColors.cosmicEnd     // #A855F7

// Theme access
Theme.of(context).colorScheme
context.bgColors    // Background colors
context.textColors  // Text colors
```

## Testing Strategy

| Layer | Testing Approach |
|-------|------------------|
| Models | Unit tests for serialization, equality |
| Services | Unit tests for business logic |
| Providers | Unit tests with mocked dependencies |
| Widgets | Widget tests for UI behavior |
| Features | Integration tests for user flows |

## Future Considerations

### Planned Improvements

1. **WebView Implementation** - Full integration with flutter_inappwebview
2. **Hive Storage** - Persistent local storage
3. **Extension Support** - Plugin architecture
4. **Sync Feature** - Cross-device synchronization

### Scalability

The architecture supports:
- Adding new features as isolated modules
- Swapping implementations (e.g., storage backends)
- Platform-specific customization
- Theming extensions

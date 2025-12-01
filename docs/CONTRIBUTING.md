# Contributing to Horizon Browser (Flutter)

Thank you for your interest in contributing to Horizon Browser! This document provides guidelines for contributing to the Flutter implementation.

## Getting Started

### Prerequisites

1. **Flutter SDK** 3.24.0+
2. **Dart SDK** 3.2.0+
3. An IDE with Flutter support (VS Code or Android Studio recommended)
4. Git
5. Platform-specific requirements:
   - **Windows**: Visual Studio 2022 with C++ desktop development, and [NuGet](https://www.nuget.org/downloads)
   - **macOS**: Xcode 15+ with command line tools
   - **Linux**: GTK3 development libraries

### Windows-Specific Setup

The project uses `flutter_inappwebview` which requires NuGet on Windows to download WebView2 dependencies.

> **⚠️ Windows users:** If you encounter build errors mentioning `NUGET-NOTFOUND` or MSB3073, see the [Troubleshooting Guide](TROUBLESHOOTING.md) for solutions.

**Quick Setup (Recommended):**

```powershell
# Run the automated setup script from the repository root
.\scripts\setup-windows.ps1
```

**Manual Setup:**

```powershell
# Install NuGet using winget
winget install Microsoft.NuGet

# Or download and install manually
Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile "$env:LOCALAPPDATA\NuGet\nuget.exe"
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:LOCALAPPDATA\NuGet", [EnvironmentVariableTarget]::User)

# Verify installation
nuget help
```

**Important**: Restart your terminal/IDE after installing NuGet.

### Setup

```bash
# Clone the repository
git clone https://github.com/GitGoneWild/Horizon.git
cd Horizon

# Install dependencies
flutter pub get

# Run code generation (if needed)
flutter pub run build_runner build

# Run tests to verify setup
flutter test
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Follow the existing code style and conventions
- Write tests for new functionality
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Format code
dart format .

# Analyze code
flutter analyze --fatal-infos

# Run tests
flutter test --coverage
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add password strength indicator"
git commit -m "fix: resolve tab close crash"
git commit -m "docs: update architecture documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Submit a Pull Request

- Push your branch and open a PR
- Fill in the PR template
- Link related issues
- Wait for review

## Code Guidelines

### Architecture

Follow the feature-first architecture:

```
lib/
├── app/           # App configuration, providers, themes
├── core/          # Shared models, services, utilities
├── features/      # Feature modules
└── widgets/       # Reusable UI components
```

### State Management

Use Riverpod for state management:

```dart
// Define a provider
final myFeatureProvider = StateNotifierProvider<MyNotifier, MyState>((ref) {
  return MyNotifier();
});

// Use in widgets
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(myFeatureProvider);
    return ...;
  }
}
```

### Models

- Make models immutable
- Extend `Equatable` for value equality
- Include `copyWith`, `toJson`, and `fromJson` methods

```dart
class MyModel extends Equatable {
  const MyModel({
    required this.id,
    required this.name,
  });

  final String id;
  final String name;

  @override
  List<Object?> get props => [id, name];
}
```

### Widgets

- Keep widgets focused and small
- Extract reusable widgets to `widgets/`
- Use `const` constructors when possible
- Follow naming conventions: `MyFeatureWidget`, `_PrivateWidget`

### Services

- Keep business logic in services
- Make services testable with dependency injection
- Document public APIs

## Adding New Features

### 1. Create Feature Structure

```bash
mkdir -p lib/features/my_feature
```

### 2. Create Feature Files

```
lib/features/my_feature/
├── my_feature_page.dart      # Main page/screen
├── widgets/                   # Feature-specific widgets
├── providers/                 # Feature providers (optional)
└── models/                    # Feature models (optional)
```

### 3. Add Provider (if needed)

```dart
// In lib/app/providers/my_feature_providers.dart
final myFeatureProvider = StateNotifierProvider<...>(...);
```

### 4. Export from Feature

```dart
// lib/features/my_feature/my_feature.dart
export 'my_feature_page.dart';
export 'widgets/my_widget.dart';
```

### 5. Write Tests

```dart
// test/my_feature_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:horizon_flutter/features/my_feature/my_feature.dart';

void main() {
  group('MyFeature', () {
    test('should do something', () {
      // Test implementation
    });
  });
}
```

## Adding New Settings

### 1. Update Settings Model

```dart
// In lib/core/models/settings.dart
class GeneralSettings extends Equatable {
  const GeneralSettings({
    // ... existing fields
    this.myNewSetting = defaultValue,
  });

  final MyType myNewSetting;
  // ...
}
```

### 2. Update Settings Provider

```dart
// In lib/app/providers/settings_providers.dart
void updateMyNewSetting(MyType value) {
  state = state.copyWith(
    general: state.general.copyWith(myNewSetting: value),
  );
}
```

### 3. Add UI Control

Add the setting control to the appropriate settings page/section.

## Extending Blocking Rules

### 1. Update URL Service

```dart
// In lib/core/services/url_service.dart
final List<RegExp> _suspiciousPatterns = [
  // Add new patterns
  RegExp(r'new-pattern', caseSensitive: false),
];

const Set<String> _blockedTLDs = {
  // Add new TLDs
  '.suspicious',
};
```

### 2. Add Tests

```dart
test('blocks new suspicious pattern', () {
  expect(urlService.isUrlSafe('https://new-suspicious.com'), false);
});
```

## Testing Guidelines

### Unit Tests

- Test all public APIs
- Use descriptive test names
- Group related tests

```dart
group('PasswordService', () {
  group('generatePassword', () {
    test('generates password of specified length', () {
      // ...
    });
  });
});
```

### Widget Tests

- Test user interactions
- Verify UI updates correctly
- Use `pumpWidget` and `pump`

```dart
testWidgets('shows loading indicator', (tester) async {
  await tester.pumpWidget(MyWidget());
  expect(find.byType(CircularProgressIndicator), findsOneWidget);
});
```

### Coverage

- Aim for 80%+ coverage on core modules
- Run `flutter test --coverage` to check

## Documentation

- Update README for user-facing changes
- Update ARCHITECTURE.md for structural changes
- Add inline documentation for public APIs

```dart
/// Generates a secure random password.
///
/// [options] configures the password generation.
/// Returns a string of the specified length.
String generatePassword([PasswordOptions options]);
```

## Questions?

- Open an issue for questions
- Join discussions on GitHub
- Check existing issues before creating new ones

Thank you for contributing to Horizon Browser! 🚀

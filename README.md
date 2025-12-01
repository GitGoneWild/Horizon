# 🌌 Horizon Browser - Flutter Edition

<div align="center">

### **Explore Beyond Limits** 🚀

*A futuristic, secure, and privacy-focused web browser built with Flutter*

[![Flutter](https://img.shields.io/badge/Flutter-3.24+-02569B.svg?logo=flutter)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/Dart-3.2+-0175C2.svg?logo=dart)](https://dart.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

**Fast** ⚡ • **Secure** 🔒 • **Private** 👁️

</div>

---

## ✨ Features

### 🌐 Core Browsing
- **WebView Integration** - Modern web standards support via flutter_inappwebview
- **Tabbed Browsing** - Efficient tab management with visual indicators
- **Smart URL Bar** - Search or navigate with intelligent URL detection
- **Keyboard Shortcuts** - Full keyboard navigation support

### 🔐 Privacy & Security
- **Built-in Ad Blocker** - Ad-free browsing experience
- **Tracker Blocking** - Block third-party trackers by default
- **HTTPS Enforcement** - Prefer secure connections
- **Fingerprinting Protection** - Reduce browser fingerprinting
- **Incognito Mode** - Private browsing with no data persistence

### 👤 Multi-Profile Support
- **Isolated Sessions** - Separate cookies, storage, and history per profile
- **Easy Switching** - Quick profile dropdown in toolbar
- **Profile Management** - Create, edit, and delete profiles with custom colors

### 🔑 Password Management
- **Secure Storage** - AES-256-GCM encrypted password storage
- **Password Generator** - Create strong, random passwords
- **Strength Assessment** - Real-time password strength feedback

### 🎨 Customization
- **Dark/Light/System Themes** - Automatic theme switching with cosmic colors
- **Customizable New Tab** - Quick links and search
- **Settings Page** - Comprehensive configuration options

### ⚡ Performance
- **Hardware Acceleration** - GPU-accelerated rendering
- **Lazy Tab Loading** - Reduce memory usage
- **Efficient Memory Management** - Suspend inactive tabs

---

## 📦 Installation

### Prerequisites

- **Flutter SDK** 3.24.0 or later
- **Dart SDK** 3.2.0 or later
- Platform-specific requirements:
  - **Windows**: Visual Studio 2022 with C++ desktop development, and [NuGet](https://www.nuget.org/downloads) (required for WebView2 plugin)
  - **macOS**: Xcode 15+ with command line tools
  - **Linux**: GTK3 development libraries

### Windows Setup

The `flutter_inappwebview` plugin requires NuGet to download its Windows dependencies (WebView2, etc.).

#### Quick Setup (Recommended)

Run the automated setup script in PowerShell:

```powershell
# From the repository root
.\scripts\setup-windows.ps1
```

This script will:
- Install NuGet CLI and add it to your PATH
- Verify WebView2 Runtime availability
- Provide next-step instructions

#### Manual Setup

If you prefer manual installation:

1. **Install NuGet CLI** (choose one method):
   
   **Option A: Using winget**
   ```powershell
   winget install Microsoft.NuGet
   ```
   
   **Option B: Direct download**
   ```powershell
   # Download to user directory and add to PATH
   Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile "$env:LOCALAPPDATA\NuGet\nuget.exe"
   [Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:LOCALAPPDATA\NuGet", [EnvironmentVariableTarget]::User)
   ```

2. **Restart your terminal/IDE** after installing NuGet

3. **Verify installation**:
   ```powershell
   nuget help
   ```

#### Troubleshooting

If you encounter `NUGET-NOTFOUND` or error code 9009:

```powershell
# Clean and rebuild
flutter clean
flutter pub get
flutter run -d windows
```

If NuGet is installed but not found, ensure it's in your PATH:
```powershell
# Check if NuGet is accessible
Get-Command nuget

# If not found, add to current session manually
$env:Path += ";$env:LOCALAPPDATA\NuGet"
```

### Getting Started

```bash
# Clone the repository
git clone https://github.com/GitGoneWild/Horizon.git
cd Horizon

# Install dependencies
flutter pub get

# Run the app in development mode
flutter run -d linux   # For Linux
flutter run -d macos   # For macOS
flutter run -d windows # For Windows
```

### Building for Production

```bash
# Build for Linux
flutter build linux --release

# Build for macOS
flutter build macos --release

# Build for Windows
flutter build windows --release
```

Build artifacts will be in `build/<platform>/`.

---

## 🛠️ Development

### 📁 Project Structure

```
Horizon/
├── lib/
│   ├── app/                    # App root, routing, DI, themes
│   │   ├── providers/          # Riverpod providers
│   │   ├── routing/            # Navigation/routing
│   │   └── theme/              # Theme definitions
│   ├── core/                   # Shared domain logic
│   │   ├── constants/          # App constants
│   │   ├── models/             # Data models
│   │   ├── services/           # Core services
│   │   └── utils/              # Utilities
│   ├── features/               # Feature modules
│   │   ├── tabs/               # Tab management
│   │   ├── profiles/           # Profile management
│   │   ├── sessions/           # Session isolation
│   │   ├── security/           # Security features
│   │   ├── credentials/        # Password management
│   │   ├── settings/           # Settings management
│   │   └── new_tab/            # New tab page
│   ├── widgets/                # Shared UI components
│   │   ├── common/             # Common widgets
│   │   ├── navigation/         # Navigation widgets
│   │   └── tabs/               # Tab-related widgets
│   └── main.dart               # Entry point
├── assets/                     # Icons, images
├── test/                       # Unit tests
├── integration_test/           # E2E tests
└── docs/                       # Documentation
```

### 🏗️ Architecture

Horizon Flutter follows a **feature-first architecture** with:

- **Riverpod** for state management and dependency injection
- **Clean separation** between UI, business logic, and data layers
- **SOLID principles** for maintainable code
- **Immutable models** using Equatable

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

### 🚀 Scripts

```bash
# Development
flutter run                    # Run in debug mode
flutter run --release          # Run in release mode

# Testing
flutter test                   # Run unit tests
flutter test --coverage        # Run tests with coverage

# Code Quality
flutter analyze                # Static analysis
dart format .                  # Format code

# Code Generation
flutter pub run build_runner build  # Generate code
```

---

## 🔒 Security

Security is a top priority:

| Feature | Description |
|---------|-------------|
| 🔐 Encrypted Storage | AES-256-GCM for credentials |
| 🛡️ URL Validation | Protection against phishing |
| ⛔ XSS Prevention | JavaScript URL blocking |
| 🔄 Secure Random | Cryptographic password generation |

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test file
flutter test test/password_service_test.dart
```

### Test Coverage

Tests cover:
- Password generation and strength assessment
- URL validation and sanitization
- Profile model serialization
- Settings model validation
- Security logic

---

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Tab | `Ctrl+T` | `Cmd+T` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| New Incognito Tab | `Ctrl+Shift+N` | `Cmd+Shift+N` |
| Focus URL Bar | `Ctrl+L` | `Cmd+L` |
| Refresh | `Ctrl+R` | `Cmd+R` |
| Back | `Alt+Left` | `Cmd+Left` |
| Forward | `Alt+Right` | `Cmd+Right` |

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

### 🌌 **Horizon** - *Explore Beyond Limits*

Made with ❤️ and Flutter

</div>

# UltraBrowse

<div align="center">

![UltraBrowse Logo](assets/icons/icon.png)

**Fast. Secure. Private.**

A modern, lightweight web browser built with Electron.js, focusing on speed, security, and user privacy.

[![CI/CD](https://github.com/GitGoneWild/Horizon/actions/workflows/ci.yml/badge.svg)](https://github.com/GitGoneWild/Horizon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🚀 Features

### Core Browsing
- **Chromium-Based Engine**: Fast, modern web standards support via Electron
- **Tabbed Browsing**: Efficient tab management with visual indicators
- **Smart URL Bar**: Search or navigate directly with intelligent URL detection
- **Keyboard Shortcuts**: Full keyboard navigation support

### Privacy & Security
- **Built-in Ad Blocker**: uBlock Origin pre-installed for ad-free browsing
- **Tracker Blocking**: Block third-party trackers by default
- **HTTPS Enforcement**: Prefer secure connections
- **Fingerprinting Protection**: Reduce browser fingerprinting
- **Incognito Mode**: Private browsing with no data persistence

### Multi-Profile Support
- **Isolated Sessions**: Each profile has separate cookies, storage, and history
- **Easy Profile Switching**: Quick profile dropdown in toolbar
- **Profile Management**: Create, edit, and delete profiles with custom colors

### Password Management
- **Secure Credential Storage**: AES-256-GCM encrypted password storage
- **Password Generator**: Create strong, random passwords
- **Strength Assessment**: Real-time password strength feedback
- **Autofill Support**: Quick credential filling

### Customization
- **Dark/Light/System Themes**: Automatic theme switching
- **Customizable New Tab Page**: Quick links and search
- **Extension Support**: Chrome extension compatibility
- **Settings Page**: Comprehensive configuration options

### Performance
- **Hardware Acceleration**: GPU-accelerated rendering
- **Lazy Tab Loading**: Reduce memory usage
- **Efficient Memory Management**: Suspend inactive tabs

---

## 📦 Installation

### From Release (Recommended)
Download the latest release for your platform:
- **Windows**: `UltraBrowse-Setup.exe`
- **macOS**: `UltraBrowse.dmg`
- **Linux**: `UltraBrowse.AppImage` or `.deb`

### From Source

```bash
# Clone the repository
git clone https://github.com/GitGoneWild/Horizon.git
cd Horizon

# Install dependencies
npm install

# Start the browser
npm start

# Or in development mode
npm run dev
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Project Structure

```
ultrabrowse/
├── src/
│   ├── main/           # Main process (Electron)
│   │   ├── main.js     # Entry point
│   │   ├── profiles/   # Profile management
│   │   ├── sessions/   # Session isolation
│   │   ├── tabs/       # Tab management
│   │   ├── security/   # Security policies
│   │   ├── credentials/# Password management
│   │   ├── extensions/ # Extension support
│   │   ├── settings/   # User preferences
│   │   ├── menu/       # Application menu
│   │   ├── ipc/        # IPC handlers
│   │   └── utils/      # Utilities
│   ├── preload/        # Preload scripts
│   └── renderer/       # Browser UI
│       ├── index.html  # Main HTML
│       ├── styles/     # CSS styles
│       └── scripts/    # UI logic
├── tests/
│   ├── unit/           # Unit tests
│   └── e2e/            # End-to-end tests
├── assets/             # Icons and images
└── scripts/            # Build scripts
```

### Scripts

```bash
# Development
npm start           # Start the browser
npm run dev         # Start in development mode

# Testing
npm test            # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:e2e    # Run end-to-end tests

# Linting
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues

# Building
npm run build       # Build for production
npm run package     # Package without installer
npm run package:win # Build Windows installer
npm run package:mac # Build macOS installer
npm run package:linux # Build Linux packages
```

---

## 🔒 Security

UltraBrowse is built with security as a priority:

- **Context Isolation**: Renderer processes are isolated from Node.js
- **Sandbox Mode**: Web content runs in sandboxed environment
- **CSP Headers**: Strict Content Security Policy
- **No Remote Module**: Remote module is disabled
- **Regular Updates**: Dependabot monitors dependency updates
- **Security Audit**: Regular npm audit checks

### Reporting Vulnerabilities

Please report security vulnerabilities to the repository issues with the `security` label.

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

Tests cover:
- Profile management
- Security manager (URL validation, policies)
- Credential manager (encryption, storage)
- Settings manager (persistence, defaults)

### Coverage
Aim for 80%+ code coverage on core modules.

---

## 📋 Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Tab | `Ctrl+T` | `Cmd+T` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| New Incognito Tab | `Ctrl+Shift+N` | `Cmd+Shift+N` |
| Focus URL Bar | `Ctrl+L` | `Cmd+L` |
| Refresh | `Ctrl+R` or `F5` | `Cmd+R` |
| Back | `Alt+Left` | `Cmd+Left` |
| Forward | `Alt+Right` | `Cmd+Right` |
| Developer Tools | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Settings | `Ctrl+,` | `Cmd+,` |
| History | `Ctrl+H` | `Cmd+H` |
| Bookmarks | `Ctrl+Shift+B` | `Cmd+Shift+B` |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop framework
- [uBlock Origin](https://github.com/gorhill/uBlock) - Ad blocking
- [Dark Reader](https://darkreader.org/) - Dark mode extension
- All open-source contributors

---

<div align="center">
Made with ❤️ by the UltraBrowse Team
</div>

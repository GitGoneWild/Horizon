# 🌌 Horizon Browser

<div align="center">

![Horizon Logo](assets/icons/icon.svg)

### **Explore Beyond Limits** 🚀

*A futuristic, secure, and privacy-focused web browser built with Electron*

[![CI/CD](https://github.com/GitGoneWild/Horizon/actions/workflows/ci.yml/badge.svg)](https://github.com/GitGoneWild/Horizon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-9FEAF9.svg?logo=electron)](https://www.electronjs.org/)
[![Version](https://img.shields.io/badge/version-0.1.0-purple.svg)](package.json)

**Fast** ⚡ • **Secure** 🔒 • **Private** 👁️

</div>

---

## ✨ Features

### 🌐 Core Browsing
- **Chromium Engine** - Modern web standards support via Electron
- **Tabbed Browsing** - Efficient tab management with visual indicators
- **Smart URL Bar** - Search or navigate with intelligent URL detection
- **Keyboard Shortcuts** - Full keyboard navigation support

### 🔐 Privacy & Security
- **Built-in Ad Blocker** - Ad-free browsing experience
- **Tracker Blocking** - Block third-party trackers by default
- **HTTPS Enforcement** - Prefer secure connections
- **Fingerprinting Protection** - Reduce browser fingerprinting
- **Incognito Mode** - Private browsing with no data persistence
- **Context Isolation** - Secure renderer process isolation
- **Sandbox Mode** - Web content runs in sandboxed environment

### 👤 Multi-Profile Support
- **Isolated Sessions** - Separate cookies, storage, and history per profile
- **Easy Switching** - Quick profile dropdown in toolbar
- **Profile Management** - Create, edit, and delete profiles with custom colors

### 🔑 Password Management
- **Secure Storage** - AES-256-GCM encrypted password storage
- **Password Generator** - Create strong, random passwords
- **Strength Assessment** - Real-time password strength feedback
- **Autofill Support** - Quick credential filling

### 🎨 Customization
- **Dark/Light/System Themes** - Automatic theme switching with cosmic colors
- **Customizable New Tab** - Quick links and search
- **Extension Support** - Chrome extension compatibility
- **Settings Page** - Comprehensive configuration options

### ⚡ Performance
- **Hardware Acceleration** - GPU-accelerated rendering
- **Lazy Tab Loading** - Reduce memory usage
- **Efficient Memory Management** - Suspend inactive tabs

---

## 📦 Installation

### 📥 From Release (Recommended)
Download the latest release for your platform:
- **Windows**: `Horizon-Setup.exe`
- **macOS**: `Horizon.dmg`
- **Linux**: `Horizon.AppImage` or `.deb`

### 🔧 From Source

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

### 📁 Project Structure

```
horizon/
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
├── docs/               # Documentation
├── assets/             # Icons and images
└── scripts/            # Build scripts
```

### 🚀 Scripts

```bash
# Development
npm start           # Start the browser
npm run dev         # Start in development mode

# Testing
npm test            # Run unit tests with coverage
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

Horizon is built with security as a top priority:

| Feature | Description |
|---------|-------------|
| 🔐 Context Isolation | Renderer processes isolated from Node.js |
| 📦 Sandbox Mode | Web content runs in sandboxed environment |
| 🛡️ CSP Headers | Strict Content Security Policy |
| ⛔ No Remote Module | Remote module is disabled |
| 🔄 Regular Updates | Dependabot monitors dependency updates |
| 🔍 Security Audit | Regular npm audit checks |

### 🐛 Reporting Vulnerabilities

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

### Coverage Target
**80%+ code coverage** on core modules.

---

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Tab | `Ctrl+T` | `Cmd+T` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| New Incognito Tab | `Ctrl+Shift+N` | `Cmd+Shift+N` |
| Focus URL Bar | `Ctrl+L` | `Cmd+L` |
| Refresh | `Ctrl+R` / `F5` | `Cmd+R` |
| Back | `Alt+Left` | `Cmd+Left` |
| Forward | `Alt+Right` | `Cmd+Right` |
| Developer Tools | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| Settings | `Ctrl+,` | `Cmd+,` |
| History | `Ctrl+H` | `Cmd+H` |
| Bookmarks | `Ctrl+Shift+B` | `Cmd+Shift+B` |
| Zoom In | `Ctrl++` | `Cmd++` |
| Zoom Out | `Ctrl+-` | `Cmd+-` |
| Reset Zoom | `Ctrl+0` | `Cmd+0` |
| Find in Page | `Ctrl+F` | `Cmd+F` |

---

## 🤝 Contributing

Contributions are welcome! 

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

### 🌌 **Horizon** - *Explore Beyond Limits*

Made with ❤️ by the Horizon Team

</div>

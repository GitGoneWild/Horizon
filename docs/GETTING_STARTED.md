# 🛠️ Getting Started with Horizon

Welcome to **Horizon Browser** development! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Latest | `git --version` |

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/GitGoneWild/Horizon.git
cd Horizon
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all Node.js dependencies
- Set up Electron app dependencies
- Install native modules (like keytar)

### 3. Start Development

```bash
# Start in development mode with hot reload
npm run dev

# Or start in production mode
npm start
```

## 🏗️ Building

### Development Build

```bash
npm run build:renderer
```

### Production Build (All Platforms)

```bash
npm run build
```

### Platform-Specific Builds

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

## 🧪 Testing

```bash
# Run all unit tests with coverage
npm test

# Watch mode for development
npm run test:watch

# End-to-end tests
npm run test:e2e
```

## 🎨 Code Style

We use ESLint for code quality:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## 📁 Project Structure

```
horizon/
├── src/
│   ├── main/           # Main Electron process
│   │   ├── main.js     # Entry point
│   │   ├── credentials/# Password management
│   │   ├── profiles/   # Profile management
│   │   ├── security/   # Security policies
│   │   ├── settings/   # User preferences
│   │   ├── tabs/       # Tab management
│   │   └── ...
│   ├── preload/        # Preload scripts (IPC bridge)
│   └── renderer/       # Browser UI (HTML/CSS/JS)
├── tests/              # Test files
├── docs/               # Documentation
├── assets/             # Icons and images
└── scripts/            # Build scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |

### Settings

User settings are stored using `electron-store` and can be found at:
- **Windows**: `%APPDATA%/Horizon/config.json`
- **macOS**: `~/Library/Application Support/Horizon/config.json`
- **Linux**: `~/.config/Horizon/config.json`

## 🐛 Debugging

### Main Process

Use `--inspect` flag:
```bash
electron --inspect=5858 .
```

### Renderer Process

Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on macOS) to open DevTools.

## 📚 Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md)
- Check out [Contributing Guidelines](../CONTRIBUTING.md)
- Review [Security Best Practices](./SECURITY.md)

---

Happy coding! 🌌

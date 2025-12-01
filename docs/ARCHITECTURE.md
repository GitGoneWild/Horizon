# 🏛️ Horizon Architecture

## Overview

Horizon is built on **Electron**, providing a cross-platform desktop browser with Chromium rendering and Node.js capabilities. The architecture follows Electron's multi-process model with security as a top priority.

## 🔷 Process Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAIN PROCESS                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ Tab Manager │ │  Profiles   │ │  Security   │ │ Credentials│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │  Sessions   │ │  Settings   │ │ Extensions  │ │    Menu    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│                           │ IPC                                  │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                     PRELOAD SCRIPT                               │
│            (Secure bridge via contextBridge)                     │
│                  window.horizon API                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    RENDERER PROCESS                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Browser Chrome                            ││
│  │  [Tabs] [URL Bar] [Navigation] [Menu] [Profile]             ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Web Content                               ││
│  │              (BrowserView / webContents)                    ││
│  │                    [Sandboxed]                              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Security Principles

1. **Context Isolation** - Renderer can't access Node.js directly
2. **Sandbox Mode** - Web content runs in isolated sandbox
3. **No Node Integration** - `nodeIntegration: false`
4. **Preload Scripts** - Secure IPC bridge only
5. **CSP Headers** - Content Security Policy enforcement

### BrowserWindow Security Settings

```javascript
webPreferences: {
  nodeIntegration: false,      // ✅ Disabled
  contextIsolation: true,      // ✅ Enabled
  sandbox: true,               // ✅ Enabled
  preload: 'preload.js',       // ✅ Secure bridge
  webviewTag: true,            // For BrowserViews
  enableRemoteModule: false,   // ✅ Disabled
  allowRunningInsecureContent: false  // ✅ Blocked
}
```

## 📦 Core Modules

### Main Process Modules

| Module | Purpose | Location |
|--------|---------|----------|
| **TabManager** | Tab lifecycle, navigation | `src/main/tabs/` |
| **ProfileManager** | User profiles, isolation | `src/main/profiles/` |
| **SessionManager** | Session handling | `src/main/sessions/` |
| **SecurityManager** | URL validation, policies | `src/main/security/` |
| **CredentialManager** | Password storage | `src/main/credentials/` |
| **SettingsManager** | User preferences | `src/main/settings/` |
| **ExtensionManager** | Chrome extensions | `src/main/extensions/` |

### IPC Communication

All renderer-main communication goes through secure IPC:

```javascript
// Preload exposes safe API
contextBridge.exposeInMainWorld('horizon', {
  tabs: { create, close, navigate, ... },
  settings: { get, set, ... },
  security: { isUrlSafe, sanitizeUrl, ... }
});
```

## 🗃️ Data Storage

| Data Type | Storage Method | Encryption |
|-----------|---------------|------------|
| Settings | electron-store | ❌ |
| Profiles | electron-store | ❌ |
| Credentials | electron-store + crypto | ✅ AES-256-GCM |
| Session Data | Electron Session | Per-profile |
| Cookies | Electron Cookies | Per-profile |

## 🎨 UI Layer

The renderer uses vanilla JavaScript with:
- Custom CSS variables for theming
- Responsive design
- Accessibility (ARIA) support
- Keyboard navigation

### Theme System

```css
:root {
  --accent-primary: #6366f1;  /* Cosmic indigo */
  --bg-primary: #ffffff;
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f0f23;
    /* ... */
  }
}
```

## 🔄 Data Flow

```
User Action → Renderer → IPC (horizon API) → Main Process → Handler
     ↑                                              │
     └──────────── IPC Response ←───────────────────┘
```

## 📈 Performance Considerations

1. **Lazy Tab Loading** - Tabs load on activation
2. **Tab Suspension** - Inactive tabs can be suspended
3. **Hardware Acceleration** - GPU rendering enabled
4. **Preload Optimization** - Minimal preload scripts

---

For more details, see the individual module documentation.

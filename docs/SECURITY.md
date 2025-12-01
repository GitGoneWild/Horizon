# 🔒 Security Guide

Horizon is designed with security as a top priority. This document outlines the security measures and best practices implemented.

## 🛡️ Security Principles

### 1. Defense in Depth
Multiple layers of security ensure that if one layer is compromised, others remain.

### 2. Least Privilege
Components only have access to what they absolutely need.

### 3. Secure by Default
Security features are enabled by default, not opt-in.

## 🔐 Electron Security Configuration

### Process Isolation

```javascript
// Main window security settings
webPreferences: {
  nodeIntegration: false,       // No Node.js in renderer
  contextIsolation: true,       // Separate contexts
  sandbox: true,                // OS-level sandboxing
  enableRemoteModule: false,    // Disabled remote module
  allowRunningInsecureContent: false
}
```

### What This Means

| Setting | Protection |
|---------|------------|
| `nodeIntegration: false` | Prevents XSS from accessing file system |
| `contextIsolation: true` | Isolates preload from page scripts |
| `sandbox: true` | Chromium sandbox protects OS |
| `enableRemoteModule: false` | Blocks dangerous remote API |

## 🌐 URL Security

### Safe URL Validation

The SecurityManager validates all URLs before navigation:

```javascript
// Allowed protocols
- https://
- http:// (with warning)
- horizon:// (internal pages)
- data:image/* (images only)

// Blocked protocols
- javascript:  (XSS prevention)
- vbscript:    (Legacy attack vector)
- file://      (Local file access)
- data:        (except images)
```

### Phishing Protection

Pattern-based detection for common phishing domains:
- Typosquatting detection
- Suspicious TLD blocking
- Domain reputation (planned)

## 🔑 Credential Security

### Encryption

All passwords are encrypted using **AES-256-GCM**:

```javascript
{
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  authTagLength: 16
}
```

### Secure Password Generation

Uses **cryptographically secure random** generation with rejection sampling to avoid modulo bias.

## 📜 Content Security Policy

CSP headers are applied to all internal pages:

```
default-src 'self' horizon:;
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https:;
```

## 🚫 Blocked Features

| Feature | Status | Reason |
|---------|--------|--------|
| Remote module | ❌ Disabled | Security risk |
| Node integration | ❌ Disabled | XSS protection |
| Web security bypass | ❌ Blocked | CORS protection |
| Insecure content | ❌ Blocked | Mixed content |

## ✅ Security Checklist

### For Users

- [ ] Keep Horizon updated
- [ ] Use strong, unique passwords
- [ ] Enable 2FA where possible
- [ ] Be cautious of phishing attempts
- [ ] Review extension permissions

### For Developers

- [ ] Never enable `nodeIntegration`
- [ ] Always use `contextIsolation`
- [ ] Validate all IPC inputs
- [ ] Sanitize URLs before navigation
- [ ] Use preload scripts for IPC
- [ ] Run `npm audit` regularly
- [ ] Review dependency updates

## 🐛 Reporting Vulnerabilities

Found a security issue? Please report it:

1. **GitHub Issues**: Use the `security` label
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📚 Resources

- [Electron Security Checklist](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Guidelines](https://owasp.org/)
- [Chromium Security](https://www.chromium.org/Home/chromium-security)

---

Security is everyone's responsibility. 🔐

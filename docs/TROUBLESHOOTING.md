# Troubleshooting Guide

This document provides solutions for common issues when building and running Horizon Browser.

## Table of Contents

- [Windows Build Issues](#windows-build-issues)
  - [NuGet Not Installed](#nuget-not-installed)
  - [CMake Warning CMP0175](#cmake-warning-cmp0175)
  - [Error MSB3073 / Exit Code 9009](#error-msb3073--exit-code-9009)
- [General Issues](#general-issues)
  - [Build Failures After Updates](#build-failures-after-updates)

---

## Windows Build Issues

### NuGet Not Installed

**Error Message:**
```
Nuget is not installed! The flutter_inappwebview_windows plugin requires it.
Check https://inappwebview.dev/docs/intro#setup-windows
```

**Cause:**
The `flutter_inappwebview_windows` plugin requires NuGet CLI to download its native dependencies (WebView2, WIL, nlohmann.json). If NuGet is not installed or not in your system PATH, the build fails.

**Solution:**

#### Option 1: Run the Setup Script (Recommended)

From PowerShell in the repository root:

```powershell
.\scripts\setup-windows.ps1
```

This script automatically:
- Downloads and installs NuGet CLI
- Adds it to your user PATH
- Verifies WebView2 Runtime availability

#### Option 2: Install via winget

```powershell
winget install Microsoft.NuGet
```

Restart your terminal after installation.

#### Option 3: Manual Installation

1. **Download NuGet CLI:**
   ```powershell
   # Create NuGet directory
   New-Item -ItemType Directory -Path "$env:LOCALAPPDATA\NuGet" -Force
   
   # Download NuGet executable
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" `
     -OutFile "$env:LOCALAPPDATA\NuGet\nuget.exe"
   ```

2. **Add to PATH permanently:**
   ```powershell
   [Environment]::SetEnvironmentVariable(
     "Path",
     "$env:Path;$env:LOCALAPPDATA\NuGet",
     [EnvironmentVariableTarget]::User
   )
   ```

3. **Restart your terminal/IDE**

4. **Verify installation:**
   ```powershell
   nuget help
   ```

---

### CMake Warning CMP0175

**Warning Message:**
```
CMake Warning (dev) at flutter/ephemeral/.plugin_symlinks/flutter_inappwebview_windows/windows/CMakeLists.txt:31
  Policy CMP0175 is not set: add_custom_command() rejects invalid arguments.
```

**Cause:**
This is a developer warning from CMake about deprecated behavior in the flutter_inappwebview plugin's CMakeLists.txt. It does not prevent the build from succeeding.

**Solution:**
This warning can be safely ignored. It's an upstream issue in the flutter_inappwebview plugin. The warning does not affect functionality.

To suppress the warning during builds, you can add `-Wno-dev` to CMake options, but this is generally not necessary.

---

### Error MSB3073 / Exit Code 9009

**Error Message:**
```
error MSB3073: The command "...NUGET-NOTFOUND install Microsoft.Windows.ImplementationLibrary...
error MSB3073: ..." exited with code 9009.
```

**Cause:**
This error occurs when:
1. NuGet is not installed (most common)
2. NuGet is installed but not in the system PATH
3. NuGet was installed in a new terminal but the current terminal doesn't have the updated PATH

**Solution:**

1. **Ensure NuGet is installed** (see [NuGet Not Installed](#nuget-not-installed) above)

2. **Verify NuGet is in PATH:**
   ```powershell
   Get-Command nuget
   ```
   
   If this fails, NuGet isn't in your current PATH.

3. **Add NuGet to current session temporarily:**
   ```powershell
   # If installed via the setup script:
   $env:Path += ";$env:LOCALAPPDATA\NuGet"
   
   # If installed via winget to Program Files:
   $env:Path += ";$env:ProgramFiles\NuGet"
   ```

4. **Clean and rebuild:**
   ```powershell
   flutter clean
   flutter pub get
   flutter run -d windows
   ```

5. **Restart your IDE/terminal** to pick up PATH changes made by the installer

---

## General Issues

### Build Failures After Updates

**Problem:**
Build fails after updating Flutter, dependencies, or pulling new code.

**Solution:**

Perform a clean rebuild:

```bash
# Clean all build artifacts
flutter clean

# Get fresh dependencies
flutter pub get

# Regenerate generated code (if using build_runner)
flutter pub run build_runner build --delete-conflicting-outputs

# Build again
flutter run -d windows  # or your target platform
```

For Windows specifically, if issues persist:

```powershell
# Remove the Windows build cache completely
Remove-Item -Recurse -Force build\windows -ErrorAction SilentlyContinue

# Rebuild
flutter build windows
```

---

## Getting Help

If the above solutions don't resolve your issue:

1. **Check existing issues:** Search the [GitHub Issues](https://github.com/GitGoneWild/Horizon/issues)
2. **Flutter doctor:** Run `flutter doctor -v` and include the output when reporting issues
3. **Verbose build:** Run `flutter run -d windows -v` for detailed build logs
4. **Open an issue:** Include:
   - Your operating system and version
   - Flutter version (`flutter --version`)
   - Full error message
   - Steps you've tried

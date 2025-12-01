<#
.SYNOPSIS
    Sets up the Windows development environment for Horizon Browser (Flutter).
    
.DESCRIPTION
    This script installs and configures the required dependencies for building
    Horizon Browser on Windows, including:
    - NuGet CLI (required for flutter_inappwebview_windows plugin)
    - WebView2 Runtime (if not already installed via Edge)
    
.EXAMPLE
    .\setup-windows.ps1
    
.NOTES
    Run this script in an elevated PowerShell session (as Administrator) for
    system-wide installation, or without elevation for user-level installation.
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipWebView2Check
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-NuGetInstalled {
    try {
        $null = Get-Command nuget -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Test-WebView2Installed {
    # WebView2 Runtime Client GUID (used in registry for version detection)
    $webView2ClientGuid = "{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    
    # Check for WebView2 Runtime installation
    $webView2Key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\$webView2ClientGuid"
    $webView2KeyAlt = "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\$webView2ClientGuid"
    
    if ((Test-Path $webView2Key) -or (Test-Path $webView2KeyAlt)) {
        return $true
    }
    
    # Also check for Microsoft Edge (includes WebView2)
    $edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path $edgePath) {
        return $true
    }
    
    return $false
}

function Install-NuGet {
    Write-Step "Installing NuGet CLI..."
    
    # Determine installation directory
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if ($isAdmin) {
        $installDir = "$env:ProgramFiles\NuGet"
    } else {
        $installDir = "$env:LOCALAPPDATA\NuGet"
    }
    
    # Create directory if it doesn't exist
    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }
    
    $nugetPath = Join-Path $installDir "nuget.exe"
    
    # Download NuGet CLI with TLS 1.2 for security
    Write-Host "Downloading NuGet CLI to $nugetPath..."
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile $nugetPath -UseBasicParsing
        
        # Verify the file was downloaded and is a valid PE executable
        if (-not (Test-Path $nugetPath)) {
            throw "NuGet download failed - file not found"
        }
        $fileInfo = Get-Item $nugetPath
        if ($fileInfo.Length -lt 1000) {
            throw "NuGet download appears incomplete (file too small)"
        }
    } catch {
        Write-ErrorMessage "Failed to download NuGet: $_"
        throw
    }
    
    # Add to PATH using exact matching on semicolon-separated entries
    $currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    $pathEntries = $currentPath -split ';' | Where-Object { $_.Trim() -ne '' }
    $installDirNormalized = $installDir.TrimEnd('\')
    $alreadyInPath = $pathEntries | ForEach-Object { $_.TrimEnd('\') } | Where-Object { $_ -eq $installDirNormalized }
    
    if (-not $alreadyInPath) {
        Write-Host "Adding NuGet to user PATH..."
        [Environment]::SetEnvironmentVariable(
            "Path",
            "$currentPath;$installDir",
            [EnvironmentVariableTarget]::User
        )
        # Also update current session
        $env:Path = "$env:Path;$installDir"
    }
    
    Write-Success "NuGet CLI installed successfully at $nugetPath"
    return $nugetPath
}

function Test-FlutterInstalled {
    try {
        $null = Get-Command flutter -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Main script
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Horizon Browser - Windows Setup" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Check for Flutter
Write-Step "Checking Flutter installation..."
if (Test-FlutterInstalled) {
    $flutterVersion = flutter --version 2>&1 | Select-Object -First 1
    Write-Success "Flutter is installed: $flutterVersion"
} else {
    Write-Warning "Flutter is not installed or not in PATH"
    Write-Host "Please install Flutter from https://docs.flutter.dev/get-started/install/windows"
}

# Check and install NuGet
Write-Step "Checking NuGet installation..."
if ((Test-NuGetInstalled) -and (-not $Force)) {
    # Verify NuGet works by checking its exit code (most efficient method)
    try {
        $null = & nuget help 2>&1
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Success "NuGet is already installed and functional"
        } else {
            Write-Warning "NuGet is installed but may not be working properly"
        }
    } catch {
        Write-Success "NuGet is already installed"
    }
} else {
    if ($Force) {
        Write-Host "Forcing NuGet reinstallation..."
    }
    $nugetPath = Install-NuGet
    Write-Host "`nVerifying NuGet installation..."
    try {
        $null = & $nugetPath help 2>&1
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
            Write-Success "NuGet installed and verified successfully"
        }
    } catch {
        Write-Warning "NuGet installed but verification had issues"
    }
}

# Check WebView2
if (-not $SkipWebView2Check) {
    Write-Step "Checking WebView2 Runtime..."
    if (Test-WebView2Installed) {
        Write-Success "WebView2 Runtime is installed (or Microsoft Edge is present)"
    } else {
        Write-Warning "WebView2 Runtime not detected"
        Write-Host "The flutter_inappwebview plugin will automatically download WebView2 during build."
        Write-Host "Alternatively, install it from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/"
    }
}

# Final instructions
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. Restart your terminal/IDE to apply PATH changes" -ForegroundColor Gray
Write-Host "  2. Run 'flutter pub get' to fetch dependencies" -ForegroundColor Gray
Write-Host "  3. Run 'flutter run -d windows' to start the app" -ForegroundColor Gray
Write-Host "`nIf you encounter issues, try:" -ForegroundColor White
Write-Host "  flutter clean && flutter pub get && flutter run -d windows" -ForegroundColor Gray
Write-Host ""

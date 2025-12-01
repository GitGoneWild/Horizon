/**
 * @file Build script for renderer resources
 * @description Copies and prepares renderer files for production
 */

'use strict';

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/renderer');
const distDir = path.join(__dirname, '../dist/renderer');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Building renderer resources...');

// Copy HTML files
const htmlFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(
    path.join(srcDir, file),
    path.join(distDir, file)
  );
  console.log(`  Copied: ${file}`);
});

// Copy styles
const stylesDir = path.join(srcDir, 'styles');
const distStylesDir = path.join(distDir, 'styles');
if (fs.existsSync(stylesDir)) {
  if (!fs.existsSync(distStylesDir)) {
    fs.mkdirSync(distStylesDir, { recursive: true });
  }
  const styleFiles = fs.readdirSync(stylesDir);
  styleFiles.forEach(file => {
    fs.copyFileSync(
      path.join(stylesDir, file),
      path.join(distStylesDir, file)
    );
    console.log(`  Copied: styles/${file}`);
  });
}

// Copy scripts
const scriptsDir = path.join(srcDir, 'scripts');
const distScriptsDir = path.join(distDir, 'scripts');
if (fs.existsSync(scriptsDir)) {
  if (!fs.existsSync(distScriptsDir)) {
    fs.mkdirSync(distScriptsDir, { recursive: true });
  }
  const scriptFiles = fs.readdirSync(scriptsDir);
  scriptFiles.forEach(file => {
    fs.copyFileSync(
      path.join(scriptsDir, file),
      path.join(distScriptsDir, file)
    );
    console.log(`  Copied: scripts/${file}`);
  });
}

console.log('Renderer build complete!');

#!/bin/bash

# DataDrop Chrome Extension Build Script
set -e

echo "🔧 Building DataDrop Chrome Extension..."

# Variables
BUILD_DIR="build"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="datadrop-minimal-${TIMESTAMP}.zip"

# Create build directory
mkdir -p "$BUILD_DIR"

# Clean previous builds
rm -f "$BUILD_DIR"/*.zip

echo "📦 Creating extension package..."

# Create the ZIP package with only essential files
zip -r "$BUILD_DIR/$PACKAGE_NAME" \
  manifest.json \
  background.js \
  popup.html \
  popup.css \
  popup.js

echo "✅ Extension packaged as: $BUILD_DIR/$PACKAGE_NAME"

# Show package size
PACKAGE_SIZE=$(du -h "$BUILD_DIR/$PACKAGE_NAME" | cut -f1)
echo "📏 Package size: $PACKAGE_SIZE"

# Display package contents
echo ""
echo "📋 Package contents:"
unzip -l "$BUILD_DIR/$PACKAGE_NAME"

echo ""
echo "🎉 Build complete!"
echo ""
echo "📥 To install for development:"
echo "1. Open Chrome → chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' → Select this folder"
echo ""
echo "🌐 For Chrome Web Store:"
echo "1. Upload: $BUILD_DIR/$PACKAGE_NAME"
echo "2. Complete store listing"
echo "3. Submit for review"
echo ""
echo "🔍 Test the extension:"
echo "1. Visit a website with downloadable files"
echo "2. Create a workflow in the popup"
echo "3. Map the current site to the workflow"
echo "4. Download a file and check processing"

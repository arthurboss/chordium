#!/usr/bin/env bash
set -e

echo "=== Render Build Debug Info ==="
pwd
echo "Node version: $(node -v)"
echo "Environment variables (filtered):"
echo "  PUPPETEER_EXECUTABLE_PATH: $PUPPETEER_EXECUTABLE_PATH"
echo "  PATH: $PATH"
echo "  NODE_ENV: $NODE_ENV"
echo "==============================="

echo "==> Installing dependencies..."
npm install

echo "==> Forcing Puppeteer to download Chrome..."
npx puppeteer browsers install chrome

echo "🔎 Listing entire Puppeteer cache directory..."
ls -lR /opt/render/.cache/puppeteer || echo "Puppeteer cache directory not found!"

echo "🔎 Checking Puppeteer cache folder..."


echo "==> Building backend..."
npm run build

echo "==> Build script completed successfully." 
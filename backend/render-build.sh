#!/usr/bin/env bash
set -e

echo "==> Installing dependencies..."
npm install

echo "==> Forcing Puppeteer to download Chrome..."
npx puppeteer browsers install chrome

echo "🔎 Listing entire Puppeteer cache directory..."
ls -lR /opt/render/.cache/puppeteer || echo "Puppeteer cache directory not found!"

echo "🔎 Checking Puppeteer cache folder..."
ls -l /opt/render/.cache/puppeteer/chrome/linux-138.0.7204.94/chrome-linux64 || echo "Chrome folder not found!"

echo "==> Building backend..."
npm run build

echo "==> Build script completed successfully." 
#!/usr/bin/env bash
set -e

echo "==> Installing dependencies..."
npm install

echo "==> Forcing Puppeteer to download Chrome..."
npx puppeteer browsers install chrome

echo "==> Building backend..."
npm run build

echo "==> Build script completed successfully." 
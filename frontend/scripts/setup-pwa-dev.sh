#!/bin/bash

# Setup script for PWA development
# This script generates SSL certificates and provides instructions for PWA development

echo "🎯 Setting up PWA development environment..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed. Installing..."
    brew install mkcert
    mkcert -install
fi

# Check if mkcert certificates exist
if [ ! -f "../backend/localhost+2-key.pem" ] || [ ! -f "../backend/localhost+2.pem" ]; then
    echo "📜 Generating mkcert certificates..."
    cd ../backend
    mkcert localhost 127.0.0.1 ::1
    cd ../frontend
    echo "✅ mkcert certificates generated successfully!"
else
    echo "✅ mkcert certificates already exist"
fi

echo ""
echo "🚀 PWA Development Workflow:"
echo ""
echo "1. For general development (HTTP, fast hot reload):"
echo "   npm run dev"
echo ""
echo "2. For PWA development (HTTPS, full PWA features):"
echo "   npm run dev:pwa"
echo ""
echo "3. mkcert certificates are automatically trusted!"
echo "   No manual certificate trust needed."
echo ""
echo "4. Access your app:"
echo "   - General dev: http://localhost:8080"
echo "   - PWA dev: https://localhost:8080"
echo ""
echo "💡 Tips:"
echo "   - Use 'npm run dev' for regular development"
echo "   - Use 'npm run dev:pwa' when testing PWA features"
echo "   - Both modes have hot reload and PWA plugin enabled"
echo "   - Backend runs on HTTP (frontend proxies to it)"

# Public Directory

This directory contains static files served by the main Chordium application.

## Current Files

- `robots.txt` - SEO crawler instructions

## Static Assets Location

**PWA and favicon assets have been moved to an external repository:**

🔗 **External Repository**: [chordium-static](https://github.com/arthurboss/chordium-static)  
🌐 **Public URL**: https://arthurboss.github.io/chordium-static/

### Moved Files

The following files are now served from the external repository:

- `manifest.json` - PWA manifest
- `favicon.ico` - Browser favicon
- `favicon-*.png` - Various favicon sizes (16x16, 32x32, 48x48, 180x180, 192x192, 512x512)
- `icon-maskable-512.png` - PWA maskable icon

### Why External?

These assets are hosted separately to avoid Vercel Authentication conflicts. The external repository serves them publicly via GitHub Pages, ensuring PWA functionality works correctly while keeping the main application secure.

## Adding New Static Files

- **App-specific files** (like `robots.txt`): Add to this directory
- **PWA/favicon assets**: Add to the [chordium-static](https://github.com/arthurboss/chordium-static) repository


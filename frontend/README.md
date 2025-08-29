# Chordium Frontend

This project supports both general development and PWA development modes with hot reload in both cases.



## Development Modes

### 1. General Development (HTTP)

```bash
npm run dev
```
- **URL**: http://localhost:8080
- **Features**: Fast hot reload, HTTP, simple setup
- **Use for**: Regular development, UI changes, general testing

### 2. PWA Development (HTTPS)

#### One-time Setup for PWA development

```bash
npm run setup:pwa
```

#### Regular Workflow

```bash
npm run dev:pwa
```
- **URL**: https://localhost:8080
- **Features**: Full PWA capabilities, service workers, offline functionality
- **Use for**: PWA feature testing, service worker development, offline testing

### SSL Certificate Setup

Chordium uses **mkcert** for local HTTPS development:

- ✅ **No manual certificate trust needed**
- ✅ **Automatically trusted by all browsers**
- ✅ **Industry-standard approach**
- ✅ **Works across Chrome, Firefox, Safari, Edge**

The setup script automatically installs mkcert and generates trusted certificates.

### Workflow Tips

- **Start with HTTP mode** (`npm run dev`) for general development
- **Switch to HTTPS mode** (`npm run dev:pwa`) when testing PWA features
- **Both modes have hot reload** and PWA plugin enabled
- **Backend runs on HTTP** - frontend proxies API calls to it
- **Production**: Both frontend and backend are HTTPS (automatic with Vercel + Render)

### Environment Variables

```env
VITE_HTTPS_ENABLED=true  # Enable HTTPS for PWA development
VITE_API_URL=http://localhost:3001  # Backend API URL
```

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

## Testing

```bash
npm run test
npm run test:watch
```

## PWA Features

- Service Worker for offline functionality
- App manifest for installability
- Caching strategies for performance
- Offline fallback pages
- Background sync capabilities

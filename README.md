<p align="center">
  <img src="frontend/public/logo-256.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

<p align="center">
  <a href="https://chordium.vercel.app"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live Demo"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

The distraction-free way to find, read, and play guitar chords, right in your browser.

## 🎬 Demo

![Chordium Demo](./assets/chordium-demo.gif)

🎵 **[Try it live](https://chordium.vercel.app)**

## 🎯 Features

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter:

- **Install-less App (PWA)** - Works offline and installs like a native app
- **Clean Interface** - Distraction-free chord viewing experience
- **Smart Search** - Search by artist, song title, or lyrics. Voice-enabled for hands-free searching
- **Transpose & Capo** - Shift chords to any key or capo position on the fly
- **Auto-scrolling** - Practice at your own pace with speed controls
- **Dark Mode** - Light, dark, and system theme options
- **Mobile-friendly** - Learn on-the-go with responsive design
- **File Upload** - Import your own chord sheets with metadata extraction
- **Works Offline** - Install as a native app, fully functional without internet
- **Transpose & Capo** - Shift chords to any key or capo position on the fly
- **Fullscreen Mode** - Distraction-free fullscreen reading with translated lyrics side-by-side
- **Auto-scrolling** - Practice at your own pace with speed controls

## 🎸 Jam Sessions

Scan a QR code or tap a link to instantly share the exact chord sheet you're viewing — no account, no server round-trip, ready to play the moment it opens.

## 💻 Tech Stack

### Frontend

- **React** + **TypeScript** - Modern UI with type safety
- **Vite** - Fast build tool and development server
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible components
- **React Router** - Client-side navigation
- **@tanstack/react-query** - Data fetching and state management

### Backend

- **Vercel Serverless Functions** - API endpoints in `frontend/api/`
- **Neon** - PostgreSQL database (via Vercel Postgres)
- **@sparticuz/chromium** + **Puppeteer** - Headless scraping for chord sheets

### Development

- **Turborepo** - High-performance build system for monorepos
- **npm Workspaces** - Monorepo dependency management
- **@chordium/types** - Shared TypeScript types published to npm
- **Vitest** + **Jest** + **Cypress** - Comprehensive testing
- **OpenAI Whisper** - On-device voice search ([original](https://github.com/openai/whisper), [ONNX model](https://huggingface.co/onnx-community/whisper-base))

## 📚 Documentation

| Topic                                                          | Description                                        |
| -------------------------------------------------------------- | -------------------------------------------------- |
| [Getting Started](./docs/getting-started.md)                | Installation, setup, and development commands      |
| [Testing](./docs/testing.md)                                | Testing frameworks, running tests, and guidelines  |
| [Error Handling](./docs/error-handling.md)                  | Error recovery and user-friendly error messages    |
| [Project Structure](./docs/project-structure.md)            | Codebase organization and architecture             |
| [Deployment](./docs/deployment.md)                          | Frontend and backend deployment guides             |
| [Contributing](./CONTRIBUTING.md)                           | How to contribute to the project                   |
| [Backend API](./backend/README.md)                          | Backend documentation and API reference            |
| [Search Guide](./docs/search-guide.md)                      | Smart search functionality details                 |
| [Monorepo](./docs/MONOREPO.md)                              | Monorepo architecture and workspace management     |
| [Cache Architecture](./docs/cache-architecture.md)          | Frontend caching system design and implementation  |
| [Build Optimizations](./docs/build-optimizations.md)        | Performance optimizations and bundle configuration |
| [PWA Development](./docs/getting-started.md#pwa-development) | PWA setup, development workflow, and features      |
| [Technical Decisions](./docs/technical-decisions/README.md) | Key architectural decisions and rationale          |
| [Offline Translation](./docs/offline-functionality.md#song-lyrics-and-translation) | Translation without internet connection |

## 🚀 Quick Start

```sh
git clone https://github.com/arthurboss/chordium.git
cd chordium
npm install
npm run dev
```

See [Getting Started](./docs/getting-started.md) for full setup and commands.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

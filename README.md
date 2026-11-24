<p align="center">
  <img src="frontend/public/logo-256.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

<p align="center">
  <a href="https://chordium.vercel.app"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live Demo"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

The distraction-free way to find, read, and play guitar chords in your browser, as a PWA, or on Android.

## 🎬 Demo

![Chordium Demo](./assets/chordium-demo.gif)

🎵 **[Try it live](https://chordium.vercel.app)**

Android APK: **[Releases](https://github.com/arthurboss/chordium/releases/latest)**

## 🎯 Features

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter:

- **Web, PWA, and Android** - Use it in the browser, install it as a PWA, or sideload the Android app
- **Offline library** - Saved chord sheets work without a connection
- **Smart search** - Search by artist, song title, or lyrics, including voice search
- **Transpose and capo** - Shift chords to any key or capo position
- **Auto-scroll** - Practice at your own pace with speed controls
- **Dark mode** - Light, dark, and system theme options
- **Import and backup** - Upload chord sheets or restore a gzipped backup
- **Fullscreen mode** - Distraction-free reading with translated lyrics

## 🎸 Jam Sessions

Scan a QR code or tap a link to instantly share the exact chord sheet you're viewing. No account, no server round-trip. On Android, shared song links open in the app.

## <img src="https://cdn.simpleicons.org/android/3DDC84" alt="Android" width="22" height="22" /> Android

The Android app packages the same frontend with its assets on the device, so saved chord sheets work offline. Download the signed APK from [Releases](https://github.com/arthurboss/chordium/releases). Requires Android 7.0 or newer.

Sideloaded builds do not update automatically. Download new APKs from [Releases](https://github.com/arthurboss/chordium/releases).

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

### Android

- **Capacitor** - Native shell around the web app
- **Gradle** - APK and AAB builds in `android/`

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
| [Android Release](./docs/android-release.md)                 | Android builds, signing, and release checklist     |
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

## 🏷️ Versioning & Releases

This project follows semantic versioning ([semver](https://semver.org/)):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

Each version bump is tagged in git as `v<major>.<minor>.<patch>` (e.g., `v0.5.0`) and published as a GitHub Release. See [Releases](../../releases) for the full changelog.

Android uses the same version. `versionName` is the package version and `versionCode` is `major * 1000000 + minor * 1000 + patch`.

**For developers:** When you merge a version bump PR, create a corresponding git tag:
```bash
git tag v<major>.<minor>.<patch> <commit-hash>
git push origin v<major>.<minor>.<patch>
```

Then add release notes on GitHub describing what changed in that version.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

<p align="center">
  <img src="https://arthurboss.github.io/chordium-static/favicon-180.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

A modern, minimalist chord viewer app for beginner guitar players and hobbyists.

Chordium focuses on providing a distraction-free experience for learning and practicing guitar chords.

## 🎬 Demo

![Chordium Demo](./assets/chordium-demo.gif)

_Experience Chordium's clean interface, smart search, and intuitive chord display in action._

🎵 **[Try it live](https://chordium.vercel.app)** | **Backend:** <img src="https://img.shields.io/uptimerobot/status/m801354672-a38337401e6a3b2dc13e16b9" alt="Uptime Robot status" style="vertical-align: middle;" />

## 🎯 Features

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter:

- **Install-less App (PWA)** - Works offline and installs like a native app
- **Clean Interface** - Distraction-free chord viewing experience
- **Smart Search** - Find songs and artists with intelligent caching
- **Chord Diagrams** - Clear fingering positions for each chord
- **Auto-scrolling** - Practice at your own pace with speed controls
- **Mobile-friendly** - Learn on-the-go with responsive design
- **File Upload** - Import your own chord sheets with metadata extraction

## 💻 Tech Stack

### Frontend

- **React** + **TypeScript** - Modern UI with type safety
- **Vite** - Fast build tool and development server
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible components
- **React Router** - Client-side navigation
- **@tanstack/react-query** - Data fetching and state management

### Backend

- **Node.js/Express** + **TypeScript** - RESTful API server
- **Supabase** - PostgreSQL database and authentication
- **AWS S3** - Cloud storage for cached data
- **Puppeteer** + **Cheerio** - Web scraping and HTML parsing

### Development

- **Turborepo** - High-performance build system for monorepos
- **npm Workspaces** - Monorepo dependency management
- **@chordium/types** - Shared TypeScript types published to npm
- **Vitest** + **Jest** + **Cypress** - Comprehensive testing

## 📚 Documentation

| Topic                                                          | Description                                        |
| -------------------------------------------------------------- | -------------------------------------------------- |
| [🚀 Getting Started](./docs/getting-started.md)                | Installation, setup, and development commands      |
| [🧪 Testing](./docs/testing.md)                                | Testing frameworks, running tests, and guidelines  |
| [🛡️ Error Handling](./docs/error-handling.md)                  | Error recovery and user-friendly error messages    |
| [🏗️ Project Structure](./docs/project-structure.md)            | Codebase organization and architecture             |
| [🚀 Deployment](./docs/deployment.md)                          | Frontend and backend deployment guides             |
| [🤝 Contributing](./CONTRIBUTING.md)                           | How to contribute to the project                   |
| [📖 Backend API](./backend/README.md)                          | Backend documentation and API reference            |
| [🔍 Search Guide](./docs/search-guide.md)                      | Smart search functionality details                 |
| [🏢 Monorepo](./docs/MONOREPO.md)                              | Monorepo architecture and workspace management     |
| [🗄️ Cache Architecture](./docs/cache-architecture.md)          | Frontend caching system design and implementation  |
| [⚡ Build Optimizations](./docs/build-optimizations.md)        | Performance optimizations and bundle configuration |
| [📱 PWA Development](./docs/getting-started.md#pwa-development) | PWA setup, development workflow, and features      |
| [🧠 Technical Decisions](./docs/technical-decisions/README.md) | Key architectural decisions and rationale          |

## 🚀 Quick Start

```sh
# Clone and install
git clone https://github.com/arthurboss/chordium.git
cd chordium
npm install
```

See [Getting Started](./docs/getting-started.md) for development setup and commands.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

<p align="center">
  <img src="./frontend/public/favicon-180.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

A modern, minimalist chord viewer app for beginner guitar players and hobbyists.

Chordium focuses on providing a distraction-free experience for learning and practicing guitar chords.

## 🎬 Demo

![Chordium Demo](./assets/chordium-demo.gif)

_Experience Chordium's clean interface, smart search, and intuitive chord display in action._

> ⚠️ Frontend deployment in progress  
> ✅ Backend is live at [chordium-backend.onrender.com](https://chordium-backend.onrender.com)

## 🎯 Features

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter:

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
| [🏗️ Project Structure](./docs/project-structure.md)            | Codebase organization and architecture             |
| [🚀 Deployment](./docs/deployment.md)                          | Frontend and backend deployment guides             |
| [🤝 Contributing](./CONTRIBUTING.md)                           | How to contribute to the project                   |
| [📖 Backend API](./backend/README.md)                          | Backend documentation and API reference            |
| [🔍 Search Guide](./docs/search-guide.md)                      | Smart search functionality details                 |
| [🏢 Monorepo](./docs/MONOREPO.md)                              | Monorepo architecture and workspace management     |
| [🗄️ Cache Architecture](./docs/cache-architecture.md)          | Frontend caching system design and implementation  |
| [⚡ Build Optimizations](./docs/build-optimizations.md)        | Performance optimizations and bundle configuration |
| [🧠 Technical Decisions](./docs/technical-decisions/README.md) | Key architectural decisions and rationale          |

## 🚀 Quick Start

```sh
# Clone and install
git clone https://github.com/arthurboss/chordium.git
cd chordium
npm install

# Start development servers
npm run dev
```

Visit `http://localhost:8080` for the frontend and `http://localhost:3001` for the backend API.

## 📦 @chordium/types Package

Chordium publishes a shared TypeScript types package to npm for type safety across the entire monorepo:

- **Package**: [`@chordium/types`](https://www.npmjs.com/package/@chordium/types)
- **Purpose**: Shared type definitions for API contracts, data models, and interfaces
- **Usage**: Currently used by frontend; backend still uses local types due to Render deployment constraints
- **Build**: Automatically built and versioned with Turborepo dependency management

```sh
# Install in your project
npm install @chordium/types
```

```typescript
// Import shared types
import { Song, Artist, ChordSheet } from "@chordium/types";
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

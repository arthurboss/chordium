<p align="center">
  <img src="./frontend/public/favicon-180.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

A modern, minimalist chord viewer app for beginner guitar players and hobbyists.

Chordium focuses on providing a distraction-free experience for learning and practicing guitar chords.

## 🎬 Demo

![Chordium Demo](./assets/chordium-demo.gif)

*Experience Chordium's clean interface, smart search, and intuitive chord display in action.*

> ⚠️ Frontend deployment in progress  
> ✅ Backend is live at [chordium-backend.onrender.com](https://chordium-backend.onrender.com)


## 🎯 About

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter. The app features:

- Clean, distraction-free interface
- Chord diagrams with clear fingering positions
- Song chord sheet display with auto-scrolling
- Speed control for practice at your own pace
- Mobile-friendly design for on-the-go learning
- Smart metadata extraction from uploaded chord sheets
- [Smart search functionality](./docs/search-guide.md) with instant filtering and intelligent caching

## 💻 Tech Stack

This project is built with modern web technologies:

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **React Router** - Client-side routing

### Backend
- **Node.js/Express** - API server
- **Supabase** - Database
- **Puppeteer** - Web scraping

For detailed backend documentation, see the [Backend README](./backend/README.md).

## 🔧 Build Optimizations

Chordium includes several optimizations for production builds:

- **Tree Shaking** - Eliminates unused code from the bundle
- **Code Splitting** - Loads JavaScript only when needed
- **Test Attribute Stripping** - Removes testing attributes in production
- **Bundle Analysis** - Visualizes bundle size with rollup-plugin-visualizer

For more details, see the [build optimization docs](./docs/build-optimizations.md).

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

```sh
# Clone the repository
git clone https://github.com/arthurboss/chordium.git

# Navigate to the project directory
cd chordium

# Install all dependencies (npm workspaces handle this automatically)
npm install

# Start both frontend and backend development servers
npm run dev
```

The frontend will be available at http://localhost:8080 and the backend at http://localhost:3001.

### Development Commands

```sh
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:fe

# Start only backend
npm run dev:be

# Build both frontend and backend
npm run build

# Run tests for both
npm run test

# Run tests in watch mode
npm run test:watch

# Lint both frontend and backend
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check for duplicate fixtures
npm run check:fixtures
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for deployment on Vercel:

- **Framework**: Vite/React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `frontend`

For detailed deployment instructions, see [docs/deployment.md](./docs/deployment.md).

### Backend Deployment (Render)

The backend is configured for deployment on Render:

- **Runtime**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

For detailed backend deployment instructions, see [backend/README.md](./backend/README.md).

### Architecture

```
Frontend (Vercel) → Backend (Render) → Database (Supabase) + Storage (AWS S3)
```

## 🧪 Testing

### Running Tests

```sh
# Run all tests (frontend + backend)
npm run test

# Run only frontend tests
npm run test:fe

# Run only backend tests
npm run test:be

# Run e2e tests
cd frontend && npm run test:e2e
```

### Important Notes

- **Song Search Tests**: The `cypress/e2e/search/song-search.cy.ts` tests are excluded from GitHub Actions because they use real web scraping from external sites. These should only be run locally to avoid unnecessary load on external services.
- **Cache Tests**: Cache-specific e2e tests are run separately in CI to isolate their concerns.
- **GitHub Actions**: Only non-scraping, non-cache tests run automatically on GitHub to keep CI fast and avoid external dependencies.

## 🏗️ Project Structure

```
chordium/
├── frontend/           # React/Vite frontend application
│   ├── src/           # Frontend source code
│   ├── public/        # Static assets
│   ├── dist/          # Build output
│   └── cypress/       # E2E tests
├── backend/           # Node.js/Express backend API
│   ├── controllers/   # API route handlers
│   ├── services/      # Business logic services
│   ├── utils/         # Backend utilities
│   └── tests/         # Backend tests
├── shared/            # Shared code between workspaces
│   ├── types/         # Shared TypeScript types
│   └── fixtures/      # Shared test fixtures
├── docs/              # Project documentation
└── scripts/           # Build and utility scripts
```

For detailed information about the monorepo architecture, see [MONOREPO.md](./docs/MONOREPO.md).

## ⚡ Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:fe           # Start only frontend
npm run dev:be           # Start only backend

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:fe          # Run only frontend tests
npm run test:be          # Run only backend tests

# Code Quality
npm run lint             # Lint all code
npm run lint:fix         # Auto-fix linting issues
npm run check:fixtures   # Check for duplicate fixtures

# Building
npm run build            # Build both frontend and backend
npm run build:fe         # Build only frontend
npm run build:be         # Build only backend
```

## 🤝 Contributing

Chordium welcomes community contributions while maintaining its competitive edge in core functionality.

### ✅ **Open for Contributions**

- **Frontend components** - UI/UX improvements, accessibility enhancements
- **Documentation** - Guides, examples, API documentation
- **Testing** - Additional test cases, chord sheet fixtures
- **Developer tooling** - Build scripts, linting rules, CI/CD improvements
- **Shared utilities** - Non-core backend utilities
- **Bug fixes** - Non-core functionality issues
- **Internationalization** - Translations, locale support

### 🔒 **Proprietary Areas**

- **Web scraping services** - Core data extraction algorithms
- **Business logic** - Proprietary processing methods
- **API rate limiting** - Anti-abuse mechanisms
- **Performance optimizations** - Competitive advantages

### 📋 **Contribution Guidelines**

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide for detailed information about:

- Development setup and workflow
- Code style and guidelines
- Testing requirements
- Pull request process
- Issue reporting

For quick reference:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit your changes with conventional commit messages
6. Push to the branch and open a Pull Request

**Note**: Core scraping and data processing services remain proprietary to maintain the project's competitive advantage and ensure responsible data extraction practices.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 📋 Contributor License Agreement

By contributing to Chordium, you agree that:

- You grant the project maintainers perpetual rights to use your contributions
- Your contributions may be included in both open source and commercial versions
- You retain copyright to your contributions under the project's MIT license

This ensures the project can evolve commercially while maintaining open source benefits.

## Shared Chord Sheet Fixtures

The canonical test chord sheets for both frontend and backend live in [`shared/fixtures/chord-sheet/`](./shared/fixtures/chord-sheet/).

- **Usage:**
  - All tests (frontend and backend) must import chord sheet fixtures from this directory.
  - Do not duplicate or maintain separate chord sheet fixtures elsewhere in the repo.
- **Updating:**
  - To add or update a test chord sheet, edit or add a file in `shared/fixtures/chord-sheet/`.
  - Ensure changes are compatible with all tests that use these fixtures.
- **Why:**
  - This ensures consistency and prevents test drift or outdated data.

If you find chord sheet fixtures elsewhere, please delete them and use the shared source of truth.

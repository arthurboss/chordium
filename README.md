<p align="center">
  <img src="./frontend/public/favicon-180.png" alt="Chordium Logo" height="128">
</p>

<h1 align="center">Chordium</h1>

A modern, minimalist chord viewer app for beginner guitar players and hobbyists. 

Chordium focuses on providing a distraction-free experience for learning and practicing guitar chords.

## 🎯 About

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter. The app features:

- Clean, distraction-free interface
- Chord diagrams with clear fingering positions
- Song chord sheet display with auto-scrolling
- Speed control for practice at your own pace
- Mobile-friendly design for on-the-go learning
- Smart metadata extraction from uploaded chord sheets
- [Smart search functionality](./SEARCH-GUIDE.md) with instant filtering and intelligent caching

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

# Install all dependencies (frontend + backend)
npm run install:all

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

# Lint both frontend and backend
npm run lint
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for deployment on Vercel:

- **Framework**: Vite/React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `frontend`

For detailed frontend deployment instructions, see [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md).

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
│   └── vercel.json    # Vercel configuration
├── backend/           # Node.js/Express backend API
│   ├── src/           # Backend source code
│   ├── routes/        # API routes
│   └── services/      # Business logic
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

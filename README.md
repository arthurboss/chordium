# Chordium 🎸

A modern, minimalist chord viewer app for beginner guitar players and hobbyists. Chordium focuses on providing a distraction-free experience for learning and practicing guitar chords.

## 🎯 About

Chordium is designed with simplicity in mind, helping new guitar players and casual enthusiasts learn songs without visual clutter. The app features:

- Clean, distraction-free interface
- Chord diagrams with clear fingering positions
- Song chord sheet display with auto-scrolling
- Speed control for practice at your own pace
- Mobile-friendly design for on-the-go learning
- Smart metadata extraction from uploaded chord sheets

## 💻 Tech Stack

This project is built with modern web technologies:

### Frontend
- **React** - UI library

### Backend
- **Node.js/Express** - API server
- **Supabase** - Database
- **Puppeteer** - Web scraping

For detailed backend documentation, see the [Backend README](./backend/README.md).
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **React Router** - Client-side routing

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
- npm or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/arthurboss/chordium.git

# Navigate to the project directory
cd chordium

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:8080.

## 🧪 Testing

### Running Tests

```sh
# Run unit tests (backend)
npm run test

# Run all e2e tests locally 
npm run test:e2e

# Run specific e2e test (including scraping-dependent tests)
npm run test:e2e -- --spec "cypress/e2e/search/song-search.cy.ts"

# Run cache-specific e2e tests
npm run test:e2e -- --spec "cypress/e2e/cache/**/*.cy.ts"
```

### Important Notes

- **Song Search Tests**: The `cypress/e2e/search/song-search.cy.ts` tests are excluded from GitHub Actions because they use real web scraping from external sites. These should only be run locally to avoid unnecessary load on external services.
- **Cache Tests**: Cache-specific e2e tests are run separately in CI to isolate their concerns.
- **GitHub Actions**: Only non-scraping, non-cache tests run automatically on GitHub to keep CI fast and avoid external dependencies.

## 🏗️ Project Structure

- `src/components` - UI components, including chord diagrams
- `src/pages` - Main application pages
- `src/data` - Song chord sheets and data
- `src/utils` - Helper functions for chord processing
- `src/hooks` - Custom React hooks

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

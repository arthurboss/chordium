# Contributing to Chordium

Thank you for your interest in contributing to Chordium! This document provides guidelines for contributing to this monorepo project.

## 🎯 Contribution Scope

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

### 📋 **Contributor License Agreement**

By contributing to Chordium, you agree that:

- You grant the project maintainers perpetual rights to use your contributions
- Your contributions may be included in both open source and commercial versions
- You retain copyright to your contributions under the project's MIT license

This ensures the project can evolve commercially while maintaining open source benefits.

## 🏗️ Project Structure

Chordium is a monorepo with the following structure:

```
chordium/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend API
├── packages/          # Shared packages (npm workspaces)
│   └── types/         # @chordium/types - Shared TypeScript types package
├── shared/            # Shared resources
│   └── fixtures/      # Shared test fixtures
├── docs/              # Project documentation
├── scripts/           # Build and utility scripts
└── cypress/           # End-to-end tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm (we use npm workspaces)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chordium

# Install all dependencies (workspaces handle this automatically)
npm install
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Start only frontend
npm run dev:fe

# Start only backend
npm run dev:be
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Individual Test Suites

```bash
# Frontend tests
npm run test:fe

# Backend tests
npm run test:be

# Watch mode for development
npm run test:watch
```

### End-to-End Tests

```bash
# Run Cypress tests
npm run test:e2e
```

## 🔧 Code Quality

### Linting

```bash
# Lint all code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Lint individual workspaces
npm run lint:fe
npm run lint:be
```

### Type Checking

```bash
# Frontend type checking
cd frontend && npm run lint:ts

# Backend type checking
cd backend && npm run lint:ts
```

## 🏗️ Building

```bash
# Build both frontend and backend
npm run build

# Build individual workspaces
npm run build:fe
npm run build:be
```

## 📁 Shared Fixtures

**Important:** Chord sheet fixtures are shared between frontend and backend tests.

- **Location:** `shared/fixtures/chord-sheet/`
- **Usage:** Import directly in tests, don't duplicate
- **Check:** Run `npm run check:fixtures` to ensure no duplicates

## 🎯 Development Guidelines

### Code Standards

**📋 For detailed coding standards, see [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md)**

### Code Style

- Use TypeScript for all new code
- Follow existing ESLint and Prettier configurations
- Write tests for new features
- Use conventional commit messages

### Adding New Features

1. **Frontend Changes:**
   - Add components in `frontend/src/components/`
   - Add hooks in `frontend/src/hooks/`
   - Add utilities in `frontend/src/utils/`
   - Write tests in corresponding `__tests__/` directories

2. **Backend Changes:**
   - Add controllers in `backend/controllers/`
   - Add services in `backend/services/`
   - Add utilities in `backend/utils/`
   - Write tests in `backend/tests/`

3. **Shared Types:**
   - Add shared types in `packages/types/src/`
   - Update the `@chordium/types` package with proper exports
   - Import from `@chordium/types` in both frontend and backend
   - Run `npm run build:types` to build the types package

### Testing Guidelines

- Write unit tests for all new functionality
- Use the existing test utilities and patterns
- Test both success and error cases
- Use descriptive test names

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit with conventional commit messages
6. Push and create a pull request

### Conventional Commits

Use conventional commit format:

```
type(scope): description

feat(frontend): add new chord display component
fix(backend): resolve API endpoint error
docs(readme): update installation instructions
test(frontend): add unit tests for search functionality
```

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Environment:** OS, Node.js version, npm version
2. **Steps to reproduce:** Clear, step-by-step instructions
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happens
5. **Additional context:** Screenshots, logs, etc.

## 📝 Pull Request Guidelines

1. **Title:** Use conventional commit format
2. **Description:** Explain what and why, not how
3. **Tests:** Ensure all tests pass
4. **Linting:** Ensure code passes linting
5. **Documentation:** Update docs if needed

## 🚀 Deployment

### Frontend

- Built with Vite
- Optimized for production
- Deployed to static hosting

### Backend

- Node.js Express server
- Requires environment variables
- Deployed to Node.js hosting

## 🤝 Getting Help

- Check existing documentation in `docs/`
- Search existing issues
- Create a new issue with detailed information

Thank you for contributing to Chordium! 🎸

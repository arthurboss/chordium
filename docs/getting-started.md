# Getting Started

## Prerequisites

- Node.js (v16+)
- npm

## Installation

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

## Development Commands

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

## Quick Reference Commands

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

# GitHub Actions Workflows

This document explains how our monorepo GitHub Actions workflows are organized and when they run.

## Separate Workflow Files

Our workflows are now split into separate files for better maintainability and clearer separation of concerns:

- **`frontend-tests.yml`** - Frontend unit tests (Vitest)
- **`frontend-build.yml`** - Frontend build and lint
- **`backend-tests.yml`** - Backend unit tests (Jest) 
- **`backend-build.yml`** - Backend build and lint

## Path-Based Filtering

Each workflow uses GitHub's native `paths` filtering to only run when relevant files change.

### Workflow Triggers

#### Frontend Workflows (`frontend-tests.yml`, `frontend-build.yml`)
**Trigger when these paths change:**
- `frontend/**` - Any frontend file
- `package.json` - Root package.json changes
- `package-lock.json` - Root lockfile changes
- `.github/workflows/frontend-*.yml` - Frontend workflow changes
- `shared/**` - Shared code that affects both

#### Backend Workflows (`backend-tests.yml`, `backend-build.yml`)
**Trigger when these paths change:**
- `backend/**` - Any backend file
- `package.json` - Root package.json changes
- `package-lock.json` - Root lockfile changes
- `.github/workflows/backend-*.yml` - Backend workflow changes
- `shared/**` - Shared code that affects both

## Benefits

1. **🎯 Precise Targeting**: Each workflow runs only when its files change
2. **⚡ Faster Execution**: No complex conditional logic or job dependencies
3. **🔧 Better Maintainability**: Each workflow is focused and self-contained
4. **📊 Clearer Status**: Easy to see which part of the system is passing/failing
5. **💰 Cost Efficient**: Minimal CI resource usage

## Examples

| Changed Files | Frontend Tests | Frontend Build | Backend Tests | Backend Build |
|---------------|----------------|----------------|---------------|---------------|
| `frontend/src/App.tsx` | ✅ | ✅ | ❌ | ❌ |
| `backend/server.ts` | ❌ | ❌ | ✅ | ✅ |
| `package.json` | ✅ | ✅ | ✅ | ✅ |
| `shared/types/song.ts` | ✅ | ✅ | ✅ | ✅ |
| `frontend/package.json` | ✅ | ✅ | ❌ | ❌ |
| `backend/package.json` | ❌ | ❌ | ✅ | ✅ |
| `README.md` | ❌ | ❌ | ❌ | ❌ |
| `.github/workflows/frontend-tests.yml` | ✅ | ❌ | ❌ | ❌ |

## Workflow Details

### Frontend Tests (`frontend-tests.yml`)
- **Purpose**: Run Vitest unit tests for frontend components
- **Includes**: Utils, cache, metadata extraction, session storage tests
- **Artifacts**: Frontend test coverage reports

### Frontend Build (`frontend-build.yml`)
- **Purpose**: Lint and build frontend application
- **Includes**: ESLint checks and Vite production build
- **Artifacts**: Frontend build artifacts (`frontend/dist/`)

### Backend Tests (`backend-tests.yml`)
- **Purpose**: Run Jest unit tests for backend services
- **Includes**: Logger utility and comprehensive S3 caching functionality
- **Environment**: Mock AWS and Supabase credentials
- **Artifacts**: Backend test coverage reports

### Backend Build (`backend-build.yml`)
- **Purpose**: Lint and build backend application
- **Includes**: ESLint checks and TypeScript compilation
- **Artifacts**: Backend build artifacts (`backend/dist/`)

## Migration Benefits

**Before (Combined Workflows):**
- Complex conditional logic with `needs` dependencies
- Single point of failure for all tests/builds
- Harder to debug which part failed
- More complex YAML with paths-filter action

**After (Separate Workflows):**
- Simple, focused workflows using native GitHub `paths`
- Independent execution - frontend issues don't block backend
- Clear status indicators for each component
- Easier to maintain and understand
- Native GitHub features (no external actions needed)

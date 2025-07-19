# Technical Decision: Turborepo Adoption

## Decision

Adopted Turborepo v2.5.5 for monorepo management while maintaining deployment simplicity through relative imports in the backend.

## Context

- Monorepo with frontend, backend, and shared types package
- Render deployment constraint: `rootDir: backend` (backend-only deployment)
- Performance issues with manual `cd` commands in npm scripts
- Need for better build caching and task orchestration

## Why Turborepo

### Performance Benefits

- **Task Caching**: Intelligent caching of build, test, and lint outputs
- **Parallel Execution**: Runs tasks across workspaces simultaneously
- **Dependency Graphs**: Automatically handles task dependencies (e.g., build before test)
- **Incremental Builds**: Only rebuilds what changed

### Developer Experience

- Single command execution: `turbo run build` runs all workspace builds
- Filtered execution: `turbo run test --filter=chordium-backend`
- Consistent task interface across all workspaces
- Better CI/CD performance with caching

## Hybrid Strategy

### Development: Full Turborepo

- All development tasks use Turborepo for performance
- Root `package.json` scripts use `turbo run` with filters
- GitHub Actions leverage Turborepo caching

### Deployment: Relative Imports

- Backend uses relative imports to shared types (not npm package)
- Simple `npm ci && npm run build` in Render
- Avoids complex deployment preparation scripts
- Works within Render's `rootDir: backend` constraint

## Implementation

- **turbo.json**: Complete task pipeline configuration
- **All workflows**: Updated to use `npx turbo` commands
- **render.yaml**: Kept simple for relative imports compatibility
- **No complex prune scripts**: Avoided over-engineering

## Decision Rationale

This hybrid approach provides:

1. Maximum development performance (Turborepo)
2. Simple deployment (relative imports)
3. No vendor lock-in for deployment platform
4. Clear separation of concerns

The complexity is in development tooling where it provides value, not in deployment where simplicity is preferred.

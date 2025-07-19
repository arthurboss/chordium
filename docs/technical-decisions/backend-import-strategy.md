# Technical Decision: Backend Import Strategy

## Decision

Use relative imports (`../packages/types`) in the backend instead of npm package imports for shared TypeScript types.

## Context

- Monorepo with shared types package (`@chordium/types`)
- Backend deployment constraint: Render with `rootDir: backend`
- Two import options: npm package vs relative imports
- Need to balance development experience with deployment simplicity

## Problem

After creating the `@chordium/types` npm package, backend deployment began failing on Render. The constraint `rootDir: backend` means:

1. Only the backend folder is available during deployment
2. Root `node_modules` and `package-lock.json` are not accessible
3. Complex build preparation would be needed to make npm packages work

## Alternatives Considered

### Option 1: Complex Deployment Preparation

- Use `turbo prune` to create standalone deployable backend
- Copy root dependencies and workspace resolution
- Prepare isolated build environment

**Pros**: Maintains npm package imports  
**Cons**: Complex deployment scripts, fragile, over-engineered

### Option 2: Relative Imports (Chosen)

- Import directly from `../packages/types/src`
- Simple `npm ci && npm run build` deployment
- No complex preparation required

**Pros**: Simple deployment, reliable, clear dependencies  
**Cons**: Different import style than npm package

## Decision Rationale

**Simplicity over consistency**: While npm package imports are more "proper," the deployment complexity isn't justified for this use case.

**Platform constraints drive architecture**: Render's `rootDir` constraint makes relative imports the pragmatic choice.

**Development vs deployment separation**: Different environments can use different approaches when the trade-offs justify it.

## Implementation

```typescript
// Instead of:
import { SearchResult } from '@chordium/types';

// Use:
import { SearchResult } from '../packages/types/src/index.js';
```

## Benefits

1. **Simple deployment**: Works with basic `npm ci && npm run build`
2. **No vendor lock-in**: Not tied to specific monorepo tooling for deployment
3. **Clear dependencies**: Explicit file-based imports
4. **Reliable**: No workspace resolution complexity in production

## Trade-offs

1. **Import inconsistency**: Backend uses different import style than frontend
2. **Path coupling**: Backend is coupled to monorepo structure
3. **No version management**: Direct file imports bypass semver

## Future Considerations

- If deployment platform changes, could revisit npm package approach
- If monorepo structure changes significantly, may need path updates
- Consider this pattern for other deployment-constrained services

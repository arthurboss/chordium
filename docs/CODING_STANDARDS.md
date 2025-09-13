# Chordium Development Standards

## Core Principles

- **Test-Driven Development**: Write tests first, comprehensive coverage required
- **Single Responsibility**: Each function/module does one thing well
- **Don't Repeat Yourself**: Extract common functionality into reusable utilities
- **Modularity**: Small, focused files with minimal exports per file

## File Organization

- Break large files into smaller, focused modules
- Related functionality grouped in subfolders
- **Archive Policy**: NEVER keep deprecated code - Archive to `_archive/` folders with preserved structure, no compatibility layers

## Type Management

### **REQUIRED: Separate Type Files**

- **Never define types inline** with implementation code
- Extract ALL interfaces and types for components/functions into dedicated `*.types.ts` files
- Import types using `import type` syntax

### **Type Priority**

1. Reuse types from `@chordium/types` whenever possible
2. Create feature-specific types in appropriate `types/` directories
3. Co-locate component types in `.types.ts` files

### **Type Examples**

See [Type Management Examples](#type-management-examples) section.


## Naming Conventions

### **PascalCase for:**
- React components: `UserProfile.tsx`
- Component directories: `UserProfile/`
- Type definition files: `UserProfile.types.ts`
- Test files for components: `UserProfile.test.tsx`

### **kebab-case for:**
- Utility functions: `date-utils.ts`, `api-client.ts`
- Configuration files: `vite.config.ts`, `tailwind.config.ts`
- Service files: `auth-service.ts`, `storage-service.ts`
- Constants files: `api-endpoints.ts`, `app-constants.ts`
- Build/script files: `build-script.js`, `deploy-config.js`

### **camelCase for:**
- Hook files: `useLocalStorage.ts`, `useApiFetch.ts`

### **Other Naming:**
- **Constants**: `UPPER_SNAKE_CASE`

## Export Conventions

### **PREFER: Named Exports**

- **Use named exports** for all components, hooks, and utilities
- **Avoid default exports** except for specific cases

### **Named Export Examples**

See [Export Convention Examples](#export-convention-examples) section.

### **Default Export Exceptions**

See [Export Convention Examples](#export-convention-examples) section.

### **Index Files (`index.ts`)**

- **EXPORTS ONLY**: Never define components, functions, or logic
- **Single entry point**: One index.ts per directory

See [Index Files Examples](#index-files-examples) section.

### **Imports Order**

See [Import Order Examples](#import-order-examples) section.

## React Patterns

### **React 19 Hook Patterns**

See [React 19 Hook Examples](#react-19-hook-examples) section.

## Documentation

### **JSDoc**

- Document **what** and **why**, not **how**
- Include parameters, return types, and errors

See [JSDoc Examples](#jsdoc-examples) section.

### **Comments**

- Avoid obvious comments: `let count = 0; // Initialize count`
- Use meaningful comments: `// Cache hit counter for performance monitoring`

## Testing

- **Modular tests**: Match source structure
- **Descriptive names**: `should return null when user not found`
- **Cover edge cases**: Success, error, and boundary conditions
- **Shared utilities**: Avoid test code duplication

## Performance

- Use React.memo, useMemo, useCallback appropriately
- Implement pagination for large datasets
- Cache where beneficial

## Error Handling

- Custom error types in `types/errors.ts`
- Descriptive error messages
- Handle at appropriate boundaries
- Try-catch blocks
- Retry logic for failures
- Consistent error formats
- Graceful network error handling

## Accessibility

- WCAG compliance
- Proper ARIA labels
- Keyboard navigation
- Screen reader compatibility

## Examples

### **Type Management Examples**

```typescript
// ❌ FORBIDDEN: Inline type definitions
export function useFeatureHook(): {
  data: FeatureData[];
  loading: boolean;
} { /* ... */ }

// ✅ REQUIRED: Import types from separate file
import type { UseFeatureHookResult } from "./use-feature-hook.types";
export function useFeatureHook(): UseFeatureHookResult { /* ... */ }
```

### **Export Convention Examples**

```typescript
// ✅ PREFERRED: Named exports
export const MyComponent = () => { ... };
export const useMyHook = () => { ... };
export const myUtility = () => { ... };

// Import
import { MyComponent, useMyHook, myUtility } from './MyModule';

// ✅ ALLOWED: Main library/framework exports
export default class MyFramework { ... }

// ✅ ALLOWED: Single-purpose utility modules
export default function formatDate(date: Date) { ... }

// ✅ ALLOWED: Configuration objects
export default { apiUrl: '...', timeout: 5000 };
```

### **Index Files Examples**

```typescript
// ✅ CORRECT: Exports only
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';

// ❌ FORBIDDEN: No definitions in index files
export const ComponentName = () => { /* ... */ };
export function utilityFunction() { /* ... */ }
```

### **Import Order Examples**

```typescript
// 1. External libraries
import { useState, use } from "react";
// 2. Global types
import type { Song } from "@chordium/types";
// 3. Local types
import type { FeatureData } from "./feature.types";
// 4. Utilities
import { apiClient } from "@/services/api";
```

### **React 19 Hook Examples**

```typescript
// ✅ Use the new `use()` hook for promises
import { use } from "react";
import type { UserData } from "./user.types";

export function useUserData(userPromise: Promise<UserData>) {
  const userData = use(userPromise);
  return userData;
}

// ✅ Use `useOptimistic()` for immediate UI updates
import { useOptimistic } from "react";

export function useOptimisticLikes(initialLikes: number) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, increment: number) => state + increment
  );
  return { optimisticLikes, addOptimisticLike };
}

// ✅ Use `useActionState()` for form handling
import { useActionState } from "react";

export function useFormSubmission() {
  const [state, formAction] = useActionState(submitForm, null);
  return { state, formAction };
}
```

### **JSDoc Examples**

```typescript
/**
 * Fetches user data with caching
 * 
 * @param userId - Unique user identifier
 * @returns User data or null if not found
 * @throws {APIError} Network request fails
 */
```
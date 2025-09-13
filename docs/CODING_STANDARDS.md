# Chordium Development Standards

## Core Principles

- **Test-Driven Development**: Write tests first, comprehensive coverage required
- **Single Responsibility**: Each function/module does one thing well
- **Don't Repeat Yourself**: Extract common functionality into reusable utilities
- **Modularity**: Small, focused files with minimal exports

## File Organization

### **Modularity & Structure**

- Code must be as modular as possible with minimal exports per file
- Break large files into smaller, focused modules
- Related functionality grouped in subfolders
- Use consistent naming conventions
- **Archive Policy**: NEVER keep deprecated code - Archive to `_archive/` folders with preserved structure, no compatibility layers

## Type Management

### **REQUIRED: Separate Type Files**

All interfaces, types, and type definitions MUST be extracted into separate `.types.ts` files.

- **Never define types inline** with implementation code
- Extract ALL interfaces and types for components/functions into dedicated `*.types.ts` files
- Use consistent naming: `component-name.types.ts`
- Import types using `import type` syntax

### **Type Priority**

1. Reuse types from `@chordium/types` whenever possible
2. Create feature-specific types in appropriate `types/` directories
3. Co-locate component types in `.types.ts` files

### **Type Examples**

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

### **React 19 Hook Patterns**

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

## Documentation

### **JSDoc**

- Document **what** and **why**, not **how**
- Include parameters, return types, and errors

```typescript
/**
 * Fetches user data with caching
 * 
 * @param userId - Unique user identifier
 * @returns User data or null if not found
 * @throws {APIError} Network request fails
 */
```

### **Comments**

- Avoid obvious comments: `let count = 0; // Initialize count`
- Use meaningful comments: `// Cache hit counter for performance monitoring`

## Code Standards

### **Naming**

- **Component Files**: `PascalCase` (matches component name)
- **Component Directories**: `PascalCase` (matches component name)
- **Non-Component Files**: `kebab-case` (utilities, services, configs)
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

### **File Naming Guidelines**

#### **Use PascalCase for:**
- React components: `UserProfile.tsx`
- Component directories: `UserProfile/`
- Type definition files: `UserProfile.types.ts`
- Test files for components: `UserProfile.test.tsx`

#### **Use kebab-case for:**
- Utility functions: `date-utils.ts`, `api-client.ts`
- Configuration files: `vite.config.ts`, `tailwind.config.ts`
- Service files: `auth-service.ts`, `storage-service.ts`
- Hook files: `use-local-storage.ts`, `use-api-fetch.ts`
- Constants files: `api-endpoints.ts`, `app-constants.ts`
- Build/script files: `build-script.js`, `deploy-config.js`

#### **Index Files (`index.ts`):**
- **EXPORTS ONLY**: Never define components, functions, or logic
- **Barrel exports**: Re-export from other files in the directory
- **Type exports**: Always export types alongside components
- **Single entry point**: One index.ts per directory

```typescript
// ✅ CORRECT: Exports only
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';

// ❌ FORBIDDEN: No definitions in index files
export const ComponentName = () => { /* ... */ };
export function utilityFunction() { /* ... */ }
```

### **Imports**

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

### **Error Handling**

- Custom error types in `types/errors.ts`
- Descriptive error messages
- Handle at appropriate boundaries

## Testing

- **Modular tests**: Match source structure
- **Descriptive names**: `should return null when user not found`
- **Cover edge cases**: Success, error, and boundary conditions
- **Shared utilities**: Avoid test code duplication

## Implementation

### **Performance**

- Use React.memo, useMemo, useCallback appropriately
- **React 19**: Prefer `use()` hook for promises and context consumption
- **React 19**: Use `useOptimistic()` for optimistic updates
- **React 19**: Use `useActionState()` for form actions and async state
- Implement pagination for large datasets
- Cache where beneficial

### **Accessibility**

- WCAG compliance
- Proper ARIA labels
- Keyboard navigation
- Screen reader compatibility

### **API Integration**

- Try-catch blocks
- Retry logic for failures
- Consistent error formats
- Graceful network error handling

---

*These standards ensure maintainable, testable code following industry best practices.*

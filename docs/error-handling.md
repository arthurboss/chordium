# Error Handling

## What it does
- Catches app crashes and shows user-friendly error screens
- Handles async errors with toast notifications  
- Smart route validation redirects invalid URLs while preserving music searches
- Provides recovery options (retry, reload, go home)

## Files
- `ErrorBoundary.tsx` - Main error boundary component
- `ErrorBoundaryWrappers.tsx` - Pre-configured wrappers
- `useAsyncError.tsx` - Hook for async error handling
- `query-error-handling.ts` - React Query error handling
- `route-validation.ts` - Smart route validation logic
- `RedirectToHome.tsx` - User-friendly redirect component

## Usage
Error handling is automatically active - no setup required. All routes and components are pre-wrapped with appropriate error boundaries.

## Testing
Add this temporarily to any component:
```tsx
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => { throw new Error('Test error'); }}>
    Test Error
  </button>
)}
```

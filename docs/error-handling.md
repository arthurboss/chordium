# Error Handling

## What it does
- Catches app crashes and shows user-friendly error screens
- Handles async errors with toast notifications
- Provides recovery options (retry, reload, go home)

## Files
- `ErrorBoundary.tsx` - Main error boundary component
- `ErrorBoundaryWrappers.tsx` - Pre-configured wrappers
- `useAsyncError.tsx` - Hook for async error handling
- `query-error-handling.ts` - React Query error handling

## Usage
Already set up in App.tsx. No additional code needed.

## Testing
Add this temporarily to any component:
```tsx
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => { throw new Error('Test error'); }}>
    Test Error
  </button>
)}
```

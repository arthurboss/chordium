# Error Handling Guide for Chordium

## Understanding ErrorBoundary

ErrorBoundary is a React pattern that catches JavaScript errors in component trees and displays fallback UI instead of crashing the entire application.

## What ErrorBoundary Catches

✅ **DOES catch:**
- Errors during rendering
- Errors in lifecycle methods
- Errors in constructors of the whole tree below them
- Errors in `useState` and `useEffect` hooks during render

❌ **DOES NOT catch:**
- Event handlers (use try-catch or useAsyncError hook)
- Asynchronous code (setTimeout, requestAnimationFrame)
- Errors during server-side rendering
- Errors thrown in the error boundary itself
- Promise rejections (use useAsyncError hook)

## Implementation Structure

```
App (GlobalErrorBoundary)
├── QueryClientProvider
    ├── RootLayout (QueryErrorBoundary)
        ├── Routes (RouteErrorBoundary for each route)
            ├── Pages (AsyncErrorBoundary for components)
                ├── Components (Individual ErrorBoundary if needed)
```

## Error Boundary Types

### 1. GlobalErrorBoundary
- **Purpose**: Catches any unhandled errors that bubble up
- **Location**: Wraps the entire app
- **UI**: Full-screen error with reload option
- **Use case**: Critical app crashes

### 2. RouteErrorBoundary  
- **Purpose**: Catches errors in page components
- **Location**: Wraps each route/page
- **UI**: Page-level error with navigation options
- **Use case**: Page-specific failures

### 3. QueryErrorBoundary
- **Purpose**: Catches React Query/API-related errors
- **Location**: Wraps data-fetching components
- **UI**: Data loading error with retry
- **Use case**: API failures, network issues

### 4. AsyncErrorBoundary
- **Purpose**: Catches errors in async operations with auto-reset
- **Location**: Components with dynamic content
- **UI**: Component-level error with retry
- **Use case**: Dynamic content, user interactions

## Common Error Scenarios in Chordium

### 1. API/Backend Errors
```tsx
// Bad - API errors in event handlers won't be caught by ErrorBoundary
const handleSearch = async () => {
  const result = await searchAPI(query); // If this fails, ErrorBoundary won't catch it
};

// Good - Use useAsyncError hook
const { wrapAsync } = useAsyncError();

const handleSearch = wrapAsync(async () => {
  const result = await searchAPI(query);
}, 'search-operation');
```

### 2. Component Rendering Errors
```tsx
// Bad - Can crash the app
const ChordDisplay = ({ chords }) => {
  return chords.map(chord => <div>{chord.name.toUpperCase()}</div>); // What if chord.name is undefined?
};

// Good - Wrapped with ErrorBoundary
const ChordDisplay = ({ chords }) => {
  return (
    <AsyncErrorBoundary resetKeys={[chords]}>
      {chords?.map(chord => (
        <div key={chord.id}>
          {chord?.name?.toUpperCase() || 'Unknown Chord'}
        </div>
      ))}
    </AsyncErrorBoundary>
  );
};
```

### 3. Route Navigation Errors
```tsx
// Already handled in App.tsx with RouteErrorBoundary
// Each route is wrapped automatically
```

### 4. User Input Validation Errors
```tsx
// Use useAsyncError for form submissions
const { wrapAsync, captureError } = useAsyncError();

const handleSubmit = wrapAsync(async (data) => {
  if (!data.artist) {
    throw new Error('Artist name is required');
  }
  await submitChordSheet(data);
}, 'form-submission');
```

## React Error #185 Explanation

The error you're seeing (`Minified React error #185`) typically occurs when:

1. **Invalid Hook Usage**: Hooks called outside functional components
2. **State Updates on Unmounted Components**: Setting state after component unmounts
3. **Incorrect Context Usage**: Using context outside its provider
4. **Async State Updates**: Promise rejections causing state corruption

Common causes in music apps like Chordium:
- Audio context creation/cleanup issues
- WebSocket connection errors
- File upload/download failures
- Browser compatibility issues with audio APIs

## Usage Examples

### Wrapping Individual Components
```tsx
import { AsyncErrorBoundary } from '@/components/ErrorBoundaryWrappers';

const ChordViewer = ({ songId }) => {
  return (
    <AsyncErrorBoundary resetKeys={[songId]}>
      <ChordDisplayComponent songId={songId} />
    </AsyncErrorBoundary>
  );
};
```

### Using Async Error Hook
```tsx
import { useAsyncError } from '@/hooks/useAsyncError';

const SearchComponent = () => {
  const { wrapAsync, wrapEventHandler } = useAsyncError();

  // Wrap async functions
  const handleSearch = wrapAsync(async (query) => {
    const results = await searchAPI(query);
    return results;
  }, 'search');

  // Wrap event handlers
  const handleClick = wrapEventHandler((event) => {
    // This will catch any synchronous errors
    processClick(event);
  }, 'click-handler');

  return (
    <div>
      <button onClick={handleClick}>Search</button>
    </div>
  );
};
```

### Custom Error Fallback
```tsx
const CustomFallback = ({ error, resetError }) => (
  <div className="p-4 border border-red-200 rounded">
    <h3>Chord sheet failed to load</h3>
    <p>{error.message}</p>
    <button onClick={resetError}>Try again</button>
  </div>
);

<ErrorBoundary fallback={<CustomFallback />}>
  <ChordSheetComponent />
</ErrorBoundary>
```

## Testing Error Boundaries

### 1. Trigger Component Error (Development)
```tsx
const ErrorTrigger = () => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Test error for ErrorBoundary');
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
};
```

### 2. Test Async Errors
```tsx
const { captureError } = useAsyncError();

const testAsyncError = () => {
  captureError(new Error('Test async error'), 'test');
};
```

## Error Monitoring Integration

### Production Error Tracking
```tsx
// In your ErrorBoundary reportError method, integrate with:

// Sentry
import * as Sentry from '@sentry/react';
Sentry.captureException(error, {
  contexts: { errorBoundary: errorReport }
});

// LogRocket
import LogRocket from 'logrocket';
LogRocket.captureException(error);

// Custom backend logging
fetch('/api/errors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(errorReport)
});
```

## Best Practices

1. **Layer your error boundaries** - Don't just have one global boundary
2. **Reset on key changes** - Use `resetKeys` prop for dynamic content
3. **Provide meaningful fallbacks** - Custom UI for different error types
4. **Log errors comprehensively** - Include context, user actions, environment
5. **Test error scenarios** - Simulate failures during development
6. **Monitor in production** - Use error tracking services
7. **Graceful degradation** - App should still be usable after errors

## Debugging Tips

1. **Check the browser console** - Full error details in development
2. **Use React DevTools** - Component tree inspection
3. **Add error boundaries gradually** - Start with pages, then components
4. **Test with network failures** - Disable network in DevTools
5. **Test with slow connections** - Throttle network speed
6. **Check for memory leaks** - Especially with audio/media components

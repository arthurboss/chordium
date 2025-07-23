# Quick Integration Guide

## How to Add Error Handling to Your Existing Components

### 1. For Components with API Calls

```tsx
// Before
import { useQuery } from '@tanstack/react-query';

const MyComponent = () => {
  const { data, loading, error } = useQuery(['key'], fetchData);
  
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data}</div>;
};

// After
import { useQuery } from '@tanstack/react-query';
import { QueryErrorBoundary } from '@/components/ErrorBoundaryWrappers';
import { useAsyncError } from '@/hooks/useAsyncError';

const MyComponent = () => {
  const { captureError } = useAsyncError();
  const { data, loading, error } = useQuery(['key'], fetchData);
  
  // Let QueryErrorBoundary handle the error display
  if (error) {
    captureError(error, 'data-fetch');
    return null; // Or a simple fallback
  }
  
  return <div>{data}</div>;
};

// Wrap with ErrorBoundary
export default () => (
  <QueryErrorBoundary>
    <MyComponent />
  </QueryErrorBoundary>
);
```

### 2. For Event Handlers

```tsx
// Before
const handleClick = async () => {
  const result = await apiCall();
  setData(result);
};

// After
import { useAsyncError } from '@/hooks/useAsyncError';

const { wrapAsync } = useAsyncError();

const handleClick = wrapAsync(async () => {
  const result = await apiCall();
  setData(result);
}, 'button-click');
```

### 3. For Page Components

```tsx
// Before
const HomePage = () => {
  return <div>Content</div>;
};

// After
import { RouteErrorBoundary } from '@/components/ErrorBoundaryWrappers';

const HomePage = () => {
  return <div>Content</div>;
};

export default () => (
  <RouteErrorBoundary>
    <HomePage />
  </RouteErrorBoundary>
);
```

### 4. For Dynamic Content

```tsx
// Before
const DynamicList = ({ items }) => {
  return items.map(item => <Item key={item.id} data={item} />);
};

// After
import ErrorBoundary from '@/components/ErrorBoundary';

const DynamicList = ({ items }) => {
  return (
    <ErrorBoundary 
      level="component"
      resetKeys={[items.length]} // Reset when items change
    >
      {items?.map(item => (
        <Item key={item.id} data={item} />
      )) || []}
    </ErrorBoundary>
  );
};
```

## Quick Checklist for Your Components

- [ ] Wrap pages with `RouteErrorBoundary`
- [ ] Wrap API components with `QueryErrorBoundary`  
- [ ] Use `useAsyncError` for event handlers
- [ ] Add `resetKeys` for dynamic content
- [ ] Test error scenarios in development
- [ ] Add custom fallbacks for important components

## Testing Your Error Handling

Add this to any component for testing:

```tsx
{process.env.NODE_ENV === 'development' && (
  <button onClick={() => { throw new Error('Test error'); }}>
    Test Error
  </button>
)}
```

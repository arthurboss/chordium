# 🧪 ErrorBoundary Testing Guide

## Method 1: Dedicated Test Route (Recommended)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test route:**
   ```
   http://localhost:5173/error-test
   ```
   
3. **Test different error scenarios** using the interactive demo page

## Method 2: Quick Test Component

Add the QuickErrorTest component to any existing page temporarily:

```tsx
// In your Home.tsx or any component
import QuickErrorTest from '@/components/QuickErrorTest';

const Home = () => {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Add this temporarily for testing */}
      <QuickErrorTest />
    </div>
  );
};
```

## Method 3: Browser Console Testing

Open browser DevTools and run these commands:

```javascript
// Test 1: Trigger a global error
throw new Error('Test global error');

// Test 2: Create an unhandled promise rejection
Promise.reject(new Error('Test promise rejection'));

// Test 3: Simulate network error
fetch('/non-existent-api-endpoint').catch(console.error);
```

## Method 4: Component-Level Testing

Add this to any component for quick testing:

```tsx
// Add this inside any component
{process.env.NODE_ENV === 'development' && (
  <div className="fixed top-4 right-4 z-50">
    <button 
      className="bg-red-500 text-white px-4 py-2 rounded"
      onClick={() => { throw new Error('Test component error'); }}
    >
      💥 Test Error
    </button>
  </div>
)}
```

## Method 5: Network Error Testing

1. **Open Chrome DevTools**
2. **Go to Network tab**
3. **Select "Offline" or "Slow 3G"**
4. **Try to use features that make API calls**
5. **See how ErrorBoundary handles network failures**

## Method 6: React DevTools

1. **Install React Developer Tools** browser extension
2. **Go to Components tab**
3. **Find any component and manually trigger errors**
4. **Use "Suspend" or "Error" buttons if available**

## What to Look For When Testing

### ✅ Component Render Errors
- **Expected:** ErrorBoundary fallback UI appears
- **Check:** Error is logged to console with full details
- **Verify:** "Try Again" button resets the component
- **Ensure:** GitHub issue link works correctly

### ✅ Async/Event Handler Errors  
- **Expected:** Toast notification appears
- **Check:** Error is logged but component doesn't crash
- **Verify:** App continues to function normally
- **Ensure:** Multiple errors don't spam notifications

### ✅ API/Network Errors
- **Expected:** QueryErrorBoundary shows data loading error
- **Check:** Retry logic works appropriately
- **Verify:** Different error types show different messages
- **Ensure:** Offline scenarios are handled gracefully

### ✅ Route/Navigation Errors
- **Expected:** RouteErrorBoundary shows page-level error
- **Check:** Navigation options (Home, Reload) work
- **Verify:** URL remains accessible after error
- **Ensure:** Breadcrumbs or back navigation function

### ✅ Global App Errors
- **Expected:** GlobalErrorBoundary shows full-screen error
- **Check:** Reload button restores app functionality
- **Verify:** Error details include full context
- **Ensure:** Critical app state is preserved when possible

## Error Scenarios to Test

### 🎵 Chordium-Specific Tests

1. **Search with invalid characters:**
   ```tsx
   // Test malformed search queries
   searchTerm = "'; DROP TABLE users; --"
   ```

2. **Chord sheet parsing errors:**
   ```tsx
   // Upload malformed chord sheet files
   // Test with invalid file formats
   ```

3. **Large file handling:**
   ```tsx
   // Test with very large chord sheet files
   // Simulate memory issues
   ```

4. **Browser compatibility:**
   ```tsx
   // Test on different browsers
   // Test with disabled JavaScript features
   ```

## Advanced Testing Scenarios

### Memory Leaks
```tsx
// Create components that don't cleanup properly
useEffect(() => {
  const interval = setInterval(() => {
    // Simulate memory leak
  }, 100);
  // Don't cleanup interval
}, []);
```

### Race Conditions
```tsx
// Rapidly trigger multiple API calls
// Cancel requests mid-flight
// Test component unmounting during async operations
```

### Edge Cases
```tsx
// Test with null/undefined props
// Test with extremely long strings
// Test with special characters in URLs
```

## Debugging Tips

1. **Check Console Logs:**
   - Look for "ErrorBoundary caught an error" messages
   - Verify error IDs are generated
   - Check component stack traces

2. **Monitor Network Tab:**
   - See how retry logic behaves
   - Check for proper error responses
   - Verify API error handling

3. **React DevTools:**
   - Check component state after errors
   - Verify error boundaries are in correct locations
   - Monitor re-renders and updates

4. **Performance Tab:**
   - Check if error handling impacts performance
   - Monitor memory usage during error scenarios
   - Verify cleanup is working properly

## Production Testing Checklist

Before deploying, verify:

- [ ] ErrorBoundary shows user-friendly messages (no technical details)
- [ ] GitHub issue creation works with your repository
- [ ] Error logging integrates with your monitoring service
- [ ] Performance impact is minimal
- [ ] All error types are properly categorized
- [ ] Retry logic doesn't create infinite loops
- [ ] User can always recover or navigate away
- [ ] Critical app functionality remains available

## Common Issues & Solutions

### Issue: ErrorBoundary not catching errors
**Solution:** Make sure errors occur during render, not in event handlers

### Issue: Too many error notifications
**Solution:** Implement debouncing in useAsyncError hook

### Issue: App becomes unresponsive after errors
**Solution:** Add better cleanup in componentWillUnmount

### Issue: Error boundaries reset too frequently  
**Solution:** Review resetKeys prop and useEffect dependencies

## Testing Commands

```bash
# Run with error boundary testing enabled
NODE_ENV=development npm run dev

# Test production error handling
NODE_ENV=production npm run build && npm run preview

# Run tests with error scenarios
npm run test -- --grep="error"
```

Remember to remove all test components and console.log statements before deploying to production!

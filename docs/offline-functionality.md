# Offline Functionality

Chordium provides comprehensive offline support for a seamless user experience even when internet connectivity is lost.

## Overview

The offline system consists of several components that work together to provide a smooth offline experience:

- **Offline Detection**: Real-time network status monitoring
- **Smart Route Handling**: Intelligent fallback for unavailable routes
- **Offline Fallback Pages**: User-friendly offline error pages
- **Offline Indicator**: Visual feedback when offline
- **Development Testing Tools**: Easy testing of offline scenarios

## Components

### 1. useOffline Hook

The core hook that detects and tracks network connectivity:

```typescript
import { useOffline } from '@/hooks/use-offline';

function MyComponent() {
  const { isOffline, wasOnline, lastOnline } = useOffline();
  
  if (isOffline) {
    return <div>You're offline!</div>;
  }
  
  return <div>You're online!</div>;
}
```

**Returns:**
- `isOffline`: Boolean indicating current offline status
- `wasOnline`: Boolean indicating if user was previously online
- `lastOnline`: Date object of last online connection (or null)

### 2. Offline Detection System

Real-time network status monitoring with subtle user feedback:

**Behavior:**
- Automatically detects online/offline status changes
- Shows toast notifications for network transitions
- Displays persistent header indicator when offline
- Non-intrusive user experience



### 3. OfflineIndicator

Small visual indicator for offline status:

```typescript
import OfflineIndicator from '@/components/OfflineIndicator';

// Shows just the icon
<OfflineIndicator />

// Shows icon with text
<OfflineIndicator showText />
```

### 4. OfflineToast

Subtle toast notifications for network status changes:

```typescript
import OfflineToast from '@/components/OfflineToast';

// Automatically shows toast notifications when offline/online
<OfflineToast />
```

## Route Availability

### Online-Only Routes
- Search functionality (requires API calls)
- Upload functionality (requires backend)
- New chord sheet fetching (requires scraping)

### Offline-Compatible Routes
- Home page (basic navigation)
- My Chord Sheets (reads from IndexedDB)
- Saved chord sheet viewing (reads from IndexedDB)

### Smart Chord Sheet Routes
- `/artist/song` routes check if the specific chord sheet is saved offline
- If saved: Shows the chord sheet normally
- If not saved: Shows offline fallback with helpful messaging

## Testing Offline Functionality

### Development Test Panel

In development mode, a test panel appears in the bottom-right corner:

1. **Click "Test Offline"** to open the panel
2. **Simulate Network States:**
   - "Go Offline" - Simulates losing connection
   - "Go Online" - Simulates regaining connection
3. **Test Offline Routes:**
   - Invalid Route - Tests 404 handling
   - Chord Sheet - Tests unavailable chord sheet
   - Search Page - Tests search functionality
   - My Sheets - Tests offline-compatible route

### Manual Testing

1. **Chrome DevTools:**
   - Open DevTools → Network tab
   - Select "Offline" or "Slow 3G"
   - Navigate to different routes

2. **Browser Console:**
   ```javascript
   // Simulate offline
   window.dispatchEvent(new Event('offline'));
   
   // Simulate online
   window.dispatchEvent(new Event('online'));
   ```

3. **Physical Testing:**
   - Disconnect from WiFi/mobile data
   - Navigate to different routes
   - Reconnect and test recovery

### Automated Testing

Run the offline hook tests:

```bash
npm run test use-offline
```

## Integration with PWA

The offline functionality works seamlessly with the PWA setup:

- **Service Worker**: Handles caching and offline requests
- **IndexedDB**: Stores chord sheets for offline access
- **Offline Detection**: Provides real-time network status
- **Smart Fallbacks**: Shows appropriate offline pages

## User Experience

### When Online
- All functionality works normally
- No offline indicators shown
- Seamless experience

### When Offline
- **Subtle toast notification** when going offline
- **Header indicator** shows persistent offline status
- **App continues to work** for offline-compatible features
- **Full offline fallback** only for unavailable routes
- Access to saved content

### Recovery
- Automatic detection when connection restored
- Seamless transition back to online mode
- No manual refresh required

## Best Practices

### For Developers

1. **Always wrap routes** with `OfflineRouteHandler`
2. **Test offline scenarios** during development
3. **Use the offline hook** for conditional rendering
4. **Provide helpful fallbacks** for offline users

### For Users

1. **Save important chord sheets** for offline access
2. **Check network status** using the offline indicator
3. **Use saved sheets** when offline
4. **Retry when connection restored**

## Troubleshooting

### Common Issues

1. **Offline detection not working:**
   - Check browser support for `navigator.onLine`
   - Verify event listeners are properly attached

2. **Routes not showing offline fallback:**
   - Ensure `OfflineRouteHandler` wraps the route
   - Check route validation logic

3. **Test panel not appearing:**
   - Verify you're in development mode
   - Check for console errors

### Debug Information

In development mode, the offline fallback page includes debug information:
- Requested path
- Current location
- Offline state details
- Saved chord sheet count

## Future Enhancements

- **Background sync** for offline actions
- **Push notifications** for connection status
- **Offline analytics** for user behavior
- **Advanced caching strategies**
- **Offline-first data synchronization**



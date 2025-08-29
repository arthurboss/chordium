import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, TestTube } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';

/**
 * Development-only component for testing offline functionality
 * Allows simulating offline states and testing offline fallback pages
 */
const OfflineTestPanel = () => {
  const { isOffline, wasOnline, lastOnline } = useOffline();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const simulateOffline = () => {
    // Simulate offline by dispatching the offline event
    window.dispatchEvent(new Event('offline'));
  };

  const simulateOnline = () => {
    // Simulate online by dispatching the online event
    window.dispatchEvent(new Event('online'));
  };

  const testOfflineRoute = (route: string) => {
    // First simulate offline, then navigate to route
    simulateOffline();
    setTimeout(() => {
      window.location.href = route;
    }, 100);
  };

  const formatLastOnline = (date: Date | null): string => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          Test Offline
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Offline Test Panel
          </CardTitle>
          <CardDescription>
            Test offline functionality and fallback pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="h-4 w-4 text-orange-500" />
              ) : (
                <Wifi className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium">
                Status: {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Was Online: {wasOnline ? 'Yes' : 'No'}
              <br />
              Last Online: {formatLastOnline(lastOnline)}
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Simulate Network:</div>
            <div className="flex gap-2">
              <Button
                onClick={simulateOffline}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <WifiOff className="h-3 w-3" />
                Go Offline
              </Button>
              <Button
                onClick={simulateOnline}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Wifi className="h-3 w-3" />
                Go Online
              </Button>
            </div>
          </div>

          {/* Route Testing */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Test Offline Routes:</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => testOfflineRoute('/nonexistent')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Invalid Route
              </Button>
              <Button
                onClick={() => testOfflineRoute('/artist/song')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Chord Sheet
              </Button>
              <Button
                onClick={() => testOfflineRoute('/search')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Search Page
              </Button>
              <Button
                onClick={() => testOfflineRoute('/my-chord-sheets')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                My Sheets
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Close Panel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineTestPanel;



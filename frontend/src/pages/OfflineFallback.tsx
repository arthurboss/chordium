import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Wifi, WifiOff, Home, Music, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOffline } from '@/hooks/use-offline';
import { useChordSheets } from '@/storage/hooks';

interface OfflineFallbackProps {
  requestedPath?: string;
}

const OfflineFallback = ({ requestedPath }: OfflineFallbackProps) => {
  const location = useLocation();
  const { isOffline, wasOnline, lastOnline } = useOffline();
  const { myChordSheets } = useChordSheets();
  
  const path = requestedPath || location.pathname;

  useEffect(() => {
    console.warn(
      'Offline Fallback: User attempted to access route while offline:',
      path,
      'Offline status:', { isOffline, wasOnline, lastOnline }
    );
  }, [path, isOffline, wasOnline, lastOnline]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoToSavedSheets = () => {
    window.location.href = '/my-chord-sheets';
  };

  const formatLastOnline = (date: Date | null): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getTitle = (): string => {
    return 'Chord Sheet Not Available Offline';
  };

  const getDescription = (): string => {
    return 'This chord sheet isn\'t available offline. Check your saved chord sheets or try again when you\'re back online.';
  };

  const getAvailableActions = () => {
    const actions = [];

    // Show saved chord sheets if available
    if (myChordSheets && myChordSheets.length > 0) {
      actions.push(
        <Button 
          key="saved"
          onClick={handleGoToSavedSheets} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Music className="h-4 w-4" />
          My Chord Sheets ({myChordSheets.length})
        </Button>
      );
    }

    // Always show home button
    actions.push(
      <Button 
        key="home"
        onClick={handleGoHome} 
        variant="outline"
        className="flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        Go Home
      </Button>
    );

    return actions;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <WifiOff className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              <strong>Network Status:</strong> {isOffline ? 'Offline' : 'Online'}
              {lastOnline && (
                <>
                  <br />
                  <strong>Last Online:</strong> {formatLastOnline(lastOnline)}
                </>
              )}
            </AlertDescription>
          </Alert>

          <Alert>
            <Music className="h-4 w-4" />
            <AlertDescription>
              <strong>Requested Path:</strong> {path}
              <br />
              <strong>Available Offline:</strong> {myChordSheets?.length || 0} chord sheets
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {getAvailableActions()}
          </div>

          {wasOnline && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  You were online {formatLastOnline(lastOnline)}. 
                  Try refreshing when your connection is restored.
                </span>
              </div>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-muted rounded-md">
              <summary className="cursor-pointer font-medium mb-2">
                🐛 Development Details (Click to expand)
              </summary>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <strong>Requested Path:</strong> {path}
                </div>
                <div>
                  <strong>Current Location:</strong> {location.pathname}
                </div>
                <div>
                  <strong>Offline State:</strong> {JSON.stringify({ isOffline, wasOnline, lastOnline }, null, 2)}
                </div>
                <div>
                  <strong>Saved Chord Sheets:</strong> {myChordSheets?.length || 0}
                </div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineFallback;



import { X, Crown, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJamSession } from '../useJamSession';
import { jamSessionService } from '../JamSessionService';

export function JamSessionBanner() {
  const { isHost, isConnected, sessionId, connectedPeers } = useJamSession();

  if (!sessionId) {
    return null;
  }

  const handleDisconnect = () => {
    jamSessionService.destroy();
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Role and status */}
        <div className="flex items-center gap-3 flex-1">
          {/* Role icon */}
          <div className="flex items-center gap-1.5">
            {isHost ? (
              <>
                <Crown className="h-5 w-5 text-amber-200" />
                <span className="font-semibold">Host</span>
              </>
            ) : (
              <>
                <Users className="h-5 w-5 text-blue-100" />
                <span className="font-semibold">Peer</span>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-white/30" />

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-200 animate-pulse" />
                <span className="text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-200" />
                <span className="text-sm">Offline</span>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-white/30" />

          {/* Peer count (only show if host) */}
          {isHost && (
            <div className="flex items-center gap-1.5 text-sm">
              <span>
                {connectedPeers.length} {connectedPeers.length === 1 ? 'peer' : 'peers'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Session ID and disconnect button */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded opacity-75">
            Session: {sessionId.substring(0, 6)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="h-8 w-8 p-0 hover:bg-white/20"
            title="End jam session"
            aria-label="End jam session"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

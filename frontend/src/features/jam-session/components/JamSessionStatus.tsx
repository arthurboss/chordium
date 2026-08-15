import { Crown, Users, Wifi, WifiOff } from 'lucide-react';
import { useJamSession } from '../useJamSession';
import { cn } from '@/lib/utils';

export function JamSessionStatus() {
  const { isHost, isConnected, sessionId, connectedPeers } = useJamSession();

  if (!sessionId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Role indicator */}
      <div className="flex items-center gap-1">
        {isHost ? (
          <>
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Host
            </span>
          </>
        ) : (
          <>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Peer
            </span>
          </>
        )}
      </div>

      {/* Connection status */}
      <div className="flex items-center gap-1 ml-2">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Connected
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-400">
              Offline
            </span>
          </>
        )}
      </div>

      {/* Peer count */}
      {isHost && connectedPeers.length > 0 && (
        <div className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
          {connectedPeers.length} {connectedPeers.length === 1 ? 'peer' : 'peers'}
        </div>
      )}

      {/* Session ID (shortened) */}
      <div className="ml-auto text-xs text-gray-600 dark:text-gray-400 font-mono">
        {sessionId.substring(0, 6)}
      </div>
    </div>
  );
}

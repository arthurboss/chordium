import { WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';

interface OfflineIndicatorProps {
  className?: string;
  showText?: boolean;
}

/**
 * Small offline indicator component
 * Shows when the user is offline with optional text
 */
const OfflineIndicator = ({ className = '', showText = false }: OfflineIndicatorProps) => {
  const { isOffline } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-orange-600 dark:text-orange-400 ${className}`}>
      <WifiOff className="h-4 w-4" />
      {showText && (
        <span className="text-sm font-medium">Offline</span>
      )}
    </div>
  );
};

export default OfflineIndicator;



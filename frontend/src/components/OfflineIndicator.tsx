import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOffline } from '@/hooks/use-offline';
import { useToast } from '@/hooks/use-toast';

interface OfflineIndicatorProps {
  className?: string;
  showText?: boolean;
}

/**
 * Clickable offline indicator component
 * Shows when the user is offline and displays offline toast when clicked
 */
const OfflineIndicator = ({ className = '', showText = false }: OfflineIndicatorProps) => {
  const { isOffline } = useOffline();
  const { toast, toasts } = useToast();

  if (!isOffline) {
    return null;
  }

  const handleClick = () => {
    // Check if an offline toast is already showing
    const offlineToastExists = toasts.some(t => 
      t.title === "You're offline" && t.open
    );
    
    if (!offlineToastExists) {
      toast({
        title: "You're offline",
        description: "Some features may not be available until you reconnect.",
        duration: 0, // Wait for user's dismissal
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Show offline status"
      title="You're offline - Click for details"
      className={`border text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 ${className}`}
      onClick={handleClick}
    >
      <WifiOff className="h-4 w-4" />
      {showText && (
        <span className="sr-only">Offline</span>
      )}
    </Button>
  );
};

export default OfflineIndicator;



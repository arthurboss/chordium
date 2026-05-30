import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useOffline } from "@/hooks/use-offline";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

interface OfflineIndicatorProps {
  className?: string;
  showText?: boolean;
}

/**
 * Clickable offline indicator component
 * Shows when the user is offline and displays offline toast when clicked
 */
const OfflineIndicator = ({ className = "", showText = false }: OfflineIndicatorProps) => {
  const { t } = useTranslation();
  const { isOffline } = useOffline();
  const { toast, toasts } = useToast();

  if (!isOffline) {
    return null;
  }

  const handleClick = () => {
    const offlineToastExists = toasts.some(
      (t) => t.title === i18n.t("notifications:youreOffline") && t.open
    );

    if (!offlineToastExists) {
      toast({
        title: i18n.t("notifications:youreOffline"),
        description: i18n.t("notifications:youreOfflineDesc"),
        duration: 0,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("offlineIndicator.ariaLabel")}
      title={t("offlineIndicator.title")}
      className={`h-10 w-10 rounded-full text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 ${className}`}
      onClick={handleClick}
    >
      <WifiOff className="h-4 w-4" />
      {showText && <span className="sr-only">{t("offlineIndicator.srText")}</span>}
    </Button>
  );
};

export default OfflineIndicator;

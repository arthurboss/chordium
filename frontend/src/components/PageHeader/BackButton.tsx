import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  onBack: () => void;
}

/**
 * Reusable back button component for navigation
 */
const BackButton = ({ onBack }: BackButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onBack}
      className="flex-shrink-0 h-10 w-10 rounded-full"
      tabIndex={0}
      aria-label={t("pageHeader.backAriaLabel")}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default BackButton;

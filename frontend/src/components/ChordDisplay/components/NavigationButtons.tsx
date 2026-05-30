import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NavigationButtonsProps {
  onReturn: () => void;
}

/**
 * Navigation buttons for the chord editor
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onReturn }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onReturn}
      aria-label={t("navigationButtons.backAriaLabel")}
      className="h-10 w-10 rounded-full"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default React.memo(NavigationButtons);

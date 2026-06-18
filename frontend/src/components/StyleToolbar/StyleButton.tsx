import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StyleButtonProps {
  open: boolean;
  onToggle: () => void;
}

const StyleButton: React.FC<StyleButtonProps> = ({ open, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`flex-shrink-0 h-10 w-10 rounded-full ${open ? "bg-muted/50 text-primary border-primary/30" : ""}`}
      tabIndex={0}
      aria-label={t("textStyle.textPreferencesAriaLabel")}
    >
      <Settings className={`h-4 w-4 ${open ? "text-primary" : ""}`} />
    </Button>
  );
};

export default StyleButton;

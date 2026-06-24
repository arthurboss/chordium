import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * Button to save the chord sheet
 */
const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onSave}
      aria-label={t("saveButton.saveAriaLabel")}
      className="h-10 w-10 rounded-full"
    >
      <Save className="h-4 w-4" />
    </Button>
  );
};

export default React.memo(SaveButton);

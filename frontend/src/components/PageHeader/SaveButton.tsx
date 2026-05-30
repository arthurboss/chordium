import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * Reusable save button component
 */
const SaveButton = ({ onSave }: SaveButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSave}
      className="flex-shrink-0 h-10 w-10 rounded-full"
      tabIndex={0}
      aria-label={t("pageHeader.saveAriaLabel")}
    >
      <Save className="h-4 w-4 text-primary" />
    </Button>
  );
};

export default SaveButton;

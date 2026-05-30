import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteButtonProps {
  onDelete: () => void;
}

/**
 * Reusable delete button component
 */
const DeleteButton = ({ onDelete }: DeleteButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="flex-shrink-0 h-10 w-10 rounded-full hover:border-red-500/20 hover:bg-red-100 dark:hover:bg-opacity-40 dark:hover:bg-destructive/30"
      tabIndex={0}
      aria-label={t("pageHeader.deleteAriaLabel")}
    >
      <Trash2 className="h-4 w-4 text-destructive dark:text-red-500" />
    </Button>
  );
};

export default DeleteButton;

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteButtonProps {
  onDelete: () => void;
}

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
      className="flex-shrink-0 h-10 w-10 rounded-full text-destructive hover:text-destructive hover:border-destructive/20 hover:bg-destructive/8"
      tabIndex={0}
      aria-label={t("pageHeader.deleteAriaLabel")}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteButton;

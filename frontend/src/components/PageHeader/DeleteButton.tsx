import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => void;
}

/**
 * Reusable delete button component
 */
export const DeleteButton = ({ onDelete }: DeleteButtonProps) => (
  <Button
    size="sm"
    variant="outline"
    onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }}
    className="flex-shrink-0 hover:border-red-500/20 hover:bg-red-100 dark:hover:bg-opacity-40 dark:hover:bg-destructive/30"
    tabIndex={0}
    aria-label="delete-button"
  >
    <Trash2 className="h-4 w-4 text-destructive dark:text-red-500" />
    <span className="hidden sm:inline">Delete</span>
  </Button>
);

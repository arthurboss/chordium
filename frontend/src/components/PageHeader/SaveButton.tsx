import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * Reusable save button component
 */
export const SaveButton = ({ onSave }: SaveButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onSave}
    className="flex-shrink-0"
    tabIndex={0}
    aria-label="save to my chord sheets"
  >
    <Save className="h-4 w-4 text-primary" />
    <span className="hidden sm:inline">Save</span>
  </Button>
);

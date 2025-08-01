import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { NavigationCardProps } from "./NavigationCard.types";

/**
 * Reusable navigation card component with back and optional delete functionality
 * 
 * Provides consistent navigation UI across different pages while being flexible
 * enough to accommodate various use cases.
 */
const NavigationCard = ({
  onBack,
  onDelete,
  showDeleteButton = false,
  className = "",
  children
}: NavigationCardProps) => {
  return (
    <Card className={`flex flex-row p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm mb-6 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="mr-2"
        tabIndex={0}
        aria-label="back-button"
      >
        <ArrowLeft className="h-4 w-4 text-primary" />
        Back
      </Button>

      {showDeleteButton && onDelete && (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          tabIndex={0}
          aria-label="delete-button"
        >
          <Trash2 className="h-4 w-4 text-destructive dark:text-red-300" />
          Delete
        </Button>
      )}

      {children}
    </Card>
  );
};

export default NavigationCard;

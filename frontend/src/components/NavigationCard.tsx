import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2, Save } from "lucide-react";
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
  onSave,
  showSaveButton = false,
  className = "",
  title
}: NavigationCardProps) => {
  return (
    <Card className={`flex flex-row items-center gap-2 p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm ${className}`}>
      {/* Mobile layout: Title first, then buttons at far right */}
      <div className="flex sm:hidden flex-row items-center justify-between w-full">
        {/* Title */}
        {title && (
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-semibold truncate" title={title}>
              {title}
            </h1>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex-shrink-0"
            tabIndex={0}
            aria-label="back-button"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Show either Delete or Save button, but not both */}
          {showDeleteButton && onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-shrink-0"
              tabIndex={0}
              aria-label="delete-button"
            >
              <Trash2 className="h-4 w-4 text-destructive dark:text-red-300" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          
          {showSaveButton && onSave && (
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
          )}
        </div>
      </div>

      {/* Desktop layout: Back button, title center, action button */}
      <div className="hidden sm:flex flex-row items-center w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex-shrink-0"
          tabIndex={0}
          aria-label="back-button"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        {/* Title */}
        {title && (
          <div className="flex flex-col flex-1 min-w-0 text-center">
            <h1 className="text-lg font-semibold truncate" title={title}>
              {title}
            </h1>
          </div>
        )}

        {/* Show either Delete or Save button, but not both */}
        {showDeleteButton && onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-shrink-0"
            tabIndex={0}
            aria-label="delete-button"
          >
            <Trash2 className="h-4 w-4 text-destructive dark:text-red-300" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        )}
        
        {showSaveButton && onSave && (
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
        )}
      </div>
    </Card>
  );
};

export default NavigationCard;

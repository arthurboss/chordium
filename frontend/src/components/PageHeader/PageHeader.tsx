import { Card } from "@/components/ui/card";
import { memo } from "react";
import { PageHeaderProps } from "./PageHeader.types";
import { BackButton } from "./BackButton";
import { DeleteButton } from "./DeleteButton";
import { SaveButton } from "./SaveButton";
import { LoadingButton } from "./LoadingButton";
import { TitleSection } from "./TitleSection";

/**
 * Reusable page header component with back and optional action functionality
 * 
 * Provides consistent page header UI across different pages while being flexible
 * enough to accommodate various use cases.
 */
export const PageHeader = memo(({
  onBack,
  onAction,
  isSaved,
  title = ""
}: PageHeaderProps) => {
  // Render action button based on isSaved state
  const renderActionButton = () => {
    // If no onAction is provided, don't show any action button
    if (!onAction) return null;
    
    switch (isSaved) {
      case true:
        return <DeleteButton onDelete={onAction} />;
      case false:
        return <SaveButton onSave={onAction} />;
      default:
        return <LoadingButton />;
    }
  };

  return (
    <Card className="flex flex-row items-center gap-2 p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm">
      {/* Mobile layout: Title first, then buttons at far right */}
      <div className="flex sm:hidden flex-row items-center w-full gap-2">
        <div className="flex-1 min-w-0">
          <TitleSection title={title} isMobile={true} />
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <BackButton onBack={onBack} />
          {renderActionButton()}
        </div>
      </div>

      {/* Desktop layout: Back button, title center, action button */}
      <div className="hidden sm:flex flex-row items-center w-full">
        <div className="flex-shrink-0">
          <BackButton onBack={onBack} />
        </div>
        <div className="flex-1 flex justify-center px-4">
          <TitleSection title={title} />
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {renderActionButton()}
        </div>
      </div>
    </Card>
  );
});

PageHeader.displayName = 'PageHeader';

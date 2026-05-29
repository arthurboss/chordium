import { Card } from "@/components/ui/card";
import { memo } from "react";
import { PageHeaderProps } from "./PageHeader.types";
import BackButton from "./BackButton";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";
import TitleSection from "./TitleSection";

/**
 * Reusable page header component with back and optional action functionality
 * 
 * Provides consistent page header UI across different pages while being flexible
 * enough to accommodate various use cases.
 */
const PageHeader = memo(({
  onBack,
  onAction,
  isSaved,
  title,
  rightContent
}: PageHeaderProps) => {

  return (
    <Card className="flex flex-row items-center gap-2 p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm">
      {/* Mobile layout: Title first, then buttons at far right */}
      <div className="flex sm:hidden flex-row items-center justify-between w-full gap-1">
        <TitleSection title={title} isMobile={true} />
        <div className="flex items-center gap-2">
          <BackButton onBack={onBack} />
          {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
          {isSaved === false && onAction && <SaveButton onSave={onAction} />}
          {rightContent}
        </div>
      </div>

      {/* Desktop layout: Back button, title center, action button */}
      <div className="hidden sm:flex flex-row items-center w-full relative">
        <BackButton onBack={onBack} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <TitleSection title={title} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
          {isSaved === false && onAction && <SaveButton onSave={onAction} />}
          {rightContent}
        </div>
      </div>
    </Card>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;

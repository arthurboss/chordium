import { Card } from "@/components/ui/card";
import { memo } from "react";
import { NavigationCardProps } from "./NavigationCard.types";
import BackButton from "./BackButton";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";
import TitleSection from "./TitleSection";

/**
 * Reusable navigation card component with back and optional delete functionality
 * 
 * Provides consistent navigation UI across different pages while being flexible
 * enough to accommodate various use cases.
 */
const NavigationCard = memo(({
  onBack,
  onAction,
  isSaved,
  title
}: NavigationCardProps) => {

  return (
    <Card className="flex flex-row items-center gap-2 p-4 rounded-lg border bg-card dark:bg-[--card] text-card-foreground shadow-sm">
      {/* Mobile layout: Title first, then buttons at far right */}
      <div className="flex sm:hidden flex-row items-center justify-between w-full">
        <TitleSection title={title} isMobile={true} />
        <div className="flex items-center gap-2">
          <BackButton onBack={onBack} />
          {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
          {isSaved === false && onAction && <SaveButton onSave={onAction} />}
        </div>
      </div>

      {/* Desktop layout: Back button, title center, action button */}
      <div className="hidden sm:flex flex-row items-center w-full">
        <BackButton onBack={onBack} />
        <TitleSection title={title} />
        <div className="flex items-center gap-2">
          {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
          {isSaved === false && onAction && <SaveButton onSave={onAction} />}
        </div>
      </div>
    </Card>
  );
});

NavigationCard.displayName = 'NavigationCard';

export default NavigationCard;

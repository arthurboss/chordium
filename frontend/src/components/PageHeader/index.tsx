import { Card } from "@/components/ui/card";
import { memo } from "react";
import { PageHeaderProps } from "./PageHeader.types";
import BackButton from "./BackButton";
import DeleteButton from "./DeleteButton";
import SaveButton from "./SaveButton";
import TitleSection from "./TitleSection";

const PageHeader = memo(({
  onBack,
  onAction,
  isSaved,
  title,
  artist,
  titleClassName,
  rightContent
}: PageHeaderProps) => {
  return (
    <Card className="flex flex-row items-center gap-3 py-3 px-4 rounded-lg border bg-card text-card-foreground shadow-xs">
      <div className="shrink-0">
        <BackButton onBack={onBack} />
      </div>
      <TitleSection title={title} artist={artist} titleClassName={titleClassName} />
      <div className="flex items-center gap-2 shrink-0 min-w-8 ml-auto sm:ml-0">
        {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
        {isSaved === false && onAction && <SaveButton onSave={onAction} />}
        {rightContent}
      </div>
    </Card>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;

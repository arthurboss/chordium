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
  rightContent,
  metadata,
}: PageHeaderProps) => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
      <div className="flex flex-row items-center gap-3 py-3 px-4">
        <div className="shrink-0">
          <BackButton onBack={onBack} />
        </div>
        <TitleSection title={title} artist={artist} titleClassName={titleClassName} />
        <div className="flex items-center gap-2 shrink-0 min-w-8 ml-auto sm:ml-0">
          {isSaved === true && onAction && <DeleteButton onDelete={onAction} />}
          {isSaved === false && onAction && <SaveButton onSave={onAction} />}
          {rightContent}
        </div>
      </div>
      {metadata && (
        <>
          <div className="border-t mx-4" />
          {metadata}
        </>
      )}
    </Card>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;

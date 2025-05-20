import { Music, User, Trash2, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cyAttr } from "@/utils/test-utils";

interface ResultCardProps {
  icon: "music" | "user";
  title: string;
  subtitle?: string;
  onView: (idOrUrl: string) => void;
  onDelete?: (id: string) => void;
  idOrUrl: string;
  viewButtonIcon?: "view" | "external";
  viewButtonLabel?: string;
  deleteButtonIcon?: "trash" | "plus";
  deleteButtonLabel?: string;
  isDeletable?: boolean;
}

const ResultCard = ({
  icon,
  title,
  subtitle,
  onView,
  onDelete,
  idOrUrl,
  viewButtonIcon = "view",
  viewButtonLabel,
  deleteButtonIcon = "trash",
  deleteButtonLabel,
  isDeletable = true,
}: ResultCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer max-w-xl w-full h-28" {...cyAttr(`${icon}-card-${idOrUrl}`)}>
      <CardContent
        className="p-4 flex-1 flex flex-col justify-between"
        onClick={() => onView(idOrUrl)}
        {...cyAttr(`${icon}-card-content-${idOrUrl}`)}
      >
        <div className="flex items-start gap-2 w-full">
          {icon === "music" ? (
            <Music className="h-6 w-6 text-chord mt-1" />
          ) : (
            <User className="h-6 w-6 text-chord mt-1" />
          )}
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-base truncate mb-1 w-full block"
              style={{ lineHeight: '1.2' }}
              {...cyAttr(`${icon}-title-${idOrUrl}`)}
              title={title}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className="text-muted-foreground text-sm truncate w-full block"
                style={{ lineHeight: '1.2' }}
                {...cyAttr(`${icon}-subtitle-${idOrUrl}`)}
                title={subtitle}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <button
          className="text-chord hover:underline font-medium text-sm flex items-center gap-1"
          onClick={() => onView(idOrUrl)}
          tabIndex={0}
          aria-label={viewButtonLabel || (icon === 'music' ? `View chords for ${title}` : `See songs by ${title}`)}
          {...cyAttr(`view-btn-${idOrUrl}`)}
        >
          {viewButtonIcon === 'external' ? (
            <ExternalLink className="h-3 w-3" />
          ) : null}
          {viewButtonLabel || (icon === 'music' ? "View Chords" : "See Songs")}
        </button>
        {isDeletable && onDelete && (
          <button
            className={`${deleteButtonIcon === 'plus' ? 'text-primary' : 'text-destructive dark:text-red-500'} hover:underline text-sm flex items-center gap-1`}
            onClick={() => onDelete(idOrUrl)}
            tabIndex={0}
            aria-label={deleteButtonLabel || `Delete ${title}`}
            {...cyAttr(`delete-btn-${idOrUrl}`)}
          >
            {deleteButtonIcon === 'plus' ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleteButtonLabel ? <span className="sr-only">{deleteButtonLabel}</span> : null}
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResultCard;

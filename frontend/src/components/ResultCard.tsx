import { Music, User, Trash2, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cyAttr } from "@/utils/test-utils";
import { Song } from "@/types/song";

interface ResultCardProps {
  icon: "music" | "user";
  title: string;
  subtitle?: string;
  onView: (song: Song) => void; // Accepts Song object for enhanced navigation
  onDelete?: (id: string) => void;
  path: string;
  viewButtonIcon?: "view" | "external" | "none"; // Add "none" option to hide view button
  viewButtonLabel?: string;
  deleteButtonIcon?: "trash" | "plus";
  deleteButtonLabel?: string;
  isDeletable?: boolean;
  compact?: boolean;
  rightElement?: React.ReactNode;
  song?: Song; // Add optional song object for complete navigation data
}

const ResultCard = ({
  icon,
  title,
  subtitle,
  onView,
  onDelete,
  path,
  viewButtonIcon = "view",
  viewButtonLabel,
  deleteButtonIcon = "trash",
  deleteButtonLabel,
  isDeletable = true,
  compact = false,
  rightElement,
  song, // Destructure song prop
}: ResultCardProps) => {
  // Shared icon
  const Icon = icon === "music" ? Music : User;

  // Shared title/subtitle block
  const TitleBlock = (
    <div className="min-w-0 flex-1">
      <h3
        className={`w-full block font-semibold truncate ${compact ? 'text-sm' : 'text-base  mb-1'}`}
        {...cyAttr(`${icon}-title-${path}`)}
        {...cyAttr(`${icon}-title${compact && '-compact'}-${path}`)}
        title={title}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className={`text-muted-foreground text-${compact ? 'xs' : 'sm'} truncate w-full block`}
          {...cyAttr(`${icon}-subtitle-${path}`)}
          title={subtitle}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  // Shared view button - only render if viewButtonIcon is not "none"
  const ViewButton = viewButtonIcon !== "none" && (
    <button
      className={compact
        ? "text-chord hover:underline font-medium text-[10px] flex items-center gap-1 px-1"
        : "text-chord hover:underline font-medium text-sm flex items-center gap-1"
      }
      onClick={e => { if (compact) { e.stopPropagation(); } onView(song || { title, artist: subtitle || '', path }); }} // Pass song object or construct from props
      tabIndex={0}
      aria-label={viewButtonLabel || (icon === 'music' ? `View chords for ${title}` : `See songs by ${title}`)}
      {...cyAttr(`view-btn${compact ? '-compact' : ''}-${path}`)}
    >
      {viewButtonIcon === 'external' ? (
        <ExternalLink className="h-3 w-3" />
      ) : null}
      {viewButtonLabel ?? (icon === 'music' ? (compact ? "View" : "View Chords") : (compact ? "Songs" : "See Songs"))}
    </button>
  );

  // Shared delete button
  const DeleteButton = isDeletable && onDelete && (
    <button
      className={
        (deleteButtonIcon === 'plus' ? 'text-primary' : 'text-destructive dark:text-red-500') +
        (compact ? ' hover:underline text-[10px] flex items-center gap-1 px-1' : ' hover:underline text-sm flex items-center gap-1')
      }
      onClick={e => { if (compact) { e.stopPropagation(); } onDelete(path); }}
      tabIndex={0}
      aria-label={deleteButtonLabel || `Delete ${title}`}
      {...cyAttr(`delete-btn${compact ? '-compact' : ''}-${path}`)}
    >
      {deleteButtonIcon === 'plus' ? (
        <Plus className={compact ? "h-3 w-3" : "h-4 w-4"} />
      ) : (
        <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
      )}
      {deleteButtonLabel ? <span className="sr-only">{deleteButtonLabel}</span> : null}
    </button>
  );

  if (compact) {
    return (
      <Card className="overflow-hidden cursor-pointer w-full h-12 min-h-0" {...cyAttr(`${icon}-card-compact-${path}`)}>
        <CardContent
          className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
          onClick={() => onView(song || { title, artist: subtitle || '', path })} // Pass song object or construct from props
          {...cyAttr(`${icon}-card-compact-content-${path}`)}
        >
          <Icon className="h-6 w-6 text-chord" />
          {TitleBlock}
          {ViewButton}
          {DeleteButton}
          {rightElement}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden cursor-pointer w-full h-28" {...cyAttr(`${icon}-card-${path}`)}>
      <CardContent
        className="p-4 flex-1 flex flex-col justify-between"
        onClick={() => onView(song || { title, artist: subtitle || '', path })} // Pass song object or construct from props
        {...cyAttr(`${icon}-card-content-${path}`)}
      >
        <div className="flex items-start gap-2 w-full">
          <Icon className="h-6 w-6 text-chord mt-1" />
          {TitleBlock}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        {ViewButton}
        {DeleteButton}
      </CardFooter>
    </Card>
  );
};

export default ResultCard;

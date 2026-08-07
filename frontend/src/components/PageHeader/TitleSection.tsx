import { Input } from "@/components/ui/input";

interface TitleSectionProps {
  title?: string;
  artist?: string;
  titleClassName?: string;
  onArtistClick?: () => void;
  isEditing?: boolean;
  onTitleChange?: (title: string) => void;
  onArtistChange?: (artist: string) => void;
}

const TitleSection = ({
  title,
  artist,
  titleClassName = "",
  onArtistClick,
  isEditing = false,
  onTitleChange,
  onArtistChange,
}: TitleSectionProps) => {
  // Same total height in both modes without hardcoding the header's height:
  // the edit inputs use a tighter line-height (leading-6/leading-5 vs the
  // read view's leading-7/leading-5) to make room for a visible gap between
  // the two visible-bordered fields, while the read view's h1/artist text
  // keep their normal line-height -- both add up to the same total.
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Input
          value={title ?? ""}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title"
          aria-label="Song title"
          className="h-auto border-0 rounded-md bg-background px-2 py-0 text-lg md:text-lg font-semibold leading-6 ring-1 ring-inset ring-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
        />
        <Input
          value={artist ?? ""}
          onChange={(e) => onArtistChange?.(e.target.value)}
          placeholder="Artist"
          aria-label="Artist"
          className="h-auto border-0 rounded-md bg-background px-2 py-0 text-sm leading-5 ring-1 ring-inset ring-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
        />
      </div>
    );
  }

  return (
    title ? (
      <div className="flex-1 min-w-0 text-left">
        <h1 className={`text-lg font-semibold leading-7 truncate ${titleClassName}`} title={title}>
          {title}
        </h1>
        {artist && (
          onArtistClick ? (
            <button
              onClick={onArtistClick}
              className="text-sm leading-5 text-primary truncate block max-w-full hover:underline focus:underline focus:outline-none text-left"
            >
              {artist}
            </button>
          ) : (
            <p className="text-sm leading-5 text-muted-foreground truncate">{artist}</p>
          )
        )}
      </div>
    ) : null
  );
};

export default TitleSection;

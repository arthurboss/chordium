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
  // Title/artist share the same font-size + line-height (text-lg/leading-7 and
  // text-sm/leading-5) in both modes, and the edit inputs strip Input's
  // default border/padding/fixed-height -- so the row's total height falls
  // out of the shared typography instead of a separately hardcoded number.
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <Input
          value={title ?? ""}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title"
          aria-label="Song title"
          className="h-auto border-0 bg-transparent p-0 text-lg md:text-lg font-semibold leading-7 focus-visible:ring-offset-0"
        />
        <Input
          value={artist ?? ""}
          onChange={(e) => onArtistChange?.(e.target.value)}
          placeholder="Artist"
          aria-label="Artist"
          className="h-auto border-0 bg-transparent p-0 text-sm leading-5 focus-visible:ring-offset-0"
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

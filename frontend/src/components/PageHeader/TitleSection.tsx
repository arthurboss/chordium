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
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Input
          value={title ?? ""}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Title"
          aria-label="Song title"
          className="h-8 text-lg font-semibold"
        />
        <Input
          value={artist ?? ""}
          onChange={(e) => onArtistChange?.(e.target.value)}
          placeholder="Artist"
          aria-label="Artist"
          className="h-7 text-sm"
        />
      </div>
    );
  }

  return (
    title ? (
      <div className="flex-1 min-w-0 text-left">
        <h1 className={`text-lg font-semibold truncate ${titleClassName}`} title={title}>
          {title}
        </h1>
        {artist && (
          onArtistClick ? (
            <button
              onClick={onArtistClick}
              className="text-sm text-primary truncate block max-w-full hover:underline focus:underline focus:outline-none text-left"
            >
              {artist}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
          )
        )}
      </div>
    ) : null
  );
};

export default TitleSection;

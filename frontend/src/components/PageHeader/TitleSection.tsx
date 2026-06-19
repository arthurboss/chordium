interface TitleSectionProps {
  title?: string;
  artist?: string;
  titleClassName?: string;
  onArtistClick?: () => void;
}

const TitleSection = ({ title, artist, titleClassName = "", onArtistClick }: TitleSectionProps) => (
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

export default TitleSection;

interface TitleSectionProps {
  title?: string;
  artist?: string;
  titleClassName?: string;
}

const TitleSection = ({ title, artist, titleClassName = "" }: TitleSectionProps) => (
  title ? (
    <div className="flex-1 min-w-0 text-left">
      <h1 className={`text-lg font-semibold truncate ${titleClassName}`} title={title}>
        {title}
      </h1>
      {artist && (
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      )}
    </div>
  ) : null
);

export default TitleSection;

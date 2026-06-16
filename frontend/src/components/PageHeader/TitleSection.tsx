interface TitleSectionProps {
  title?: string;
  titleClassName?: string;
}

const TitleSection = ({ title, titleClassName = "" }: TitleSectionProps) => (
  title ? (
    <div className="flex-1 min-w-0 text-center sm:text-left">
      <h1 className={`text-lg font-semibold truncate ${titleClassName}`} title={title}>
        {title}
      </h1>
    </div>
  ) : null
);

export default TitleSection;

interface TitleSectionProps {
  title?: string;
  isMobile?: boolean;
  titleClassName?: string;
}

/**
 * Reusable title section component with responsive styling
 */
const TitleSection = ({ title, isMobile = false, titleClassName = "" }: TitleSectionProps) => (
  title ? (
    <div className={`flex flex-col ${isMobile ? 'min-w-0' : 'flex-1 min-w-0 text-center'}`}>
      <h1 className={`text-lg font-semibold truncate ${titleClassName}`} title={title}>
        {title}
      </h1>
    </div>
  ) : null
);

export default TitleSection;

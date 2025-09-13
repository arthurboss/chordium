interface TitleSectionProps {
  title?: string;
  isMobile?: boolean;
}

/**
 * Reusable title section component with responsive styling
 */
export const TitleSection = ({ title, isMobile = false }: TitleSectionProps) => (
  title ? (
    <div className={`flex flex-col ${isMobile ? 'min-w-0' : 'flex-1 min-w-0 text-center'}`}>
      <h1 className="text-lg font-semibold truncate" title={title}>
        {title}
      </h1>
    </div>
  ) : null
);

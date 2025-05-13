import React from 'react';
import HelpButton from './HelpButton';

interface TitleSectionProps {
  isPreviewMode: boolean;
}

/**
 * Title section component showing the header and help button
 */
const TitleSection: React.FC<TitleSectionProps> = ({ isPreviewMode }) => (
  <div className="flex items-center gap-2">
    <h2 className="text-lg font-semibold">
      {isPreviewMode ? 'Preview Sheet' : 'Edit Sheet'}
    </h2>
    <HelpButton />
  </div>
);

export default React.memo(TitleSection);

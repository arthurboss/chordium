import React from 'react';
import { ChordEditToolbarProps } from './types';
import TitleSection from './components/TitleSection';
import NavigationButtons from './components/NavigationButtons';
import SaveButton from './components/SaveButton';
import HelpButton from './components/HelpButton';

/**
 * Toolbar component for the ChordEdit component
 * Composed of smaller, modular components for better maintainability
 */
const ChordEditToolbar: React.FC<ChordEditToolbarProps> = ({
  isPreviewMode,
  isFullScreen,
  onTogglePreview,
  onToggleFullScreen,
  onSave,
  onReturn
}) => {
  return (
    <div className="flex items-center justify-between">
      <TitleSection isPreviewMode={isPreviewMode} />
      <div className="flex gap-2">
        <NavigationButtons 
          isPreviewMode={isPreviewMode}
          isFullScreen={isFullScreen}
          onTogglePreview={onTogglePreview}
          onToggleFullScreen={onToggleFullScreen}
          onReturn={onReturn}
        />
        <HelpButton />
        <SaveButton onSave={onSave} />
      </div>
    </div>
  );
};

export default React.memo(ChordEditToolbar);

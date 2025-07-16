import React from 'react';
import NavigationButtons from './components/NavigationButtons';
import SaveButton from './components/SaveButton';

interface ChordEditToolbarProps {
  onSave: () => void;
  onReturn: () => void;
}

/**
 * Toolbar component for the ChordEdit component
 * Contains title, navigation buttons, and save functionality
 */
const ChordEditToolbar: React.FC<ChordEditToolbarProps> = ({
  onSave,
  onReturn
}) => {
  return (
      <div className="flex items-center justify-between">
        <NavigationButtons 
          onReturn={onReturn}
        />
        <SaveButton onSave={onSave} />
      </div>
  );
};

export default React.memo(ChordEditToolbar);

import React from 'react';
import NavigationButtons from './components/NavigationButtons';
import SaveButton from './components/SaveButton';

interface ChordEditToolbarProps {
  onSave: () => void;
  onReturn: () => void;
}

const ChordEditToolbar: React.FC<ChordEditToolbarProps> = ({
  onSave,
  onReturn
}) => {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <NavigationButtons onReturn={onReturn} />
      <SaveButton onSave={onSave} />
    </div>
  );
};

export default React.memo(ChordEditToolbar);

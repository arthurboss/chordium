import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * Button to save the chord sheet
 */
const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onSave}
      aria-label="Save to My Songs"
      className="w-24"
    >
      <Save className="mr-1 h-4 w-4" />
      Save
    </Button>
  );
};

export default React.memo(SaveButton);

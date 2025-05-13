import React from 'react';
import { Button } from '../../ui/button';
import { Save } from 'lucide-react';
import ActionTooltip from './ActionTooltip';

interface SaveButtonProps {
  onSave: () => void;
}

/**
 * Save button component with tooltip
 */
const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => (
  <ActionTooltip content="Save changes">
    <Button 
      variant="default" 
      size="sm" 
      onClick={onSave}
      aria-label="Save"
    >
      <Save className="mr-1 h-4 w-4" />
      Save
    </Button>
  </ActionTooltip>
);

export default React.memo(SaveButton);

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface NavigationButtonsProps {
  onReturn: () => void;
}

/**
 * Navigation buttons for the chord editor
 * Currently just has a back button
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onReturn
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onReturn}
      aria-label="Go back"
      className="w-24"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
};

export default React.memo(NavigationButtons);

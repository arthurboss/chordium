import React from 'react';
import { Button } from '../../ui/button';
import { ArrowLeft, Maximize2, Minimize2, Eye, Edit2 } from 'lucide-react';
import ActionTooltip from './ActionTooltip';
import { TooltipProvider } from '../../ui/tooltip';

interface NavigationButtonsProps {
  isPreviewMode: boolean;
  isFullScreen: boolean;
  onTogglePreview: () => void;
  onToggleFullScreen: () => void;
  onReturn?: () => void;
}

/**
 * Navigation buttons component for ChordEditToolbar
 * Using a single TooltipProvider for all tooltips to prevent nesting issues
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isPreviewMode,
  isFullScreen,
  onTogglePreview,
  onToggleFullScreen,
  onReturn
}) => (
  <TooltipProvider>
    <div className="flex gap-2">
      {onReturn && (
        <ActionTooltip content="Return to previous screen">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReturn}
            aria-label="Return"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </ActionTooltip>
      )}
      
      <ActionTooltip content={isPreviewMode ? "Switch to Edit mode" : "Switch to Preview mode"}>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          aria-label={isPreviewMode ? "Switch to Edit" : "Switch to Preview"}
        >
          {isPreviewMode ? (
            <Edit2 className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </ActionTooltip>
    
      <ActionTooltip content={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullScreen}
          aria-label={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </ActionTooltip>
    </div>
  </TooltipProvider>
);

export default React.memo(NavigationButtons);

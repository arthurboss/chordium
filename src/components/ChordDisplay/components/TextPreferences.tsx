import React from 'react';
import { Button } from '../../ui/button';
import { Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuSeparator,
  DropdownMenuItem
} from '../../ui/dropdown-menu';
import { useDropdownTimer } from '../hooks/useDropdownTimer';
import { TextPreferencesProps } from '../hooks/types';
import ViewModeSelector from './ViewModeSelector';
import FontStyleSelector from './FontStyleSelector';
import SliderControl from './SliderControl';

/**
 * TextPreferences dropdown menu component for controlling text display options
 */
const TextPreferences: React.FC<TextPreferencesProps> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  lineHeight,
  setLineHeight,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  buttonClassName = '',
  iconSize = 20,
  isAtBottom = false,
}) => {
  const { open, setOpen, startCloseTimer, clearCloseTimer } = useDropdownTimer();

  // Format value functions for sliders
  const formatLineHeight = (val: number) => `${Math.round((val - 0.6) * 5)}x`;
  const formatFontSpacing = (val: number) => val === 0 ? '1x' : val === 0.1 ? '2x' : '3x';
  const formatFontSize = (val: number) => `${val}px`;

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={buttonClassName} 
          title="Text Preferences"
        >
          <Settings size={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={`${isAtBottom ? 'mr-3' : 'mr-7'} mb-2 py-3 data-[state=open]:animate-merge-in data-[state=closed]:animate-merge-out`}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.preventDefault();
          startCloseTimer();
        }}
        onPointerDownOutside={(e) => e.stopPropagation()}
        onTouchStart={clearCloseTimer}
        onTouchEnd={startCloseTimer}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={startCloseTimer}
        style={{
          transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
          opacity: '1'
        }}
      >
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setHideGuitarTabs(!hideGuitarTabs)} 
          className={hideGuitarTabs ? 'bg-accent text-accent-foreground' : ''}
        >
          {hideGuitarTabs ? 'Show Guitar Tabs' : 'Hide Guitar Tabs'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-2">Font Style</div>
          <FontStyleSelector fontStyle={fontStyle} setFontStyle={setFontStyle} />
        </div>
        
        <DropdownMenuSeparator />
        <SliderControl
          label="Font Size"
          value={fontSize}
          setValue={setFontSize}
          min={12}
          max={24}
          step={1}
          formatValue={formatFontSize}
        />
        
        <DropdownMenuSeparator />
        <SliderControl
          label="Line Height"
          value={lineHeight}
          setValue={setLineHeight}
          min={0.8}
          max={1.6}
          step={0.1}
          formatValue={formatLineHeight}
        />
        
        <DropdownMenuSeparator />
        <SliderControl
          label="Font Spacing"
          value={fontSpacing}
          setValue={setFontSpacing}
          min={0}
          max={0.2}
          step={0.1}
          formatValue={formatFontSpacing}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextPreferences;

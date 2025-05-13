import React from 'react';
import { Button } from '../../ui/button';
import { Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuSeparator 
} from '../../ui/dropdown-menu';
import { useDropdownTimer } from '../hooks/useDropdownTimer';
import { TextPreferencesProps } from '../hooks/types';
import ViewModeSelector from './ViewModeSelector';
import FontStyleSelector from './FontStyleSelector';
import SliderControl from './SliderControl';

/**
 * Desktop version of the TextPreferences dropdown menu
 * Optimized for desktop layout
 */
const TextPreferencesMenu: React.FC<Pick<TextPreferencesProps, 
  'fontSize' | 'setFontSize' | 
  'fontSpacing' | 'setFontSpacing' | 
  'fontStyle' | 'setFontStyle' | 
  'lineHeight' | 'setLineHeight' | 
  'viewMode' | 'setViewMode'
>> = ({
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
          className="h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0"
        >
          <Settings size={16} className="text-chord" />
          <span className="font-medium text-sm">Text Preferences</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className='px-1 py-3 data-[state=open]:animate-merge-in data-[state=closed]:animate-merge-out'
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

export default TextPreferencesMenu;

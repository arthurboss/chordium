import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Music, Settings, Text, AlignLeft } from 'lucide-react';
import { Slider } from '../ui/slider';

interface TextPreferencesProps {
  fontSize: number;
  setFontSize: (value: number) => void;
  fontSpacing: number;
  setFontSpacing: (value: number) => void;
  fontStyle: string;
  setFontStyle: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  hideGuitarTabs: boolean;
  setHideGuitarTabs: (value: boolean) => void;
  buttonClassName?: string;
  iconSize?: number;
}

const TextPreferences: React.FC<TextPreferencesProps> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  buttonClassName,
  iconSize = 16,
}) => {
  // Handler for chords-only: toggles hideGuitarTabs only
  const handleChordsOnly = () => {
    setHideGuitarTabs(!hideGuitarTabs);
    setViewMode('chords-only');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={buttonClassName ? 'icon' : undefined} className={buttonClassName ? buttonClassName : 'h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0'} title="Text Preferences">
          <Settings size={iconSize} className="text-chord" />
          {!buttonClassName && <span className="font-medium text-sm">Text Preferences</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'normal' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('normal')} title="Normal"><Text size={18} /></Button>
            <Button variant={hideGuitarTabs ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={handleChordsOnly} title={hideGuitarTabs ? 'Show Guitar Tabs' : 'Hide Guitar Tabs'}><Music size={18} /></Button>
            <Button variant={viewMode === 'lyrics-only' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('lyrics-only')} title="Lyrics"><AlignLeft size={18} /></Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">Font Style</div>
          <div className="flex items-center gap-2">
            <Button variant={fontStyle === 'serif' ? 'default' : 'outline'} size="sm" className="min-w-[60px]" onClick={() => setFontStyle('serif')}>Serif</Button>
            <Button variant={fontStyle === 'sans-serif' ? 'default' : 'outline'} size="sm" className="min-w-[60px]" onClick={() => setFontStyle('sans-serif')}>Sans</Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="font-semibold text-xs mb-1">Font Size</div>
          <div className="flex items-center gap-3">
            <Slider
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-32"
            />
            <span className="w-10 text-center text-sm">{fontSize}px</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="font-semibold text-xs mb-1">Font Spacing</div>
          <div className="flex items-center gap-3">
            <Slider
              value={[fontSpacing]}
              min={0}
              max={0.2}
              step={0.1}
              onValueChange={(value) => setFontSpacing(value[0])}
              className="w-32"
            />
            <span className="w-10 text-center text-sm">
              {fontSpacing === 0 ? 'x1' : fontSpacing === 0.1 ? 'x2' : 'x3'}
            </span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextPreferences;

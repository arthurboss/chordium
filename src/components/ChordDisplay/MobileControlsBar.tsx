import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Settings, Music, Text, AlignLeft } from 'lucide-react';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { Slider } from '../ui/slider';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useStickyAtBottom } from '@/hooks/use-sticky-at-bottom';

function TextPreferences({
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
  iconSize,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={buttonClassName} title="Text Preferences">
          <Settings size={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="mr-4">
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'normal' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('normal')} title="Normal"><Text size={18} /></Button>
            <Button variant={viewMode === 'chords-only' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('chords-only')} title="Chords"><Music size={18} /></Button>
            <Button variant={viewMode === 'lyrics-only' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('lyrics-only')} title="Lyrics"><AlignLeft size={18} /></Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setHideGuitarTabs(!hideGuitarTabs)} className={hideGuitarTabs ? 'bg-accent text-accent-foreground' : ''}>{hideGuitarTabs ? 'Show Guitar Tabs' : 'Hide Guitar Tabs'}</DropdownMenuItem>
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
}

const MobileControlsBar: React.FC<ChordSheetControlsProps> = ({
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
}) => {
  const isAtBottom = useStickyAtBottom(60);

  // Only TextPreferences button remains
  const MenuButtons = (
    <>
      <TextPreferences
        fontSize={fontSize} setFontSize={setFontSize}
        fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
        fontStyle={fontStyle} setFontStyle={setFontStyle}
        viewMode={viewMode} setViewMode={setViewMode}
        hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
        buttonClassName="h-10 w-10"
        iconSize={20}
      />
    </>
  );

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} mobileOnly className={!autoScroll ? 'w-fit ml-auto' : ''}>
      {/* When not playing, TextPreferences and Play on the right */}
      {!autoScroll && (
        <div className="flex items-center ml-auto">
          {MenuButtons}
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 ml-2 ${autoScroll ? 'bg-secondary/20 text-primary hover:bg-primary/20' : ''}`} />
        </div>
      )}
      {/* When playing, TextPreferences on far left, SpeedControl, Play on far right */}
      {autoScroll && (
        <>
          <div className="flex items-center mr-auto ml-0 pl-0">{MenuButtons}</div>
          <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 ml-2 ${autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`} />
        </>
      )}
    </StickyBottomContainer>
  );
};

export default MobileControlsBar;
import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Settings, ChevronDown, ChevronUp, Music, Text, AlignLeft } from 'lucide-react';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { ChordSheetControlsProps } from './types';

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
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-12 w-12" title="Text Preferences">
          <Settings size={22} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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
            <input
              type="range"
              min={12}
              max={24}
              step={1}
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-32 accent-blue-500"
            />
            <span className="w-10 text-center text-sm">{fontSize}px</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-3">
          <div className="font-semibold text-xs mb-1">Font Spacing</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.1}
              value={fontSpacing}
              onChange={e => setFontSpacing(Number(e.target.value))}
              className="w-32 accent-blue-500"
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
  setIsEditing,
  handleDownload,
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
  // Only TextPreferences button remains
  const MenuButtons = (
    <>
      <TextPreferences 
        fontSize={fontSize} setFontSize={setFontSize}
        fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
        fontStyle={fontStyle} setFontStyle={setFontStyle}
        viewMode={viewMode} setViewMode={setViewMode}
        hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
      />
    </>
  );

  return (
    <div className="sm:hidden sticky bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-center" style={{ padding: '0.5rem 0' }}>
      {/* When not playing, TextPreferences and Play on the right */}
      {!autoScroll && (
        <div className="flex items-center ml-auto">
          {MenuButtons}
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={22} className="h-12 w-12 bg-primary text-primary-foreground ml-2" />
        </div>
      )}
      {/* When playing, TextPreferences on far left, SpeedControl, Play on far right */}
      {autoScroll && (
        <>
          <div className="flex items-center mr-auto" style={{ marginLeft: 0, paddingLeft: 0 }}>{MenuButtons}</div>
          <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} className="flex-1 flex items-center justify-center px-2" />
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={22} className="h-12 w-12 bg-primary text-primary-foreground ml-2" />
        </>
      )}
    </div>
  );
};

export default MobileControlsBar; 
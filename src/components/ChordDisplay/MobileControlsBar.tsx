import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { ChordSheetControlsProps } from './types';

function TextPreferences({
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-12 w-12 ml-2" title="Text Preferences">
          <Settings size={22} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Text Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <DropdownMenuItem onClick={() => setViewMode('normal')} className={viewMode === 'normal' ? 'bg-accent text-accent-foreground' : ''}>Normal</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('chords-only')} className={viewMode === 'chords-only' ? 'bg-accent text-accent-foreground' : ''}>Chords Only</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('lyrics-only')} className={viewMode === 'lyrics-only' ? 'bg-accent text-accent-foreground' : ''}>Lyrics Only</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setHideGuitarTabs(!hideGuitarTabs)} className={hideGuitarTabs ? 'bg-accent text-accent-foreground' : ''}>{hideGuitarTabs ? 'Show Guitar Tabs' : 'Hide Guitar Tabs'}</DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">Font Size</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(Math.max(12, fontSize - 1))} disabled={fontSize <= 12}><ChevronDown size={14} /></Button>
            <span className="w-10 text-center text-sm">{fontSize}px</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFontSize(Math.min(24, fontSize + 1))} disabled={fontSize >= 24}><ChevronUp size={14} /></Button>
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
}) => {
  // Only TextPreferences button remains
  const MenuButtons = (
    <>
      <TextPreferences 
        fontSize={fontSize} setFontSize={setFontSize}
        viewMode={viewMode} setViewMode={setViewMode}
        hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
      />
    </>
  );

  return (
    <div className="sm:hidden sticky bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-center px-2 py-2">
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
          <div className="flex items-center mr-auto">{MenuButtons}</div>
          <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} className="flex-1 flex items-center justify-center px-2" />
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={22} className="h-12 w-12 bg-primary text-primary-foreground ml-2" />
        </>
      )}
    </div>
  );
};

export default MobileControlsBar; 
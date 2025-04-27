import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Music, ChevronDown, ChevronUp, Menu, Settings } from 'lucide-react';
import ConfigMenu from './ConfigMenu';
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
        <Button variant="outline" size="icon" className="h-8 w-8" title="Text Preferences">
          <Settings size={18} />
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

const DesktopControls: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  transposeOptions,
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  setIsEditing,
  handleDownload,
}) => (
  <Card className="sticky bottom-0 mb-4 hidden sm:block">
    <CardContent className="p-3 sm:p-4">
      <div className="flex flex-col space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={16} className="h-8 w-8" variant="outline" />
          <TextPreferences 
            fontSize={fontSize} setFontSize={setFontSize}
            viewMode={viewMode} setViewMode={setViewMode}
            hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
          />
          <div className="flex items-center gap-2">
            <Music size={18} className="text-chord" />
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Transpose:</span>
            <Select 
              value={transpose.toString()} 
              onValueChange={(value) => setTranspose(parseInt(value))}
            >
              <SelectTrigger className="w-[70px] sm:w-[100px] h-8 sm:h-10">
                <SelectValue placeholder="0" />
              </SelectTrigger>
              <SelectContent>
                {transposeOptions.map((value: number) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value > 0 ? `+${value}` : value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 sm:h-10 gap-1">
                <Menu size={16} />
                <span className="hidden sm:inline">Config</span>
              </Button>
            </DropdownMenuTrigger>
            <ConfigMenu 
              viewMode={viewMode} setViewMode={setViewMode}
              hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
              setIsEditing={setIsEditing} handleDownload={handleDownload}
            />
          </DropdownMenu>
        </div>
        <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} className="pt-2" />
      </div>
    </CardContent>
  </Card>
);

export default DesktopControls; 
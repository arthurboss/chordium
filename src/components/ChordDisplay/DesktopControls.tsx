import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Music, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { ChordSheetControlsProps } from './types';

function TextPreferencesMenu({
  fontSize,
  setFontSize,
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
}: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 flex items-center gap-2">
          <Settings size={16} />
          <span className="font-medium text-sm">Text Preferences</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Text Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <DropdownMenuItem onClick={() => setViewMode('normal')} className={viewMode === 'normal' ? 'bg-accent text-accent-foreground' : ''}>Normal</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('chords-only')} className={viewMode === 'chords-only' ? 'bg-accent text-accent-foreground' : ''}>Chords Only</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewMode('lyrics-only')} className={viewMode === 'lyrics-only' ? 'bg-accent text-accent-foreground' : ''}>Lyrics Only</DropdownMenuItem>
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

function TransposeMenu({ transpose, setTranspose, transposeOptions }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 flex items-center gap-2">
          <Music size={18} className="text-chord" />
          <span className="font-medium text-sm">Transpose: {transpose > 0 ? `+${transpose}` : transpose}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-2">
        <div className="grid grid-cols-5 gap-2">
          {transposeOptions.map((value: number) => (
            <Button
              key={value}
              variant={value === transpose ? "default" : "outline"}
              size="sm"
              className="min-w-[36px] h-8 px-0 text-sm"
              onClick={() => setTranspose(value)}
            >
              {value > 0 ? `+${value}` : value}
            </Button>
          ))}
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
          {/* Play/Pause, Speed Control, and Transpose grouped together */}
          <div className="flex items-center gap-2">
            <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={16} className="h-8 w-8" variant="outline" />
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} className="ml-1" />
            {/* Transpose button as a dropdown menu */}
            <TransposeMenu transpose={transpose} setTranspose={setTranspose} transposeOptions={transposeOptions} />
          </div>
          {/* Text Preferences button and dropdown */}
          <TextPreferencesMenu 
            fontSize={fontSize} setFontSize={setFontSize}
            viewMode={viewMode} setViewMode={setViewMode}
            hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DesktopControls;
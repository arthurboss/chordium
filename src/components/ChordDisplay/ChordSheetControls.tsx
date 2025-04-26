import React from 'react';
import { ChordSheetControlsProps } from './types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Slider } from '../ui/slider';
import { Music, ChevronDown, ChevronUp, Menu, Pause, Play, Edit, Download } from 'lucide-react';

const ChordSheetControls: React.FC<ChordSheetControlsProps> = ({
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
}) => {
  return (
    <Card className="sticky bottom-0 mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                disabled={fontSize <= 12}
              >
                <ChevronDown size={14} />
              </Button>
              <span className="w-10 text-center text-sm">{fontSize}px</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                disabled={fontSize >= 24}
              >
                <ChevronUp size={14} />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-10 gap-1">
                    <Menu size={16} />
                    <span className="hidden sm:inline">View Mode</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Display Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setViewMode("normal")}
                    className={viewMode === "normal" ? "bg-accent text-accent-foreground" : ""}
                  >
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setViewMode("chords-only")}
                    className={viewMode === "chords-only" ? "bg-accent text-accent-foreground" : ""}
                  >
                    Chords Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setViewMode("lyrics-only")}
                    className={viewMode === "lyrics-only" ? "bg-accent text-accent-foreground" : ""}
                  >
                    Lyrics Only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setHideGuitarTabs((v: boolean) => !v)}
                    className={hideGuitarTabs ? "bg-accent text-accent-foreground" : ""}
                  >
                    {hideGuitarTabs ? "Show Guitar Tabs" : "Hide Guitar Tabs"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setAutoScroll((v: boolean) => !v)}
                title={autoScroll ? "Stop Auto-Scroll" : "Start Auto-Scroll"}
                data-testid="auto-scroll-toggle"
              >
                {autoScroll ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-10">
                    <span className="mr-1">•••</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {autoScroll && (
            <div className="flex items-center gap-3 pt-2" data-testid="scroll-speed-control">
              <span className="text-sm font-medium w-20">Speed: {scrollSpeed}</span>
              <Slider
                value={[scrollSpeed]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setScrollSpeed(value[0])}
                className="flex-1"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChordSheetControls; 
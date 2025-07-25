import React from 'react';
import { CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Music, Settings, Text, AlignLeft } from 'lucide-react';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import { Slider } from '../ui/slider';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useStickyAtBottom } from '@/hooks/use-sticky-at-bottom';

function TextPreferencesMenu({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
  viewMode,
  setViewMode,
}: {
  fontSize: number;
  setFontSize: (value: number) => void;
  fontSpacing: number;
  setFontSpacing: (value: number) => void;
  fontStyle: string;
  setFontStyle: (value: string) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0">
          <Settings size={16} className="text-chord" />
          <span className="font-medium text-sm">Text Preferences</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1">
          <div className="font-semibold text-xs mb-1">View Mode</div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'normal' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('normal')} title="Normal"><Text size={18} /></Button>
            <Button variant={viewMode === 'chords-only' ? 'default' : 'outline'} size="sm" className="min-w-[40px] flex items-center justify-center" onClick={() => setViewMode('chords-only')} title="Chords"><Music size={18} /></Button>
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
}

function TransposeMenu({ transpose, setTranspose, transposeOptions }: {
  transpose: number;
  setTranspose: (value: number) => void;
  transposeOptions: number[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0">
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
  fontSpacing,
  setFontSpacing,
  fontStyle,
  setFontStyle,
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
  const isAtBottom = useStickyAtBottom();

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} desktopOnly>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-3 items-center gap-2" style={{ gridTemplateColumns: '180px 1fr 180px' }}>
              {/* Left: Play/Pause (Auto Scroll) button */}
              <div className="flex items-center justify-start">
                <PlayButton
                  autoScroll={autoScroll}
                  setAutoScroll={setAutoScroll}
                  size={16}
                  className={`h-8 w-auto px-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 ${autoScroll && 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  variant="outline"
                />
                {/* Speed controls only show when playing, always between PlayButton and Transpose */}
                {autoScroll && (
                  <div className="ml-2 transition-all duration-300 animate-in slide-in-from-left-2">
                    <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                  </div>
                )}
              </div>
              {/* Center: Transpose always centered and fixed */}
              <div className="flex items-center justify-center">
                <TransposeMenu transpose={transpose} setTranspose={setTranspose} transposeOptions={transposeOptions} />
              </div>
              {/* Right: Text Preferences */}
              <div className="flex items-center justify-end">
                <TextPreferencesMenu
                  fontSize={fontSize} setFontSize={setFontSize}
                  fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
                  fontStyle={fontStyle} setFontStyle={setFontStyle}
                  viewMode={viewMode} setViewMode={setViewMode}
                />
              </div>
            </div>
          </div>
        </CardContent>
    </StickyBottomContainer>
  );
};

export default DesktopControls;
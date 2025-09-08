import React, { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Settings, Music, Text, AlignLeft } from 'lucide-react';
import { Slider } from '../ui/slider';
import { ChordSheetControlsProps } from './types';
import StickyBottomContainer from '../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';
import { useCapoTranspose } from '@/hooks/useCapoTranspose';
import CapoMenu from './components/CapoMenu';
import KeyMenu from './components/KeyMenu';
import CapoTransposeLink from './components/CapoTransposeLink';
import TextPreferencesMenu from './components/TextPreferencesMenu';
import AutoScrollControls from './components/AutoScrollControls';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';

// Mobile-specific TextPreferences component (inline for mobile)
function MobileTextPreferences({
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

const StickyControlsBar: React.FC<ChordSheetControlsProps> = ({
  transpose,
  setTranspose,
  defaultTranspose = 0,
  songKey,
  capo,
  setCapo,
  defaultCapo = 0,
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
  capoTransposeLinked = false,
  setCapoTransposeLinked,
}) => {
  const isAtBottom = useAtBottom({ offset: 60 });
  const [showSongControls, setShowSongControls] = useState(false);

  // Use extracted capo-transpose logic
  const {
    handleCapoChange,
    handleTransposeChange,
    getCapoDisableStates,
    getTransposeDisableStates,
  } = useCapoTranspose({
    capo,
    setCapo,
    transpose,
    setTranspose,
    capoTransposeLinked,
  });

  const handleToggleLink = () => {
    if (setCapoTransposeLinked) {
      setCapoTransposeLinked(!capoTransposeLinked);
    }
  };

  const handleToggleSongControls = () => {
    setShowSongControls(!showSongControls);
  };

  // Musical controls component (shared between mobile and desktop)
  const MusicalControls = () => (
    <>
      <div className='flex flex-col items-center'>
        <CapoMenu
          capo={capo}
          setCapo={handleCapoChange}
          defaultCapo={defaultCapo}
          title="Capo Fret"
          disableIncrement={getCapoDisableStates().disableIncrement}
          disableDecrement={getCapoDisableStates().disableDecrement}
        />
      </div>
      <div className='flex flex-col items-center'>
        <CapoTransposeLink
          isLinked={capoTransposeLinked}
          onToggle={handleToggleLink}
          title="Link"
        />
      </div>
      <div className='flex flex-col items-center'>
        <KeyMenu
          transpose={transpose}
          setTranspose={handleTransposeChange}
          defaultTranspose={defaultTranspose}
          songKey={songKey}
          title="Transpose"
          disableIncrement={getTransposeDisableStates().disableIncrement}
          disableDecrement={getTransposeDisableStates().disableDecrement}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Layout */}
      <StickyBottomContainer
        isAtBottom={isAtBottom}
        desktopOnly
      >
        {/* Text Preferences */}
        <div className="flex flex-col">
          <TextPreferencesMenu
            fontSize={fontSize} setFontSize={setFontSize}
            fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
            fontStyle={fontStyle} setFontStyle={setFontStyle}
            viewMode={viewMode} setViewMode={setViewMode}
            hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
          />
        </div>
        {/* Auto Scroll Controls */}
        <div className='flex flex-col items-start'>
          <AutoScrollControls
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
            scrollSpeed={scrollSpeed}
            setScrollSpeed={setScrollSpeed}
          />
        </div>

        {/* Musical Controls Sub-Container */}
        <div className="flex items-end gap-1 justify-end">
          <MusicalControls />
        </div>
      </StickyBottomContainer>

      {/* Mobile Layout */}
      <StickyBottomContainer 
        isAtBottom={isAtBottom} 
        mobileOnly 
        expanded={showSongControls} 
        className={autoScroll ? 'flex-row' : ''}
      >
        {/* When not playing, show musical controls and text preferences */}
        {!autoScroll && (
          <>
            {/* Expanded song controls row - appears above main controls */}
            {showSongControls && (
              <div className="w-full flex items-end justify-center gap-2 mb-2 transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2">
                <MusicalControls />
              </div>
            )}

            {/* Main controls row */}
            <div className="flex items-center justify-between w-full gap-2">
              {/* Left: TextPreferences and Song button */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">Style</span>
                  <MobileTextPreferences
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
                    fontStyle={fontStyle} setFontStyle={setFontStyle}
                    viewMode={viewMode} setViewMode={setViewMode}
                    hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
                    buttonClassName="h-10 w-10"
                    iconSize={20}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground mb-1">Transpose</span>
                  <Button 
                    variant="outline"
                    size="icon" 
                    className={`h-10 w-10 ${showSongControls ? 'bg-muted/50 text-primary' : ''}`}
                    title="Song Controls"
                    onClick={handleToggleSongControls}
                  >
                    <Music size={20} className={showSongControls ? 'text-primary' : ''} />
                  </Button>
                </div>
              </div>
              
              {/* Right: Play Button */}
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">Play</span>
                <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 ${autoScroll ? 'bg-secondary/20 text-primary hover:bg-primary/20' : ''}`} />
              </div>
            </div>
          </>
        )}
        {/* When playing, TextPreferences on far left, SpeedControl, Play on far right */}
        {autoScroll && (
          <>
            <div className="flex items-center mr-auto ml-0 pl-0">
              <div className="flex flex-col items-start transition-all duration-200 animate-in slide-in-from-right-4">
                <span className="text-xs text-muted-foreground mb-1">Transpose</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSongControls}
                  className={`h-10 w-10 transition-all duration-200 ${showSongControls ? 'bg-muted/50 text-primary' : ''}`}
                >
                  <Music className={`h-4 w-4 transition-colors duration-200 ${showSongControls ? 'text-primary' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex items-start justify-center">
              <div className="flex flex-col items-center h-full">
                <span className="text-xs text-muted-foreground mb-1">Speed</span>
                <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
                  <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">Pause</span>
                <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 ml-2 ${autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`} />
              </div>
            </div>
          </>
        )}
      </StickyBottomContainer>
    </>
  );
};

export default StickyControlsBar;

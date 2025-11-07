import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Music } from 'lucide-react';
import { ChordSheetControlsProps } from '../../types';
import StickyBottomContainer from '../../../StickyBottomContainer';
import { useAtBottom } from '@/hooks/useAtBottom';
import { useCapoTranspose } from '@/hooks/useCapoTranspose';
import CapoMenu from './CapoMenu';
import TransposeMenu from './TransposeMenu';
import CapoTransposeLink from './CapoTransposeLink';
import TextStyleMenu from './TextStyleMenu';
import AutoScrollControls from '../AutoScrollControls';
import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';


type MusicalControlsProps = {
  capo: number;
  defaultCapo?: number;
  capoTransposeLinked?: boolean;
  handleCapoChange: (v: number) => void;
  handleTransposeChange: (v: number) => void;
  getCapoDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
  getTransposeDisableStates: () => { disableIncrement: boolean; disableDecrement: boolean };
  transpose: number;
  defaultTranspose?: number;
  songKey?: string;
  onToggleLink: () => void;
};

const MusicalControls: React.FC<MusicalControlsProps> = (props) => {
  const {
    capo,
    handleCapoChange,
    defaultCapo,
    capoTransposeLinked,
    getCapoDisableStates,
    handleTransposeChange,
    getTransposeDisableStates,
    transpose,
    defaultTranspose,
    songKey,
    onToggleLink,
  } = props;

  return (
    <div className="flex items-center gap-2">
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
          onToggle={onToggleLink}
          title="Link"
        />
      </div>
      <div className='flex flex-col items-center'>
        <TransposeMenu
          transpose={transpose}
          setTranspose={handleTransposeChange}
          defaultTranspose={defaultTranspose}
          songKey={songKey}
          title="Transpose"
          disableIncrement={getTransposeDisableStates().disableIncrement}
          disableDecrement={getTransposeDisableStates().disableDecrement}
        />
      </div>
    </div>
  );
};

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
  setAutoScroll: toggleAutoScroll,
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

  // MusicalControls extracted above as its own component

  const toggleAutoScrollWithStart = (enable?: boolean) => {
    // If the UI thinks we're at the bottom, start auto-scroll from the chord display
    toggleAutoScroll(enable, isAtBottom);
  };

  return (
    <>
      {/* Desktop Layout */}
      <StickyBottomContainer
        isAtBottom={isAtBottom}
        desktopOnly
      >
        {/* Style and Scroll Controls - Left Side */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col">
            <TextStyleMenu
              fontSize={fontSize} setFontSize={setFontSize}
              fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
              fontStyle={fontStyle} setFontStyle={setFontStyle}
              viewMode={viewMode} setViewMode={setViewMode}
              hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
            />
          </div>
          <div className='flex flex-col items-start'>
            <AutoScrollControls
              autoScroll={autoScroll}
              toggleAutoScroll={toggleAutoScrollWithStart}
              scrollSpeed={scrollSpeed}
              setScrollSpeed={setScrollSpeed}
            />
          </div>
        </div>

        {/* Musical Controls Sub-Container - Right Side */}
        <div className="flex items-end gap-1 justify-end">
          <MusicalControls
            capo={capo}
            defaultCapo={defaultCapo}
            capoTransposeLinked={capoTransposeLinked}
            handleCapoChange={handleCapoChange}
            handleTransposeChange={handleTransposeChange}
            getCapoDisableStates={getCapoDisableStates}
            getTransposeDisableStates={getTransposeDisableStates}
            transpose={transpose}
            defaultTranspose={defaultTranspose}
            songKey={songKey}
            onToggleLink={handleToggleLink}
          />
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
                <MusicalControls
                  capo={capo}
                  defaultCapo={defaultCapo}
                  capoTransposeLinked={capoTransposeLinked}
                  handleCapoChange={handleCapoChange}
                  handleTransposeChange={handleTransposeChange}
                  getCapoDisableStates={getCapoDisableStates}
                  getTransposeDisableStates={getTransposeDisableStates}
                  transpose={transpose}
                  defaultTranspose={defaultTranspose}
                  songKey={songKey}
                  onToggleLink={handleToggleLink}
                />
              </div>
            )}

            {/* Main controls row */}
            <div className="flex items-center justify-between w-full gap-2">
              {/* Left: TextPreferences and Song button */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">Style</span>
                  <TextStyleMenu
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontSpacing={fontSpacing} setFontSpacing={setFontSpacing}
                    fontStyle={fontStyle} setFontStyle={setFontStyle}
                    viewMode={viewMode} setViewMode={setViewMode}
                    hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
                    variant="mobile"
                    buttonClassName="h-10 w-10"
                    iconSize={20}
                    dropdownAlign="start"
                    dropdownClassName="mr-4"
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
                <PlayButton autoScroll={autoScroll} toggleAutoScroll={toggleAutoScrollWithStart} size={20} className={`h-10 w-10 ${autoScroll ? 'bg-secondary/20 text-primary hover:bg-primary/20' : ''}`} />
              </div>
            </div>
          </>
        )}
        {/* When playing, show musical controls if expanded, then SpeedControl and Play */}
        {autoScroll && (
          <div className="flex flex-col w-full">
            {/* Expanded song controls row - appears above main controls when playing */}
            {showSongControls && (
              <div className="w-full flex items-end justify-center gap-2 mb-2 transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2">
                <MusicalControls
                  capo={capo}
                  defaultCapo={defaultCapo}
                  capoTransposeLinked={capoTransposeLinked}
                  handleCapoChange={handleCapoChange}
                  handleTransposeChange={handleTransposeChange}
                  getCapoDisableStates={getCapoDisableStates}
                  getTransposeDisableStates={getTransposeDisableStates}
                  transpose={transpose}
                  defaultTranspose={defaultTranspose}
                  songKey={songKey}
                  onToggleLink={handleToggleLink}
                />
              </div>
            )}

            {/* Main controls row - transpose button, speed control, and play button */}
            <div className="flex items-center justify-between w-full">
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
              <div className="flex items-start justify-center h-full">
                <div className="flex flex-col items-center h-full">
                  <span className="text-xs text-muted-foreground mb-1">Speed</span>
                  <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
                    <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">Pause</span>
                  <PlayButton autoScroll={autoScroll} toggleAutoScroll={toggleAutoScrollWithStart} size={20} className={`h-10 w-10 ml-2 ${autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </StickyBottomContainer>
    </>
  );
};

export default StickyControlsBar;

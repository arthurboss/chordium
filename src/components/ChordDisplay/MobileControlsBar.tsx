import PlayButton from './PlayButton';
import SpeedControl from './SpeedControl';
import StickyBottomContainer from '../StickyBottomContainer';
import { useStickyAtBottom } from '@/hooks/use-sticky-at-bottom';
import TextPreferences from './TextPreferencesMenu';
import { ChordSheetControlsProps } from './types';

function MobileControlsBar({
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
}: ChordSheetControlsProps) {
  const isAtBottom = useStickyAtBottom(100);

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
    <StickyBottomContainer isAtBottom={isAtBottom} mobileOnly className={`m-2 mt-0 p-2 border rounded-lg ${!autoScroll && 'w-fit ml-auto'}`}>
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
          <div className="flex items-center mr-auto" style={{ marginLeft: 0, paddingLeft: 0 }}>{MenuButtons}</div>
          <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
          <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 ml-2 ${autoScroll ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`} />
        </>
      )}
    </StickyBottomContainer>
  );
}

export default MobileControlsBar;
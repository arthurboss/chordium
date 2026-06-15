import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChordSheetControlsProps } from "../../types";
import StickyBottomContainer from "../../../StickyBottomContainer";
import { useAtBottom } from "@/hooks/useAtBottom";
import { useCapoTranspose } from "@/hooks/useCapoTranspose";
import CapoMenu from "./CapoMenu";
import TransposeMenu from "./TransposeMenu";
import CapoTransposeLink from "./CapoTransposeLink";
import TextStyleMenu from "./TextStyleMenu";
import TextStylePanel from "./TextStylePanel";
import AutoScrollControls from "../AutoScrollControls";
import PlayButton from "./PlayButton";
import SpeedControl from "./SpeedControl";

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
  const { t } = useTranslation();
  const isAtBottom = useAtBottom({ offset: 60 });
  const [showSongControls, setShowSongControls] = useState(false);
  const [showTextStyle, setShowTextStyle] = useState(false);

  const handleOpenTextStyle = (open: boolean) => {
    setShowTextStyle(open);
    if (open) setShowSongControls(false);
  };

  const handleToggleSongControls = () => {
    setShowSongControls((prev) => {
      if (!prev) setShowTextStyle(false);
      return !prev;
    });
  };

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

  const mobileExpanded = showSongControls || showTextStyle;

  return (
    <>
      {/* Desktop Layout */}
      <StickyBottomContainer isAtBottom={isAtBottom} desktopOnly expanded={showTextStyle}>
        {showTextStyle && (
          <TextStylePanel
            layout="desktop"
            fontSize={fontSize}
            setFontSize={setFontSize}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
        <div className={`flex items-start gap-2 w-full ${showTextStyle ? "pt-2" : "pt-0"}`}>
          <div className="flex flex-col items-start">
            <TextStyleMenu
              fontSize={fontSize} setFontSize={setFontSize}
              fontStyle={fontStyle} setFontStyle={setFontStyle}
              viewMode={viewMode} setViewMode={setViewMode}
              hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
              open={showTextStyle}
              onOpenChange={handleOpenTextStyle}
            />
          </div>
          <div className="flex flex-col items-start">
            <AutoScrollControls
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
              scrollSpeed={scrollSpeed}
              setScrollSpeed={setScrollSpeed}
            />
          </div>
          <div className="flex items-end gap-1 justify-end ml-auto">
            <div className="flex flex-col items-center">
              <CapoMenu
                capo={capo}
                setCapo={handleCapoChange}
                defaultCapo={defaultCapo}
                disableIncrement={getCapoDisableStates().disableIncrement}
                disableDecrement={getCapoDisableStates().disableDecrement}
              />
            </div>
            <div className="flex flex-col items-center">
              <CapoTransposeLink isLinked={capoTransposeLinked} onToggle={handleToggleLink} />
            </div>
            <div className="flex flex-col items-center">
              <TransposeMenu
                transpose={transpose}
                setTranspose={handleTransposeChange}
                defaultTranspose={defaultTranspose}
                songKey={songKey}
                disableIncrement={getTransposeDisableStates().disableIncrement}
                disableDecrement={getTransposeDisableStates().disableDecrement}
              />
            </div>
          </div>
        </div>
      </StickyBottomContainer>

      {/* Mobile Layout */}
      <StickyBottomContainer
        isAtBottom={isAtBottom}
        mobileOnly
        expanded={mobileExpanded}
        className={autoScroll ? "flex-row" : ""}
      >
        {!autoScroll && (
          <>
            {showTextStyle && (
              <TextStylePanel
                layout="mobile"
                fontSize={fontSize}
                setFontSize={setFontSize}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {showSongControls && (
              <div className="w-full flex items-end justify-center gap-2 mb-2 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col items-center">
                  <CapoMenu
                    capo={capo}
                    setCapo={handleCapoChange}
                    defaultCapo={defaultCapo}
                    disableIncrement={getCapoDisableStates().disableIncrement}
                    disableDecrement={getCapoDisableStates().disableDecrement}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <CapoTransposeLink isLinked={capoTransposeLinked} onToggle={handleToggleLink} />
                </div>
                <div className="flex flex-col items-center">
                  <TransposeMenu
                    transpose={transpose}
                    setTranspose={handleTransposeChange}
                    defaultTranspose={defaultTranspose}
                    songKey={songKey}
                    disableIncrement={getTransposeDisableStates().disableIncrement}
                    disableDecrement={getTransposeDisableStates().disableDecrement}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                                  <TextStyleMenu
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontStyle={fontStyle} setFontStyle={setFontStyle}
                    viewMode={viewMode} setViewMode={setViewMode}
                    hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
                    variant="mobile"
                    buttonClassName="h-10 w-10 rounded-full"
                    iconSize={20}
                    open={showTextStyle}
                    onOpenChange={handleOpenTextStyle}
                  />
                <div className="flex flex-col items-start">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${showSongControls ? "bg-muted/50 text-primary" : ""}`}
                    title={t("stickyControlsBar.songControls")}
                    onClick={handleToggleSongControls}
                  >
                    <Music size={20} className={showSongControls ? "text-primary" : ""} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 rounded-full ${autoScroll ? "bg-secondary/20 text-primary hover:bg-primary/20" : ""}`} />
              </div>
            </div>
          </>
        )}
        {autoScroll && (
          <div className="flex flex-col w-full">
            {showSongControls && (
              <div className="w-full flex items-end justify-between mb-2 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col items-center">
                  <CapoMenu
                    capo={capo}
                    setCapo={handleCapoChange}
                    defaultCapo={defaultCapo}
                    disableIncrement={getCapoDisableStates().disableIncrement}
                    disableDecrement={getCapoDisableStates().disableDecrement}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <CapoTransposeLink isLinked={capoTransposeLinked} onToggle={handleToggleLink} />
                </div>
                <div className="flex flex-col items-center">
                  <TransposeMenu
                    transpose={transpose}
                    setTranspose={handleTransposeChange}
                    defaultTranspose={defaultTranspose}
                    songKey={songKey}
                    disableIncrement={getTransposeDisableStates().disableIncrement}
                    disableDecrement={getTransposeDisableStates().disableDecrement}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center mr-auto ml-0 pl-0">
                                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSongControls}
                    className={`h-10 w-10 rounded-full transition-all duration-200 ${showSongControls ? "bg-muted/50 text-primary" : ""}`}
                  >
                    <Music className={`h-4 w-4 transition-colors duration-200 ${showSongControls ? "text-primary" : ""}`} />
                  </Button>
              </div>
              <div className="flex items-start justify-center h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="transition-all duration-200 animate-in slide-in-from-right-16 flex-1 flex items-center justify-center px-2">
                    <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 rounded-full ml-2 ${autoScroll ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`} />
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

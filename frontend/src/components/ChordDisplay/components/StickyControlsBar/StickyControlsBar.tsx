import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChordSheetControlsProps } from "../../types";
import StickyBottomContainer from "../../../StickyBottomContainer";
import { useAtBottom } from "@/hooks/useAtBottom";
import TextStyleMenu from "./TextStyleMenu";
import TextStylePanel from "./TextStylePanel";
import AutoScrollControls from "../AutoScrollControls";
import PlayButton from "./PlayButton";
import SpeedControl from "./SpeedControl";

const StickyControlsBar: React.FC<ChordSheetControlsProps> = ({
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
}) => {
  const { t } = useTranslation();
  const isAtBottom = useAtBottom({ offset: 60 });
  const [showTextStyle, setShowTextStyle] = useState(false);

  const handleOpenTextStyle = (open: boolean) => {
    setShowTextStyle(open);
  };

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
        </div>
      </StickyBottomContainer>

      {/* Mobile Layout */}
      <StickyBottomContainer
        isAtBottom={isAtBottom}
        mobileOnly
        expanded={showTextStyle}
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
              </div>

              <div className="flex flex-col items-center">
                <PlayButton autoScroll={autoScroll} setAutoScroll={setAutoScroll} size={20} className={`h-10 w-10 rounded-full ${autoScroll ? "bg-secondary/20 text-primary hover:bg-primary/20" : ""}`} />
              </div>
            </div>
          </>
        )}
        {autoScroll && (
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-start justify-center h-full ml-auto">
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

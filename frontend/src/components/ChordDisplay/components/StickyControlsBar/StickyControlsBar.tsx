import React, { useState } from "react";
import { useSyncExternalStore } from "react";
import { ChordSheetControlsProps } from "../../types";
import StickyBottomContainer from "../../../StickyBottomContainer";
import { useAtBottom } from "@/hooks/useAtBottom";
import TextStyleMenu from "./TextStyleMenu";
import TextStylePanel from "./TextStylePanel";
import SpeedControl from "./SpeedControl";
import PlayButton from "./PlayButton";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

function useAtTop(offset = 10): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("scroll", cb, { passive: true });
      return () => window.removeEventListener("scroll", cb);
    },
    () => window.scrollY <= offset,
    () => true
  );
}

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
  const isAtBottom = useAtBottom({ offset: 60 });
  const isAtTop = useAtTop();
  const [showTextStyle, setShowTextStyle] = useState(false);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StickyBottomContainer isAtBottom={isAtBottom} expanded={showTextStyle}>
      {showTextStyle && (
        <TextStylePanel
          layout="mobile"
          fontSize={fontSize}
          setFontSize={setFontSize}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}
      <div className={`flex items-center gap-2 ${showTextStyle ? "pt-2" : "pt-0"}`}>
        <PlayButton
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          size={20}
          className={`h-10 w-10 rounded-full ${autoScroll ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
        />
        {autoScroll && (
          <div className="transition-all duration-200 animate-in slide-in-from-left-2">
            <SpeedControl autoScroll={autoScroll} scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
          </div>
        )}
        <TextStyleMenu
          fontSize={fontSize} setFontSize={setFontSize}
          fontStyle={fontStyle} setFontStyle={setFontStyle}
          viewMode={viewMode} setViewMode={setViewMode}
          hideGuitarTabs={hideGuitarTabs} setHideGuitarTabs={setHideGuitarTabs}
          variant="mobile"
          buttonClassName="h-10 w-10 rounded-full"
          iconSize={20}
          open={showTextStyle}
          onOpenChange={(open) => setShowTextStyle(open)}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={handleScrollToTop}
          disabled={isAtTop}
          title="Scroll to top"
        >
          <ArrowUp size={20} />
        </Button>
      </div>
    </StickyBottomContainer>
  );
};

export default StickyControlsBar;

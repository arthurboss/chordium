import React, { useState, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { ChordSheetControlsProps } from "../../types";
import StickyBottomContainer from "../../../StickyBottomContainer";
import { useAtBottom } from "@/hooks/useAtBottom";
import { getScrollContainer, scrollContainerTo } from "@/utils/scroll-container";
import SpeedControl from "./SpeedControl";
import PlayButton from "./PlayButton";
import { Button } from "@/components/ui/button";
import { ArrowUp, Languages, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

function useAtTop(container: HTMLElement | null, offset = 10): boolean {
  return useSyncExternalStore(
    (cb) => {
      const target: HTMLElement | Window = container ?? window;
      target.addEventListener("scroll", cb, { passive: true });
      return () => target.removeEventListener("scroll", cb);
    },
    () => (container ? container.scrollTop : window.scrollY) <= offset,
    () => true
  );
}

const StickyControlsBar: React.FC<ChordSheetControlsProps> = ({
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
  isFullscreen = false,
  onToggleFullscreen,
  canInterleave = false,
  isInterleaved = false,
  onToggleInterleave,
}) => {
  // Fullscreen makes the viewer its own scrolling box, so the controls have to read
  // and drive that element instead of the window.
  const scrollContainer = isFullscreen ? getScrollContainer() : null;
  const isAtBottom = useAtBottom({ element: scrollContainer, offset: 60 });
  const isAtTop = useAtTop(scrollContainer);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!autoScroll) setCollapsed(false);
  }, [autoScroll]);

  const handleScrollToTop = () => {
    scrollContainerTo(0);
  };

  const speedVisible = autoScroll && !collapsed;

  return (
    <StickyBottomContainer isAtBottom={isAtBottom}>
      <div className="flex items-center gap-1">
        <PlayButton
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          size={20}
          className={`h-10 w-10 rounded-full ${autoScroll ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
        />
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            speedVisible ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          <SpeedControl scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
        </div>
        {canInterleave && (
          <Button
            variant="outline"
            size="icon"
            className={`h-10 w-10 rounded-full ${isInterleaved ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
            onClick={onToggleInterleave}
            title={isInterleaved ? "Hide the translation" : "Show the translation line by line"}
          >
            <Languages size={20} />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={autoScroll ? () => setCollapsed((c) => !c) : handleScrollToTop}
          disabled={!autoScroll && isAtTop}
          title={autoScroll ? (collapsed ? "Show speed control" : "Hide speed control") : "Scroll to top"}
        >
          {autoScroll ? (
            collapsed ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />
          ) : (
            <ArrowUp size={20} />
          )}
        </Button>
      </div>
    </StickyBottomContainer>
  );
};

export default StickyControlsBar;

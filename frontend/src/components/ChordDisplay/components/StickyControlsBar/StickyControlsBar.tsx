import React, { useState, useEffect } from "react";
import { useSyncExternalStore } from "react";
import { ChordSheetControlsProps } from "../../types";
import StickyBottomContainer from "../../../StickyBottomContainer";
import { useAtBottom } from "@/hooks/useAtBottom";
import SpeedControl from "./SpeedControl";
import PlayButton from "./PlayButton";
import { Button } from "@/components/ui/button";
import { ArrowUp, PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
  autoScroll,
  setAutoScroll,
  scrollSpeed,
  setScrollSpeed,
}) => {
  const isAtBottom = useAtBottom({ offset: 60 });
  const isAtTop = useAtTop();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!autoScroll) setCollapsed(false);
  }, [autoScroll]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

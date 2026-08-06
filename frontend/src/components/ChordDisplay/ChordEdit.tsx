import React, { useState } from "react";
import { ChordEditProps } from "./types";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import ChordProPreview from "./ChordProPreview";

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent, fontSize, fontFamily }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewStyle: React.CSSProperties = {
    fontSize: fontSize ? `${fontSize}px` : undefined,
    fontFamily: fontFamily ?? "inherit",
  };

  return (
    <div
      className={
        isFullScreen
          ? "fixed inset-0 z-50 flex flex-col gap-2 bg-background p-4"
          : "relative flex w-full flex-col gap-2"
      }
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-end"
        onClick={() => setIsFullScreen((v) => !v)}
        title={isFullScreen ? "Exit full screen" : "Enter full screen"}
      >
        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <div className="flex flex-1 flex-col gap-4 overflow-hidden md:flex-row">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className={
            isFullScreen
              ? "flex-1 resize-none !bg-primary/5 font-mono text-sm md:w-1/2"
              : "min-h-[500px] font-mono text-sm resize-none !bg-primary/5 md:w-1/2"
          }
          autoFocus
        />
        <div
          className={
            isFullScreen
              ? "flex-1 overflow-y-auto rounded-lg border shadow-xs bg-card px-4 py-6 sm:px-6 md:w-1/2"
              : "min-h-[500px] w-full overflow-y-auto rounded-lg border shadow-xs bg-card px-4 py-6 sm:px-6 md:w-1/2"
          }
          style={previewStyle}
        >
          <ChordProPreview text={editContent} />
        </div>
      </div>
    </div>
  );
};

export default ChordEdit;

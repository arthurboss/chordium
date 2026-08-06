import React, { useState } from "react";
import { ChordEditProps } from "./types";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import ChordProPreview from "./ChordProPreview";

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

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
      <div className={isFullScreen ? "flex flex-1 gap-4 overflow-hidden md:flex-row" : "flex flex-1 flex-col gap-4 md:flex-row"}>
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
              ? "flex-1 overflow-y-auto rounded-md border border-input bg-card px-3 py-2 text-sm md:w-1/2"
              : "min-h-[500px] w-full overflow-y-auto rounded-md border border-input bg-card px-3 py-2 text-sm md:w-1/2"
          }
        >
          <ChordProPreview text={editContent} />
        </div>
      </div>
    </div>
  );
};

export default ChordEdit;

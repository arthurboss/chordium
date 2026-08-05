import React from "react";
import { ChordEditProps } from "./types";
import { Textarea } from "../ui/textarea";
import ChordProPreview from "./ChordProPreview";

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent }) => {
  return (
    <div className="w-full mx-auto flex flex-col gap-4 md:flex-row">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="min-h-[500px] font-mono text-sm resize-none !bg-primary/5 md:w-1/2"
        autoFocus
      />
      <div className="min-h-[500px] w-full overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm md:w-1/2">
        <ChordProPreview text={editContent} />
      </div>
    </div>
  );
};

export default ChordEdit;

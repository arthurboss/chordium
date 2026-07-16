import React from "react";
import { ChordEditProps } from "./types";
import { Textarea } from "../ui/textarea";

const ChordEdit: React.FC<ChordEditProps> = ({ editContent, setEditContent }) => {
  return (
    <div className="w-full mx-auto flex flex-col">
      <Textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="min-h-[500px] font-mono text-sm resize-none !bg-primary/5"
        autoFocus
      />
    </div>
  );
};

export default ChordEdit;

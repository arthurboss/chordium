import React from "react";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import { Card, CardContent } from "@/components/ui/card";
import type { ChordSheetCardProps } from "./ChordSheetCard.types";
import { cyAttr } from "@/utils/test-utils";

/**
 * Card component for displaying a saved chord sheet in the user's library.
 */
const ChordSheetCard: React.FC<ChordSheetCardProps> = ({ chordSheet, onView, onDelete }) => {
  return (
    <Card className="w-full overflow-hidden cursor-pointer hover:border-primary/70 hover:text-primary transition-colors duration-300" {...cyAttr(`chordsheet-card-${chordSheet.path}`)}>
      <CardContent
        className="flex-1 flex flex-col justify-between p-4"
        onClick={() => onView(chordSheet)}
        {...cyAttr(`chordsheet-card-content-${chordSheet.path}`)}
      >
        <div className="flex gap-2 w-full items-center">
          <div className="min-w-0 flex-1">
            <h3
              className="w-full block font-semibold truncate text-base mb-1"
              title={chordSheet.title}
              {...cyAttr(`chordsheet-title-${chordSheet.path}`)}
            >
              {chordSheet.title}
            </h3>
            <p
              className="text-muted-foreground text-sm truncate w-full block"
              title={chordSheet.artist}
              {...cyAttr(`chordsheet-artist-${chordSheet.path}`)}
            >
              {chordSheet.artist}
            </p>
          </div>
          <RoundTrashButton
            onClick={e => { e.stopPropagation(); onDelete(chordSheet); }}
            aria-label={`Delete chord sheet ${chordSheet.title}`}
            tabIndex={0}
            {...cyAttr(`delete-btn-${chordSheet.path}`)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ChordSheetCard);

import React from "react";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ChordSheetCardProps } from "./ChordSheetCard.types";
import { cyAttr } from "@/utils/test-utils";

/**
 * Card component for displaying a saved chord sheet in the user's library.
 */
const ChordSheetCard: React.FC<ChordSheetCardProps> = ({ chordSheet, onView, onDelete }) => {
  return (
    <Card className="h-18 w-full overflow-hidden cursor-pointer hover:border-primary/70 hover:text-primary transition-colors duration-300" {...cyAttr(`chordsheet-card-${chordSheet.path}`)}>
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
          <button
            className="flex justify-center items-center h-10 w-10 border border-red-500 rounded-full text-destructive dark:text-red-500 hover:bg-red-100 dark:hover:bg-opacity-40 dark:hover:bg-destructive/30 transition-colors duration-300"
            onClick={(e) => { e.stopPropagation(); onDelete(chordSheet) }}
            type="button"
            tabIndex={0}
            aria-label={`Delete chord sheet ${chordSheet.title}`}
            {...cyAttr(`delete-btn-${chordSheet.path}`)}
          >
            <Trash2 className="h-4 center" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ChordSheetCard);

import React from "react";
import { Music, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ChordSheetCardProps } from "./ChordSheetCard.types";
import { cyAttr } from "@/utils/test-utils";

/**
 * Card component for displaying a saved chord sheet in the user's library.
 */
const ChordSheetCard: React.FC<ChordSheetCardProps> = ({ chordSheet, onView, onDelete }) => {
  return (
    <Card className="overflow-hidden cursor-pointer w-full h-28" {...cyAttr(`chordsheet-card-${chordSheet.path}`)}>
      <CardContent
        className="flex-1 flex flex-col justify-between p-4 pb-2"
        onClick={() => onView(chordSheet)}
        {...cyAttr(`chordsheet-card-content-${chordSheet.path}`)}
      >
        <div className="flex items-start gap-2 w-full">
          <Music className="h-6 w-6 text-chord mt-1" />
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
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between">
        <button
          className="text-chord hover:underline font-medium text-sm flex items-center gap-1"
          onClick={() => onView(chordSheet)}
          tabIndex={0}
          aria-label={`View chord sheet ${chordSheet.title}`}
          {...cyAttr(`view-btn-${chordSheet.path}`)}
        >
          View
        </button>
        <button
          className="text-destructive dark:text-red-500 hover:underline text-sm flex items-center gap-1"
          onClick={() => onDelete(chordSheet)}
          tabIndex={0}
          aria-label={`Delete chord sheet ${chordSheet.title}`}
          {...cyAttr(`delete-btn-${chordSheet.path}`)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </button>
      </CardFooter>
    </Card>
  );
};

export default React.memo(ChordSheetCard);

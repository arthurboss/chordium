import React from "react";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import { Card, CardContent } from "@/components/ui/card";
import type { ChordSheetCardProps } from "./ChordSheetCard.types";
import { cyAttr } from "@/utils/test-utils";

/**
 * Card component for displaying a saved chord sheet in the user's library.
 */
const ChordSheetCard: React.FC<ChordSheetCardProps> = ({ metadata, onView, onDelete }) => {
  return (
    <Card className="w-full overflow-hidden cursor-pointer hover:border-primary/70 hover:text-primary transition-colors duration-300" {...cyAttr(`chordsheet-card-${metadata.path}`)}>
      <CardContent
        className="flex-1 flex flex-col justify-between p-4"
        onClick={() => onView(metadata)}
        {...cyAttr(`chordsheet-card-content-${metadata.path}`)}
      >
        <div className="flex gap-2 w-full items-center">
          <div className="min-w-0 flex-1">
            <h3
              className="w-full block font-semibold truncate text-base mb-1"
              title={metadata.title}
              {...cyAttr(`chordsheet-title-${metadata.path}`)}
            >
              {metadata.title}
            </h3>
            <p
              className="text-muted-foreground text-sm truncate w-full block"
              title={metadata.artist}
              {...cyAttr(`chordsheet-artist-${metadata.path}`)}
            >
              {metadata.artist}
            </p>
          </div>
          <RoundTrashButton
            onClick={e => { e.stopPropagation(); onDelete(metadata); }}
            aria-label={`Delete chord sheet ${metadata.title}`}
            tabIndex={0}
            {...cyAttr(`delete-btn-${metadata.path}`)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ChordSheetCard);

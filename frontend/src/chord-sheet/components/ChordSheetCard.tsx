import React from "react";
import RoundTrashButton from "@/components/ui/RoundTrashButton";
import { Card, CardContent } from "@/components/ui/card";
import type { ChordSheetCardProps } from "./ChordSheetCard.types";
import { cyAttr } from "@/utils/test-utils";

const ChordSheetCard: React.FC<ChordSheetCardProps> = ({ chordSheet, onView, onDelete }) => {
  const handleClick = () => {
    onView(chordSheet);
  };

  const tuningNotes = chordSheet.guitarTuning ? chordSheet.guitarTuning.join(" ") : null;
  const capoText = chordSheet.guitarCapo ? `Capo ${chordSheet.guitarCapo}` : null;
  const keyText = chordSheet.songKey ?? null;

  const leftMetadata: string[] = [];
  if (keyText) leftMetadata.push(keyText);
  if (capoText) leftMetadata.push(capoText);

  return (
    <Card
      className="w-full overflow-hidden cursor-pointer transition-colors duration-300 border bg-card border-border hover:bg-primary/5 dark:hover:bg-primary/5 hover:border-primary hover:text-primary"
      {...cyAttr(`chordsheet-card-${chordSheet.path}`)}
    >
      <CardContent
        className="p-3 flex items-center gap-3 w-full"
        onClick={handleClick}
        {...cyAttr(`chordsheet-card-content-${chordSheet.path}`)}
      >
        <div className="min-w-0 flex-1">
          <h3
            className="w-full block font-semibold truncate text-sm"
            title={chordSheet.title}
            {...cyAttr(`chordsheet-title-${chordSheet.path}`)}
          >
            {chordSheet.title}
          </h3>
          <p
            className="text-muted-foreground text-xs truncate w-full block"
            title={chordSheet.artist}
            {...cyAttr(`chordsheet-artist-${chordSheet.path}`)}
          >
            {chordSheet.artist}
          </p>
          <div className="h-px bg-linear-to-r from-border/60 from-25% to-transparent my-1.5" />
          <div className="flex items-center justify-between gap-2">
            {leftMetadata.length > 0 && (
              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                {leftMetadata.map((item, idx) => (
                  <span key={idx} className="truncate">
                    {idx > 0 && <span className="mr-1">•</span>}
                    {item}
                  </span>
                ))}
              </div>
            )}
            {tuningNotes && (
              <span className="text-xs text-muted-foreground shrink-0 font-mono">
                {tuningNotes}
              </span>
            )}
          </div>
        </div>
        <RoundTrashButton
          onClick={(e) => { e.stopPropagation(); onDelete(chordSheet); }}
          aria-label={`Delete chord sheet ${chordSheet.title}`}
          tabIndex={0}
          {...cyAttr(`delete-btn-${chordSheet.path}`)}
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(ChordSheetCard);

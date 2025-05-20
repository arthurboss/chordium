import React from "react";
import { Music, Trash2, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SongData } from "../types/song";
import { cyAttr } from "@/utils/test-utils";

interface SongCardProps {
  song: SongData;
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
  deleteButtonIcon?: "trash" | "plus";
  deleteButtonLabel?: string;
  viewButtonIcon?: "view" | "external";
  viewButtonLabel?: string;
}

const SongCard = React.memo(({ 
  song, 
  onView, 
  onDelete,
  deleteButtonIcon = "trash",
  deleteButtonLabel,
  viewButtonIcon = "view",
  viewButtonLabel
}: SongCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer" {...cyAttr(`song-card-${song.id}`)}>
      <CardContent 
        className="p-4" 
        onClick={() => onView(song)}
        {...cyAttr(`song-card-content-${song.id}`)}
      >
        <div className="flex items-start gap-2">
          <Music className="h-6 w-6 text-chord mt-1" />
          <div>
            <h3 className="font-semibold text-base" {...cyAttr(`song-title-${song.id}`)}>{song.title}</h3>
            {song.artist && (
              <p className="text-muted-foreground text-sm" {...cyAttr(`song-artist-${song.id}`)}>{song.artist}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <button 
          className="text-chord hover:underline font-medium text-sm flex items-center gap-1"
          onClick={() => onView(song)}
          tabIndex={0}
          aria-label={viewButtonLabel || `View chords for ${song.title}`}
          {...cyAttr(`view-chords-btn-${song.id}`)}
        >
          {viewButtonIcon === 'external' ? (
            <ExternalLink className="h-3 w-3" />
          ) : null}
          {viewButtonLabel || "View Chords"}
        </button>
        <button 
          className={`${deleteButtonIcon === 'plus' ? 'text-primary' : 'text-destructive dark:text-red-500'} hover:underline text-sm flex items-center gap-1`}
          onClick={() => onDelete(song.id)}
          tabIndex={0}
          aria-label={deleteButtonLabel || `Delete ${song.title}`}
          {...cyAttr(`delete-song-btn-${song.id}`)}
        >
          {deleteButtonIcon === 'plus' ? (
            <Plus className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {deleteButtonLabel ? <span className="sr-only">{deleteButtonLabel}</span> : null}
        </button>
      </CardFooter>
    </Card>
  );
});

export default SongCard;

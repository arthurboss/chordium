import type { Song } from "../types/song";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";

interface SongListProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
  onDeleteSong: (songPath: string) => void;
  onUploadClick: () => void;
  tabState?: { scroll: number };
  setTabState?: (state: { scroll: number }) => void;
}


import { useRef } from "react";
import { useRestoreScrollPosition, usePersistScrollPosition } from "@/hooks/useScrollPosition";

const SongList = ({ songs, onSongSelect, onDeleteSong, onUploadClick, tabState, setTabState }: SongListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useRestoreScrollPosition(listRef, tabState?.scroll);
  usePersistScrollPosition(listRef, setTabState ? (scroll) => setTabState({ scroll }) : undefined);

  return (
    <div ref={listRef} style={{ maxHeight: "60vh", overflowY: "auto" }}>
      {songs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[...songs].reverse().map((song, index) => (
            <ResultCard
              key={`${song.path}-${index}`}
              icon="music"
              title={song.title}
              subtitle={song.artist}
              onView={(path) => onSongSelect(song)}
              onDelete={onDeleteSong}
              path={song.path}
              isDeletable={true}
              song={song}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-3">You haven't saved any songs yet.</p>
          <Button
            onClick={onUploadClick}
            variant="outline"
            tabIndex={0}
            aria-label="Upload a chord sheet"
          >
            Upload a chord sheet
          </Button>
        </div>
      )}
    </div>
  );
};

export default SongList;

import React from "react";
import { Clock, User, Music, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import type { SearchHistoryEntry } from "@/search/hooks/useSearchHistory";

interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onSelect: (artist: string, song: string, searchType: string, displayName: string) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  async function handleConfirmClear() {
    await searchCacheService.clear();
    onClear();
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1 leading-7">
          <Clock className="h-3 w-3" />
          Recent searches
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="group text-xs text-muted-foreground flex items-center gap-1 transition-colors hover:bg-transparent focus:outline-none">
              <Trash2 className="h-3 w-3 text-destructive/50 group-hover:text-destructive transition-colors" />
              Clear
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear recent searches?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all recent search history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClear}>Clear</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="grid grid-cols-1 gap-y-2">
        {history.map(({ artist, song, searchType, displayName, timestamp }) => {
          let label: string;
          let Icon: React.ElementType;

          if (searchType === "artist-song") {
            label = displayName || artist;
            Icon = User;
          } else if (searchType === "song" && artist && song) {
            label = displayName || `${artist} — ${song}`;
            Icon = Music;
          } else if (searchType === "song") {
            label = song;
            Icon = Music;
          } else {
            label = artist;
            Icon = Search;
          }

          return (
            <Card
              key={timestamp}
              className="overflow-hidden cursor-pointer w-full h-12 min-h-0 opacity-80 hover:bg-primary/5 dark:hover:bg-primary/5 hover:border-primary transition-colors"
              onClick={() => onSelect(artist, song, searchType, displayName)}
            >
              <CardContent
                className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
                onClick={() => onSelect(artist, song, searchType, displayName)}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary shrink-0"><Icon className="h-4 w-4 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="w-full block font-semibold truncate text-sm" title={label}>
                    {label}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SearchHistory;

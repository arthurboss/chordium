import React from "react";
import { Clock, Search, Trash2 } from "lucide-react";
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
            <button className="group text-xs text-muted-foreground flex items-center gap-1 transition-colors hover:bg-transparent dark:hover:text-white focus:outline-none">
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
          const label =
            searchType === "artist-song" ? (displayName || artist) :
            searchType === "song" && artist && song ? (displayName || `${artist} — ${song}`) :
            searchType === "song" ? song : artist;

          return (
            <Card
              key={timestamp}
              className="cursor-pointer w-full h-12 min-h-0 card-hoverable transition-colors group opacity-75 hover:opacity-100"
              onClick={() => onSelect(artist, song, searchType, displayName)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(artist, song, searchType, displayName); }}
            >
              <CardContent className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full border border-primary/50 bg-primary/15 text-primary shrink-0 transition-colors group-hover:bg-primary/25">
                  <Search className="h-4 w-4" />
                </div>
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

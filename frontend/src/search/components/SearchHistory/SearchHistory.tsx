import React from "react";
import { Clock, User, Music, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchHistoryEntry } from "@/search/hooks/useSearchHistory";

interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onSelect: (artist: string, song: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <p className="text-xs text-muted-foreground px-1 mb-2 flex items-center gap-1 leading-7">
        <Clock className="h-3 w-3" />
        Recent searches
      </p>
      <div className="grid grid-cols-1 gap-y-2">
        {history.map(({ artist, song, searchType, displayName, timestamp }) => {
          let label: string;
          let Icon: React.ElementType;

          if (searchType === "artist-song") {
            // selected artist from artist+song search: show artist display name
            label = displayName || artist;
            Icon = User;
          } else if (searchType === "song" && artist && song) {
            // artist+song query: show both terms
            label = displayName || `${artist} — ${song}`;
            Icon = Music;
          } else if (searchType === "song") {
            // song-only search
            label = song;
            Icon = Music;
          } else {
            // artist-only search: use magnifier, show the query term
            label = artist;
            Icon = Search;
          }

          return (
            <Card
              key={timestamp}
              className="overflow-hidden cursor-pointer w-full h-12 min-h-0 opacity-60"
              onClick={() => onSelect(artist, song)}
            >
              <CardContent
                className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
                onClick={() => onSelect(artist, song)}
              >
                <Icon className="h-6 w-6 text-chord" />
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

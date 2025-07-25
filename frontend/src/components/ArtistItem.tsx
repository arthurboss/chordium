import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Artist } from '@/types/artist';
import { ChevronRight } from "lucide-react";

interface ArtistItemProps {
  item: Artist;
  style?: React.CSSProperties;
  onArtistSelect?: (artist: Artist) => void;
}

const ArtistItem: React.FC<ArtistItemProps> = ({ item, style, onArtistSelect }) => {
  const handleViewArtist = () => {
    if (onArtistSelect) {
      onArtistSelect(item);
    }
  };

  return (
    <div style={style} key={item.path}>
      <ResultCard
        icon="user"
        title={item.displayName}
        onView={handleViewArtist}
        path={item.path}
        viewButtonIcon="none" // Use the "none" option to hide the view button
        isDeletable={false}
        compact
        rightElement={<ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />}
      />
    </div>
  );
};

export default React.memo(ArtistItem);

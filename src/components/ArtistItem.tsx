import React from 'react';
import ResultCard from "@/components/ResultCard";
import { Artist } from '@/types/artist';

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
        idOrUrl={item.path}
        viewButtonIcon="external"
        viewButtonLabel="See Artist Songs"
        isDeletable={false}
        compact
      />
    </div>
  );
};

export default React.memo(ArtistItem);

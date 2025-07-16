import React from "react";

interface SongChordDetailsProps {
  songKey?: string;
  tuning?: string;
  capo?: string;
}

const SongChordDetails: React.FC<SongChordDetailsProps> = ({ songKey, tuning, capo }) => {
  if (!songKey && !tuning && !capo) return null;
  
  return (
    <div className="flex flex-wrap gap-3 text-sm mb-4">
      {songKey && (
        <div className="inline-flex items-center rounded-md border px-3 py-1 bg-muted">
          <span className="font-medium text-muted-foreground">Key:</span>
          <span className="ml-2 font-medium">{songKey}</span>
        </div>
      )}
      
      {tuning && (
        <div className="inline-flex items-center rounded-md border px-3 py-1 bg-muted">
          <span className="font-medium text-muted-foreground">Tuning:</span>
          <span className="ml-2 font-medium">{tuning}</span>
        </div>
      )}
      
      {capo && (
        <div className="inline-flex items-center rounded-md border px-3 py-1 bg-muted">
          <span className="font-medium text-muted-foreground">Capo:</span>
          <span className="ml-2 font-medium">{capo}</span>
        </div>
      )}
    </div>
  );
};

export default SongChordDetails;

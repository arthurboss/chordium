import React from "react";

interface SongChordDetailsProps {
  tuning?: string;
}

const SongChordDetails: React.FC<SongChordDetailsProps> = ({ tuning }) => {
  if (!tuning) return null;
  
  return (
    <div className="flex flex-wrap gap-3 text-sm mb-4">
      <div className="inline-flex items-center rounded-md border px-3 py-1 bg-muted">
        <span className="font-medium text-muted-foreground">Tuning:</span>
        <span className="ml-2 font-medium">{tuning}</span>
      </div>
    </div>
  );
};

export default SongChordDetails;

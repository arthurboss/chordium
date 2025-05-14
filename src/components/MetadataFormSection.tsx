import SongMetadataForm from '@/components/SongMetadataForm';

interface MetadataFormSectionProps {
  show: boolean;
  title: string;
  artist: string;
  songKey: string;
  guitarTuning: string;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onSongKeyChange: (key: string) => void;
  onGuitarTuningChange: (tuning: string) => void;
  onContinue: () => void;
}

/**
 * Component that renders the song metadata form section
 */
const MetadataFormSection = ({
  show,
  title,
  artist,
  songKey,
  guitarTuning,
  onTitleChange,
  onArtistChange,
  onSongKeyChange,
  onGuitarTuningChange,
  onContinue
}: MetadataFormSectionProps) => {
  if (!show) return null;
  
  return (
    <div className="mt-6">
      <SongMetadataForm
        title={title}
        artist={artist}
        songKey={songKey}
        guitarTuning={guitarTuning}
        onTitleChange={onTitleChange}
        onArtistChange={onArtistChange}
        onSongKeyChange={onSongKeyChange}
        onGuitarTuningChange={onGuitarTuningChange}
        onContinue={onContinue}
      />
    </div>
  );
};

export default MetadataFormSection;

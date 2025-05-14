import SongMetadataForm from '@/components/SongMetadataForm';

interface MetadataFormSectionProps {
  show: boolean;
  title: string;
  artist: string;
  songTuning: string;
  guitarTuning: string;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onSongTuningChange: (tuning: string) => void;
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
  songTuning,
  guitarTuning,
  onTitleChange,
  onArtistChange,
  onSongTuningChange,
  onGuitarTuningChange,
  onContinue
}: MetadataFormSectionProps) => {
  if (!show) return null;
  
  return (
    <div className="mt-6">
      <SongMetadataForm
        title={title}
        artist={artist}
        songTuning={songTuning}
        guitarTuning={guitarTuning}
        onTitleChange={onTitleChange}
        onArtistChange={onArtistChange}
        onSongTuningChange={onSongTuningChange}
        onGuitarTuningChange={onGuitarTuningChange}
        onContinue={onContinue}
      />
    </div>
  );
};

export default MetadataFormSection;

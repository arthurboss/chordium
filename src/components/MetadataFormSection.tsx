import SongMetadataForm from '@/components/SongMetadataForm';
import StickyBottomContainer from './StickyBottomContainer';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useStickyAtBottom } from '@/hooks/use-sticky-at-bottom';

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
  const isAtBottom = useStickyAtBottom(30);
  if (!show) return null;

  const isNextDisabled = !title || !artist;

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
      />
      <StickyBottomContainer isAtBottom={isAtBottom} className="flex justify-end items-end p-3 sm:p-4">
        <Button
          onClick={onContinue}
          variant="outline"
          size="sm"
          className=""
          aria-label="Continue to edit"
          disabled={isNextDisabled}
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          Next
        </Button>
      </StickyBottomContainer>
    </div>
  );
};

export default MetadataFormSection;

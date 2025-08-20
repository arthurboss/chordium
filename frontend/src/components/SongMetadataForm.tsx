import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FormField from "@/components/ui/form-field";
import FormContainer from "@/components/ui/FormContainer";
import GuitarCapoField from "@/components/ui/guitar-capo-field";

interface SongMetadataFormProps {
  title: string;
  artist: string;
  songKey: string;
  guitarTuning: string;
  guitarCapo: number;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onSongKeyChange: (key: string) => void;
  onGuitarTuningChange: (tuning: string) => void;
  onGuitarCapoChange: (capo: number) => void;
  onContinue: () => void;
}

const SongMetadataForm: React.FC<SongMetadataFormProps> = ({
  title,
  artist,
  songKey,
  guitarTuning,
  guitarCapo,
  onTitleChange,
  onArtistChange,
  onSongKeyChange,
  onGuitarTuningChange,
  onGuitarCapoChange,
  onContinue,
}) => {
  return (
    <FormContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="song-title-input"
          label="Song Title"
          value={title}
          onChange={onTitleChange}
          placeholder="Enter song title"
          required
        />
        <FormField
          id="song-artist-input"
          label="Artist"
          value={artist}
          onChange={onArtistChange}
          placeholder="Enter artist name"
          required
        />
        <FormField
          id="song-key-input"
          label="Song Key"
          value={songKey}
          onChange={onSongKeyChange}
          placeholder="e.g. C# minor"
        />
        <FormField
          id="guitar-tuning-input"
          label="Guitar Tuning"
          value={guitarTuning}
          onChange={onGuitarTuningChange}
          placeholder="e.g. Standard tuning"
        />
        <GuitarCapoField
          id="guitar-capo-input"
          label="Guitar Capo"
          value={guitarCapo}
          onChange={onGuitarCapoChange}
        />

        <div className="space-y-2 h-full">
          <div className="flex justify-end items-end h-full">
            <Button
              onClick={onContinue}
              className="w-full h-10 shrink-0"
              aria-label="Continue to edit"
              disabled={!title || !artist}
            >
              <span className="">Continue</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default SongMetadataForm;

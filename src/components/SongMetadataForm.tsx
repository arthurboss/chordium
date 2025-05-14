import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import FormField from "@/components/ui/form-field";

interface SongMetadataFormProps {
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

const SongMetadataForm: React.FC<SongMetadataFormProps> = ({
  title,
  artist,
  songKey,
  guitarTuning,
  onTitleChange,
  onArtistChange,
  onSongKeyChange,
  onGuitarTuningChange,
  onContinue,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
              </div>
            </div>
            <div className="flex justify-end items-end">
              <Button 
                onClick={onContinue}
                className="w-12 h-10 shrink-0"
                aria-label="Continue to edit"
                disabled={!title || !artist}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongMetadataForm;

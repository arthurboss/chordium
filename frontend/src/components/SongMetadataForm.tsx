import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const sanitize = (value: string) => value.replace(/\//g, "");

  return (
    <FormContainer>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="song-title-input"
          label={t("songMetadataForm.songTitle")}
          value={title}
          onChange={(v) => onTitleChange(sanitize(v))}
          placeholder={t("songMetadataForm.songTitlePlaceholder")}
          required
        />
        <FormField
          id="song-artist-input"
          label={t("songMetadataForm.artist")}
          value={artist}
          onChange={(v) => onArtistChange(sanitize(v))}
          placeholder={t("songMetadataForm.artistPlaceholder")}
          required
          autoCorrect="off"
          spellCheck={false}
        />
        <FormField
          id="song-key-input"
          label={t("songMetadataForm.songKey")}
          value={songKey}
          onChange={onSongKeyChange}
          placeholder={t("songMetadataForm.songKeyPlaceholder")}
        />
        <FormField
          id="guitar-tuning-input"
          label={t("songMetadataForm.guitarTuning")}
          value={guitarTuning}
          onChange={onGuitarTuningChange}
          placeholder={t("songMetadataForm.guitarTuningPlaceholder")}
        />
        <GuitarCapoField
          id="guitar-capo-input"
          label={t("songMetadataForm.guitarCapo")}
          value={guitarCapo}
          onChange={onGuitarCapoChange}
        />

        <div className="space-y-2 h-full">
          <div className="flex justify-end items-end h-full">
            <Button
              onClick={onContinue}
              className="w-full h-10 shrink-0"
              aria-label={t("songMetadataForm.continueAriaLabel")}
              disabled={!title || !artist}
            >
              <span>{t("songMetadataForm.continue")}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default SongMetadataForm;

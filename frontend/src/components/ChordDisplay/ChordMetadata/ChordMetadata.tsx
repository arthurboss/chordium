import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MetadataBadge from "./MetadataBadge";
import type { ChordMetadataProps } from "./ChordMetadata.types";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";
import CapoMenu from "@/components/ChordDisplay/components/StickyControlsBar/CapoMenu";
import TransposeMenu from "@/components/ChordDisplay/components/StickyControlsBar/TransposeMenu";

const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet, path, controls }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  let tuning = t("chordMetadata.standard");
  if (chordSheet.guitarTuning) {
    tuning = Array.isArray(chordSheet.guitarTuning)
      ? chordSheet.guitarTuning.join("-")
      : chordSheet.guitarTuning;
  }

  const capoValue =
    chordSheet.guitarCapo !== undefined && chordSheet.guitarCapo !== null
      ? chordSheet.guitarCapo.toString()
      : t("chordMetadata.none");

  const handleArtistClick = () => {
    if (chordSheet.artist) {
      const artistSlug = path.split("/")[0];
      sessionStorage.removeItem("chordium_search_query");
      try {
        sessionStorage.setItem(
          ARTIST_DISPLAY_NAME_KEY,
          JSON.stringify({ path: artistSlug, displayName: chordSheet.artist })
        );
      } catch {}
      navigate(`/${artistSlug}`);
    }
  };

  return (
    <div className="flex flex-col gap-1 px-4 py-2 min-w-0 text-xs">
      {/* Row 1: Artist + Tuning */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <MetadataBadge
          label={t("chordMetadata.artist")}
          value={chordSheet.artist || t("chordMetadata.unknown")}
          onClick={chordSheet.artist ? handleArtistClick : undefined}
          isClickable={!!chordSheet.artist}
        />
        <MetadataBadge
          label={t("chordMetadata.guitarTuning")}
          value={tuning}
        />
      </div>

      {/* Row 2: Key (transpose control) + Capo (capo control) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {controls ? (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground">{t("chordMetadata.songKey")}</span>
            <TransposeMenu
              transpose={controls.transpose}
              setTranspose={controls.handleTransposeChange}
              defaultTranspose={controls.defaultTranspose}
              songKey={controls.songKey}
              disableIncrement={controls.getTransposeDisableStates().disableIncrement}
              disableDecrement={controls.getTransposeDisableStates().disableDecrement}
            />
          </div>
        ) : (
          <MetadataBadge
            label={t("chordMetadata.songKey")}
            value={chordSheet.songKey || "-"}
          />
        )}
        {controls ? (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground">{t("chordMetadata.guitarCapo")}</span>
            <CapoMenu
              capo={controls.capo}
              setCapo={controls.handleCapoChange}
              defaultCapo={controls.defaultCapo}
              disableIncrement={controls.getCapoDisableStates().disableIncrement}
              disableDecrement={controls.getCapoDisableStates().disableDecrement}
            />
          </div>
        ) : (
          <MetadataBadge
            label={t("chordMetadata.guitarCapo")}
            value={capoValue}
          />
        )}
      </div>
    </div>
  );
};

export default ChordMetadata;

import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MetadataBadge from "./MetadataBadge";
import type { ChordMetadataProps } from "./ChordMetadata.types";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";

const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet, path }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tuning = chordSheet.guitarTuning
    ? Array.isArray(chordSheet.guitarTuning)
      ? chordSheet.guitarTuning.join("-")
      : chordSheet.guitarTuning
    : t("chordMetadata.standard");

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
    <div className="flex flex-col gap-1 px-4 py-2 sm:grid sm:[grid-template-columns:repeat(4,_min-content)] sm:gap-x-4 sm:gap-y-1 sm:justify-between min-w-0 text-xs">
      <MetadataBadge
        label={t("chordMetadata.artist")}
        value={chordSheet.artist || t("chordMetadata.unknown")}
        onClick={chordSheet.artist ? handleArtistClick : undefined}
        isClickable={!!chordSheet.artist}
      />
      <div className="flex gap-3 whitespace-nowrap sm:contents">
        <MetadataBadge
          label={t("chordMetadata.songKey")}
          value={chordSheet.songKey || "-"}
        />
        <MetadataBadge
          label={t("chordMetadata.guitarCapo")}
          value={capoValue}
        />
        <MetadataBadge
          label={t("chordMetadata.guitarTuning")}
          value={tuning}
        />
      </div>
    </div>
  );
};

export default ChordMetadata;

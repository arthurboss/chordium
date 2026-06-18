import React from "react";
import { useTranslation } from "react-i18next";
import MetadataBadge from "./MetadataBadge";
import type { ChordMetadataProps } from "./ChordMetadata.types";
import CapoMenu from "@/components/ChordDisplay/components/StickyControlsBar/CapoMenu";
import TransposeMenu from "@/components/ChordDisplay/components/StickyControlsBar/TransposeMenu";

const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet, controls }) => {
  const { t } = useTranslation();

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

  const keyCapoControls = controls ? (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-medium">{t("chordMetadata.songKey")}</span>
        <TransposeMenu
          transpose={controls.transpose}
          setTranspose={controls.handleTransposeChange}
          defaultTranspose={controls.defaultTranspose}
          songKey={controls.songKey}
          disableIncrement={controls.getTransposeDisableStates().disableIncrement}
          disableDecrement={controls.getTransposeDisableStates().disableDecrement}
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-medium">{t("chordMetadata.guitarCapo")}</span>
        <CapoMenu
          capo={controls.capo}
          setCapo={controls.handleCapoChange}
          defaultCapo={controls.defaultCapo}
          disableIncrement={controls.getCapoDisableStates().disableIncrement}
          disableDecrement={controls.getCapoDisableStates().disableDecrement}
        />
      </div>
    </>
  ) : (
    <>
      <MetadataBadge label={t("chordMetadata.songKey")} value={chordSheet.songKey || "-"} />
      <MetadataBadge label={t("chordMetadata.guitarCapo")} value={capoValue} />
    </>
  );

  return (
    <div className="w-full text-xs">
      <div className="px-4 py-2 flex flex-row flex-wrap justify-between items-center gap-x-4 gap-y-2">
        <MetadataBadge label={t("chordMetadata.guitarTuning")} value={tuning} />
        {keyCapoControls}
      </div>
    </div>
  );
};

export default ChordMetadata;

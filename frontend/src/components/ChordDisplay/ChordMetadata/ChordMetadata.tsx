import React from "react";
import { useTranslation } from "react-i18next";
import MetadataBadge from "./MetadataBadge";
import type { ChordMetadataProps } from "./ChordMetadata.types";
import CapoMenu from "@/components/ChordDisplay/components/StickyControlsBar/CapoMenu";
import TransposeMenu from "@/components/ChordDisplay/components/StickyControlsBar/TransposeMenu";
import { Input } from "@/components/ui/input";
import TuningPicker from "./TuningPicker";

const ChordMetadata: React.FC<ChordMetadataProps> = ({ chordSheet, controls, edit }) => {
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

  if (edit) {
    return (
      <div className="w-full text-xs">
        <div className="px-4 py-2 flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-medium">{t("chordMetadata.guitarTuning")}</span>
            <TuningPicker
              value={edit.guitarTuning}
              onChange={edit.onGuitarTuningChange}
            />
          </label>
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-medium">{t("chordMetadata.songKey")}</span>
            <Input
              value={edit.songKey}
              onChange={(e) => edit.onSongKeyChange(e.target.value)}
              placeholder="-"
              aria-label={t("chordMetadata.songKey")}
              className="h-7 w-16 text-xs"
            />
          </label>
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="font-medium">{t("chordMetadata.guitarCapo")}</span>
            <Input
              type="number"
              min={0}
              max={12}
              value={edit.guitarCapo}
              onChange={(e) => edit.onGuitarCapoChange(Number(e.target.value))}
              aria-label={t("chordMetadata.guitarCapo")}
              className="h-7 w-16 text-xs"
            />
          </label>
        </div>
      </div>
    );
  }

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

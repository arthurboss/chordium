import React from "react";
import { useTranslation } from "react-i18next";
import IncrementDecrementButton from "@/components/ui/IncrementDecrementButton";
import { useTransposeMenu } from "./TransposeMenu.hooks";
import { formatKeyDisplay } from "./TransposeMenu.utils";
import { ALL_POSSIBLE_KEY_NAMES } from "@/music/constants/musicalKeys";
import type { TransposeMenuProps } from "./TransposeMenu.types";

/**
 * TransposeMenu component for transposing chord sheets
 * Provides increment/decrement buttons and displays current key with transpose level
 *
 * @param transpose - Current transpose value in semitones
 * @param setTranspose - Function to update transpose value
 * @param defaultTranspose - Original song key value (defaults to 0)
 */
const TransposeMenu: React.FC<TransposeMenuProps> = ({
  transpose,
  setTranspose,
  defaultTranspose = 0,
  songKey,
  title,
  disableIncrement: externalDisableIncrement,
  disableDecrement: externalDisableDecrement,
}) => {
  const { t } = useTranslation();
  const displayTitle = title ?? t("stickyControlsBar.transpose");

  const {
    uiTransposeLevel,
    isAltered,
    handleIncrement,
    handleDecrement,
    handleReset,
    animationDirection,
    disableIncrement: internalDisableIncrement,
    disableDecrement: internalDisableDecrement,
  } = useTransposeMenu({ transpose, setTranspose, defaultTranspose });

  const disableIncrement = externalDisableIncrement ?? internalDisableIncrement;
  const disableDecrement = externalDisableDecrement ?? internalDisableDecrement;
  const keyDisplay = formatKeyDisplay(transpose, uiTransposeLevel, songKey);

  return (
    <>
      <div className={`text-xs text-muted-foreground mb-1 flex items-center justify-between gap-1 ${isAltered ? "w-24" : "w-16"}`}>
        <span>{displayTitle}</span>
        <span className="text-muted-foreground">
          {keyDisplay.transposeText && ` (${keyDisplay.transposeText})`}
        </span>
      </div>
      <IncrementDecrementButton
        value={keyDisplay.keyName}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onReset={handleReset}
        isAltered={isAltered}
        title={t("stickyControlsBar.transposeSongKey")}
        resetTitle={t("stickyControlsBar.resetTranspose")}
        disableIncrement={disableIncrement}
        disableDecrement={disableDecrement}
        animationDirection={animationDirection}
        digits={ALL_POSSIBLE_KEY_NAMES}
      />
    </>
  );
};

export default TransposeMenu;

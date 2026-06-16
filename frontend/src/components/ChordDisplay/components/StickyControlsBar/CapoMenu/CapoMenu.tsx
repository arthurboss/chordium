import React from "react";
import { useTranslation } from "react-i18next";
import IncrementDecrementButton from "@/components/ui/IncrementDecrementButton";
import { useCapoMenu } from "./CapoMenu.hooks";
import { formatCapoDisplay } from "./CapoMenu.utils";
import type { CapoMenuProps } from "./CapoMenu.types";

/**
 * CapoMenu component for adjusting capo position
 * Provides increment/decrement buttons and displays current capo position
 *
 * @param capo - Current capo position
 * @param setCapo - Function to update capo position
 * @param defaultCapo - Original capo position (defaults to 0)
 */
const CapoMenu: React.FC<CapoMenuProps> = ({
  capo,
  setCapo,
  defaultCapo = 0,
  title,
  disableIncrement: externalDisableIncrement,
  disableDecrement: externalDisableDecrement,
}) => {
  const { t } = useTranslation();

  const {
    uiCapoLevel,
    isAltered,
    handleIncrement,
    handleDecrement,
    handleReset,
    disableIncrement: internalDisableIncrement,
    disableDecrement: internalDisableDecrement,
    animationDirection,
  } = useCapoMenu({ capo, setCapo, defaultCapo });

  const disableIncrement = externalDisableIncrement ?? internalDisableIncrement;
  const disableDecrement = externalDisableDecrement ?? internalDisableDecrement;
  const capoDisplay = formatCapoDisplay(capo, uiCapoLevel);
  const capoDigits = Array.from({ length: 12 }, (_, i) => i.toString());

  return (
    <IncrementDecrementButton
        value={capoDisplay}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onReset={handleReset}
        isAltered={isAltered}
        title={t("stickyControlsBar.capoPosition")}
        resetTitle={t("stickyControlsBar.resetCapo")}
        disableIncrement={disableIncrement}
        disableDecrement={disableDecrement}
        animationDirection={animationDirection}
        digits={capoDigits}
    />
  );
};

export default CapoMenu;

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "../../../../ui/dropdown-menu";
import { Slider } from "../../../../ui/slider";
import { Settings } from "lucide-react";
import { TEXT_STYLE_MENU_STYLES } from "./TextStyleMenu.styles";
import { TEXT_PREFERENCES_VALUES } from "./TextStyleMenu.constants";
import { getFontSpacingDisplay, isViewModeActive } from "./TextStyleMenu.utils";
import type { TextStyleMenuProps } from "./TextStyleMenu.types";
import ToggleOption from "./ToggleOption";
import { TabsModeIcon, LyricsModeIcon } from "./ViewModeIcons";

const TextStyleMenu: React.FC<TextStyleMenuProps> = ({
  fontSize,
  setFontSize,
  fontSpacing,
  setFontSpacing,
  viewMode,
  setViewMode,
  title,
  variant = "desktop",
  buttonClassName,
  iconSize = 16,
  dropdownAlign = "start",
  dropdownClassName,
}) => {
  const { t } = useTranslation();
  const displayTitle = title ?? t("textStyle.textPreferences");

  const isMobile = variant === "mobile";
  const containerClassName = isMobile ? "" : "flex flex-col items-center gap-1";
  const triggerButtonClassName =
    buttonClassName ||
    (isMobile ? "h-10 w-10" : TEXT_STYLE_MENU_STYLES.triggerButton);
  const settingsIconClassName = isMobile ? "" : TEXT_STYLE_MENU_STYLES.settingsIcon;
  const contentClassName = dropdownClassName || (isMobile ? "mr-4" : "");

  return (
    <div className={containerClassName}>
      {!isMobile && (
        <span className="text-xs text-muted-foreground">{displayTitle}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={triggerButtonClassName}
            title={isMobile ? t("textStyle.textPreferencesAriaLabel") : undefined}
          >
            <Settings size={iconSize} className={settingsIconClassName} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={dropdownAlign} className={contentClassName}>
          <div className={TEXT_STYLE_MENU_STYLES.sectionContainer}>
            <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>
              {t("textStyle.viewMode")}
            </div>
            <div className="flex flex-col gap-2">
              <ToggleOption
                active={viewMode !== "tabs-off"}
                onClick={() => setViewMode(viewMode === "tabs-off" ? "tabs-on" : "tabs-off")}
                icon={<TabsModeIcon className="opacity-70" />}
                label="Tabs"
              />
              <ToggleOption
                active={isViewModeActive(viewMode, "lyrics-only")}
                onClick={() => setViewMode("lyrics-only")}
                icon={<LyricsModeIcon className="opacity-70" />}
                label={t("textStyle.lyrics")}
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className={TEXT_STYLE_MENU_STYLES.sliderSection}>
            <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>
              {t("textStyle.fontSize")}
            </div>
            <div className={TEXT_STYLE_MENU_STYLES.sliderContainer}>
              <Slider
                value={[fontSize]}
                min={TEXT_PREFERENCES_VALUES.fontSizes.min}
                max={TEXT_PREFERENCES_VALUES.fontSizes.max}
                step={TEXT_PREFERENCES_VALUES.fontSizes.step}
                onValueChange={(value) => setFontSize(value[0])}
                className={TEXT_STYLE_MENU_STYLES.slider}
              />
              <span className={TEXT_STYLE_MENU_STYLES.valueDisplay}>{fontSize}px</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className={TEXT_STYLE_MENU_STYLES.sliderSection}>
            <div className={TEXT_STYLE_MENU_STYLES.sectionTitle}>
              {t("textStyle.fontSpacing")}
            </div>
            <div className={TEXT_STYLE_MENU_STYLES.sliderContainer}>
              <Slider
                value={[fontSpacing]}
                min={TEXT_PREFERENCES_VALUES.fontSpacing.min}
                max={TEXT_PREFERENCES_VALUES.fontSpacing.max}
                step={TEXT_PREFERENCES_VALUES.fontSpacing.step}
                onValueChange={(value) => setFontSpacing(value[0])}
                className={TEXT_STYLE_MENU_STYLES.slider}
              />
              <span className={TEXT_STYLE_MENU_STYLES.valueDisplay}>
                {getFontSpacingDisplay(fontSpacing)}
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TextStyleMenu;

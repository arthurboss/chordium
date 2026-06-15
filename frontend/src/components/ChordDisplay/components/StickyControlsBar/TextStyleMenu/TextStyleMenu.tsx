import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../ui/button";
import { Settings } from "lucide-react";
import { TEXT_STYLE_MENU_STYLES } from "./TextStyleMenu.styles";
import type { TextStyleMenuProps } from "./TextStyleMenu.types";

const TextStyleMenu: React.FC<TextStyleMenuProps> = ({
  variant = "desktop",
  buttonClassName,
  iconSize = 16,
  open = false,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  const isMobile = variant === "mobile";
  const triggerButtonClassName =
    buttonClassName ||
    (isMobile ? "h-10 w-10" : TEXT_STYLE_MENU_STYLES.triggerButton);
  const settingsIconClassName = isMobile ? "" : TEXT_STYLE_MENU_STYLES.settingsIcon;

  const handleToggle = () => {
    onOpenChange?.(!open);
  };

  if (isMobile) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={`${triggerButtonClassName} ${open ? "bg-muted/50 text-primary" : ""}`}
        title={t("textStyle.textPreferencesAriaLabel")}
        onClick={handleToggle}
      >
        <Settings size={iconSize} className={open ? "text-primary" : ""} />
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{t("textStyle.textPreferences")}</span>
      <Button
        variant="outline"
        className={`${triggerButtonClassName} ${open ? "bg-muted/50 text-primary" : ""}`}
        onClick={handleToggle}
      >
        <Settings size={iconSize} className={`${settingsIconClassName} ${open ? "text-primary" : ""}`} />
      </Button>
    </div>
  );
};

export default TextStyleMenu;

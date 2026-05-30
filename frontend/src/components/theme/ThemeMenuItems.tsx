import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ThemeMenuItem } from "./ThemeMenuItem";
import { themeIcons } from "@/utils/theme-icons";
import { Theme } from "@/utils/theme-utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cyAttr } from "@/utils/test-utils";

interface ThemeMenuItemsProps {
  activeTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export const ThemeMenuItems: React.FC<ThemeMenuItemsProps> = memo(({
  activeTheme,
  onSelectTheme,
}) => {
  const { t } = useTranslation();

  const handleSelectTheme = useCallback((theme: Theme) => {
    onSelectTheme(theme);
  }, [onSelectTheme]);

  return (
    <>
      {themeIcons.map((item) => {
        const { theme, icon } = item;
        const isActive = activeTheme === theme;
        const label = t(`theme.${theme}` as `theme.light` | `theme.dark` | `theme.system`);

        return (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleSelectTheme(theme)}
            className={isActive ? "bg-accent" : ""}
            tabIndex={0}
            role="menuitem"
            {...cyAttr(`theme-${theme}-item`)}
          >
            {icon}
            <span>{label}</span>
          </DropdownMenuItem>
        );
      })}
    </>
  );
});

export default ThemeMenuItems;

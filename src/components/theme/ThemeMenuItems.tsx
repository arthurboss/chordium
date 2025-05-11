import React, { memo, useCallback } from "react";
import { ThemeMenuItem } from "./ThemeMenuItem";
import { themeIcons } from "@/utils/theme-icons";
import { Theme } from "@/utils/theme-utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ThemeMenuItemsProps {
  activeTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export const ThemeMenuItems: React.FC<ThemeMenuItemsProps> = memo(({ 
  activeTheme, 
  onSelectTheme 
}) => {
  // Using useCallback to memoize this function reference
  const handleSelectTheme = useCallback((theme: Theme) => {
    onSelectTheme(theme);
  }, [onSelectTheme]);

  return (
    <>
      {themeIcons.map((item) => {
        const { theme, icon, label } = item;
        const isActive = activeTheme === theme;
        
        // Direct usage of DropdownMenuItem for Cypress testing compatibility
        return (
          <DropdownMenuItem 
            key={theme}
            onClick={() => handleSelectTheme(theme)}
            className={isActive ? "bg-accent" : ""}
            tabIndex={0}
            role="menuitem" // Explicitly set the role for Cypress tests
            data-testid={`theme-${theme}-item`} // Add test ID for easier selection
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

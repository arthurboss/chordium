import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ThemeIconItem } from "@/utils/theme-icons";
import { Theme } from "@/utils/theme-utils";

interface ThemeMenuItemProps {
  item: ThemeIconItem;
  activeTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export const ThemeMenuItem: React.FC<ThemeMenuItemProps> = ({ 
  item, 
  activeTheme, 
  onSelectTheme 
}) => {
  const { theme, icon, label } = item;
  const isActive = activeTheme === theme;
  
  return (
    <DropdownMenuItem 
      key={theme}
      onClick={() => onSelectTheme(theme)}
      className={isActive ? "bg-accent" : ""}
      tabIndex={0}
      role="menuitem"
    >
      {icon}
      <span>{label}</span>
    </DropdownMenuItem>
  );
};

export default ThemeMenuItem;

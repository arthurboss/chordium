import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/utils/theme-utils";
import ThemeTriggerButton from "@/components/theme/ThemeTriggerButton";
import ThemeMenuItems from "@/components/theme/ThemeMenuItems";

export const ThemeToggle: React.FC = () => {
  const { isDark, activeTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <ThemeTriggerButton 
          isDark={isDark}
          onClick={() => setIsOpen(!isOpen)} 
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="theme-dropdown-menu"
        data-testid="theme-dropdown-menu"
      >
        <ThemeMenuItems 
          activeTheme={activeTheme} 
          onSelectTheme={(theme) => {
            setTheme(theme);
            setIsOpen(false); // Close the menu after selection
          }} 
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

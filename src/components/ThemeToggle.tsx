import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "@/utils/theme-utils";
import React from "react";

export const ThemeToggle = () => {
  const { isDark, activeTheme, setTheme } = useTheme();

  // Menu item configuration for cleaner rendering
  const menuItems: Array<{
    theme: Theme;
    icon: React.ReactNode;
    label: string;
  }> = [
    {
      theme: 'light',
      icon: <Sun className="mr-2 h-4 w-4" />,
      label: 'Light'
    },
    {
      theme: 'dark',
      icon: <Moon className="mr-2 h-4 w-4" />,
      label: 'Dark'
    },
    {
      theme: 'system',
      icon: <Laptop className="mr-2 h-4 w-4" />,
      label: 'System'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle theme"
          title="Theme settings"
          className="border"
          tabIndex={0}
        >
          <span className="theme-toggle-icon">
            {isDark ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </span>
          <span className="sr-only">Theme settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map(({ theme, icon, label }) => (
          <DropdownMenuItem 
            key={theme}
            onClick={() => setTheme(theme)}
            className={activeTheme === theme ? "bg-accent" : ""}
            tabIndex={0}
          >
            {icon}
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

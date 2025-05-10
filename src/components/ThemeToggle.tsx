import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkModeActive = document.documentElement.classList.contains('dark');
      setIsDark(isDarkModeActive);
    };
    
    const checkIfSystemTheme = () => {
      const usingSystemTheme = !localStorage.theme;
      setIsSystemTheme(usingSystemTheme);
    };
    
    // Initial theme setup on component mount
    if (localStorage.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (localStorage.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // No theme preference in localStorage, apply system theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // After the DOM class is set, update the React states
    checkDarkMode();
    checkIfSystemTheme();
    
    // Create mutation observer for class changes on the html element
    // This helps keep the isDark state in sync if the class is changed externally,
    // though primarily this component controls it.
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only apply system theme if user hasn't manually set a preference in localStorage
      if (!localStorage.theme) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // The MutationObserver will catch this and update the state
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);
  
  // Set theme to light mode
  const setLightTheme = () => {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
    setIsDark(false);
    setIsSystemTheme(false);
  };
  
  // Set theme to dark mode
  const setDarkTheme = () => {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
    setIsDark(true);
    setIsSystemTheme(false);
  };
  
  // Reset to system preference
  const setSystemTheme = () => {
    // Remove saved preference
    localStorage.removeItem('theme');
    setIsSystemTheme(true);
    
    // Apply system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Toggle theme"
          title="Theme settings"
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
        <DropdownMenuItem onClick={setLightTheme} className={!isDark && !isSystemTheme ? "bg-accent" : ""}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setDarkTheme} className={isDark && !isSystemTheme ? "bg-accent" : ""}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setSystemTheme} className={isSystemTheme ? "bg-accent" : ""}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

import React, { useState, useRef } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, Theme } from "@/utils/theme-utils";
import { Button } from "@/components/ui/button";
import { cyAttr } from "../utils/test-utils";

const THEMES: Theme[] = ["light", "dark", "system"];

const ThemeIcon = ({ theme, highlight }: { theme: Theme; highlight?: boolean }) => {
  const className = `h-4 w-4 ${highlight ? "text-primary" : ""}`;
  switch (theme) {
    case "light": return <Sun className={className} />;
    case "dark": return <Moon className={className} />;
    case "system": return <Laptop className={className} />;
  }
};

export const ThemeToggle: React.FC = () => {
  const { activeTheme, setTheme } = useTheme();
  const [showSelected, setShowSelected] = useState(false);
  const [visible, setVisible] = useState(true);
  const [displayTheme, setDisplayTheme] = useState<Theme>(activeTheme);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex = THEMES.indexOf(activeTheme);
  const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];

  const handleClick = () => {
    // Fade out
    setVisible(false);

    setTimeout(() => {
      setTheme(nextTheme);
      setDisplayTheme(nextTheme);
      setShowSelected(true);
      // Fade in
      setVisible(true);
    }, 200);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setShowSelected(false);
        // Fade in
        setVisible(true);
      }, 200);
    }, 2200);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      title="Theme settings"
      className="h-10 w-10 rounded-full"
      onClick={handleClick}
      {...cyAttr("theme-toggle-button")}
    >
      <span
        className={`inline-flex items-center justify-center transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        {showSelected ? (
          <ThemeIcon theme={displayTheme} highlight />
        ) : (
          <ThemeIcon theme={activeTheme} />
        )}
      </span>
    </Button>
  );
};

export default ThemeToggle;

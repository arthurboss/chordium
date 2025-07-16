import React, { memo, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { getThemeToggleIcon } from "@/utils/theme-icons";
import { cyAttr } from "@/utils/test-utils";

interface ThemeTriggerButtonProps {
  isDark: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ThemeTriggerButton = memo(forwardRef<HTMLButtonElement, ThemeTriggerButtonProps>(
  ({ isDark, onClick }, ref) => {
    return (
      <Button 
        ref={ref}
        variant="ghost" 
        size="icon" 
        aria-label="Toggle theme"
        title="Theme settings"
        className="border"
        tabIndex={0}
        onClick={onClick}
        {...cyAttr("theme-toggle-button")}
      >
        <span className="theme-toggle-icon">
          {getThemeToggleIcon(isDark)}
        </span>
        <span className="sr-only">Theme settings</span>
      </Button>
    );
  }
));

// Set display name for better debugging
ThemeTriggerButton.displayName = 'ThemeTriggerButton';

export default ThemeTriggerButton;

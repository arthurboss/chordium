# Theme Utilities

This file contains the utility functions for the theme system in Chordium.

## Overview

The theme utilities have been separated from the component logic to improve organization and reusability. The main features provided are:

1. Theme management (light, dark, system)
2. System preference detection
3. Theme persistence in localStorage
4. Theme application to document
5. Reactive system for theme changes

## Key Functions

- `applyTheme`: Sets a theme (light, dark or system) and updates localStorage
- `getSystemPreference`: Gets the current system theme preference
- `applySystemTheme`: Applies the theme based on system preference
- `getActiveTheme`: Determines the current active theme
- `useTheme`: Custom React hook that encapsulates all theme management logic

## Usage Example

```tsx
// Import the hook
import { useTheme } from '@/utils/theme-utils';

// In your component
const MyComponent = () => {
  const { isDark, activeTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {activeTheme}</p>
      <p>Is dark mode: {isDark ? 'Yes' : 'No'}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
};
```

## Implementation Notes

- The system uses a combination of CSS classes and localStorage for theme management
- A MutationObserver monitors theme changes from external sources
- MediaQueryList tracks system preference changes
- Theme settings are persisted between sessions using localStorage

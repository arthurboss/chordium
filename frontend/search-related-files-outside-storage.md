# Search-Related Files Outside of `storage/` Folder (Frontend)

This document lists and briefly describes all search-related files in the frontend codebase that are **outside** the `storage/` folder. These files handle search state, UI, navigation, and API integration, but do not implement cache or persistence logic.

---

## 1. Utilities

- `src/utils/search-song-actions.ts`
  - Utility functions for search actions (trigger/process search operations).

## 2. Context

- `src/context/SearchStateContext.tsx`
  - React context for global search state (artist, song, results, etc.).
  - Provides state and update helpers to components.

## 3. Components

- `src/components/EmptyState.tsx`
  - UI for "no search results" message.
- `src/components/Header.tsx`
  - Navigation to search page, search icon.
- `src/components/TabContainer.tsx`
  - Tab navigation logic, including switching to search tab and tracking last search URL.

## 4. Hooks

- `src/hooks/use-navigation-history.ts`
  - Manages navigation history for search (store/restore original search URL).
- `src/hooks/use-tab-navigation.ts`
  - Determines active tab based on path and search parameters.

## 5. Pages

- `src/pages/Home.tsx`
  - Integrates search redirect logic, shows search tab.
- `src/pages/NotFound.tsx`
  - Mentions search in user guidance text.

## 6. API

- `src/services/api/fetch-chord-sheet.ts`
  - Handles API calls that may include search parameters.

---

**Note:**

- The actual cache and persistence logic is implemented inside the `storage/` folder.
- The above files are responsible for search state, UI, navigation, and API integration only.

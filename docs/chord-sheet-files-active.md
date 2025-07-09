# Chord Sheet–Related Files (Active, Not Archived)

This document lists all chord sheet–related files that are still present in the `src/` directory and need to be considered for further migration, UI, or IndexedDB integration work.

---

## Types and Models
- `src/types/chordSheet.ts`
- `src/types/song.ts`

## UI Components and Pages
- `src/pages/ChordViewer.tsx`  
  Main page for viewing a chord sheet
- `src/components/ChordSheetViewer.tsx`  
  (If used) Dedicated component for displaying a chord sheet
- `src/components/SongChordDetails.tsx`  
  Displays metadata/details for a chord sheet
- `src/components/TabContainer.tsx`  
  Handles tab navigation, including “My Chord Sheets” and upload
- `src/components/SongList.tsx`  
  Displays a list of songs/chord sheets
- `src/components/ResultCard.tsx`  
  Card component for displaying a song/chord sheet in a list

## Utilities
- `src/utils/sample-songs.ts`
- `src/services/sample-song-loader.ts`
- `src/utils/chord-sheet-id-generator.ts`

---

**Note:**
- All hooks and utilities that referenced localStorage (such as `useChordSheet`, `useAddToMyChordSheets`, and storage utilities) have been archived and are no longer in `src/`.
- The files above are the ones to focus on for further migration, UI, and IndexedDB integration work.

---

_Last updated: July 9, 2025_

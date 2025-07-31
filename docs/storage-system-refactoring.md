# Storage System Refactoring Documentation

Files modified outside of `frontend/src/storage/` since commit `75cb9592e80cace4c7cc09e4599f0be0298b3425`:

## Modified Files

- `.gitignore`
- `CONTRIBUTING.md`
- `frontend/index.html`
- `frontend/src/App.tsx`
- `frontend/src/__tests__/chordsheet-interface-consistency.test.ts`
- `frontend/src/__tests__/shared/test-setup.ts`
- `frontend/src/components/SongList.tsx`
- `frontend/src/components/SongViewer.tsx`
- `frontend/src/components/TabContainer.tsx`
- `frontend/src/components/tabs/SearchTab.tsx`
- `frontend/src/hooks/use-navigation-history.ts`
- `frontend/src/hooks/use-tab-navigation.ts`
- `frontend/src/main.tsx`
- `frontend/src/pages/ChordViewer.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/search/hooks/useSearchState/handlers/useSearchFetch.ts`
- `frontend/src/services/__tests__/chord-sheet.service.test.ts`
- `frontend/src/utils/__tests__/enhanced-song-selection-integration.test.ts`
- `frontend/src/utils/__tests__/song-deduplication.test.ts`
- `frontend/src/utils/artist-utils.ts`
- `frontend/src/utils/enhanced-song-selection.ts`
- `frontend/src/utils/local-chord-sheet-finder.ts`
- `frontend/src/utils/theme-utils.ts`
- `packages/e2e-tests/cypress/e2e/enhanced-song-selection.cy.ts`
- `packages/e2e-tests/cypress/e2e/home.cy.ts`

## New Files

- `docs/CODING_STANDARDS.md`
- `frontend/src/components/NavigationCard.tsx`
- `frontend/src/components/NavigationCard.types.ts`
- `frontend/src/hooks/use-debug-indexeddb.ts`
- `frontend/src/utils/chord-sheet-to-song.ts`
- `frontend/src/utils/performance.ts`
- `frontend/src/utils/performance.types.ts`

## Deleted Files

### Cache System (entire folder)

- `frontend/src/cache/__tests__/debug-cache-core.test.ts`
- `frontend/src/cache/__tests__/import-test.test.ts`
- `frontend/src/cache/__tests__/integration/cache-integration.test.ts`
- `frontend/src/cache/__tests__/localStorage-test.test.ts`
- `frontend/src/cache/__tests__/unified-chord-sheet-cache.test.ts`
- `frontend/src/cache/__tests__/unit/minimal-cache.test.ts`
- `frontend/src/cache/__tests__/unit/safe-cache.test.ts`
- `frontend/src/cache/config.ts`
- `frontend/src/cache/core/base-cache.ts`
- `frontend/src/cache/core/cache-clearer.ts`
- `frontend/src/cache/core/cache-expiration-checker.ts`
- `frontend/src/cache/core/cache-initializer.ts`
- `frontend/src/cache/core/cache-item.ts`
- `frontend/src/cache/core/cache-key-generator.ts`
- `frontend/src/cache/core/cache-key-parser.ts`
- `frontend/src/cache/core/cache-saver.ts`
- `frontend/src/cache/core/cache-size-enforcer.ts`
- `frontend/src/cache/implementations/artist-cache.ts`
- `frontend/src/cache/implementations/search-cache.ts`
- `frontend/src/cache/implementations/unified-chord-sheet-cache.ts`
- `frontend/src/cache/index.ts`
- `frontend/src/cache/operations/cache-chord-sheet.ts`
- `frontend/src/cache/types.ts`
- `frontend/src/cache/types/unified-chord-sheet-cache.ts`
- `frontend/src/cache/utils/cache-debug.ts`

### useChordSheet Hook System

- `frontend/src/hooks/useChordSheet.test.ts`
- `frontend/src/hooks/useChordSheet.ts`
- `frontend/src/hooks/useChordSheet/__tests__/background-refresh-handler.test.ts`
- `frontend/src/hooks/useChordSheet/__tests__/cache-coordinator-comprehensive.test.ts`
- `frontend/src/hooks/useChordSheet/__tests__/cache-coordinator.test.ts`
- `frontend/src/hooks/useChordSheet/__tests__/data-handlers.test.ts`
- `frontend/src/hooks/useChordSheet/background-refresh-handler.ts`
- `frontend/src/hooks/useChordSheet/cache-coordinator-modules.ts`
- `frontend/src/hooks/useChordSheet/cache-coordinator.ts`
- `frontend/src/hooks/useChordSheet/coordinators/__tests__/clear-expired-cache.test.ts`
- `frontend/src/hooks/useChordSheet/coordinators/__tests__/fetch-chord-sheet-from-backend.test.ts`
- `frontend/src/hooks/useChordSheet/coordinators/__tests__/get-chord-sheet-data.test.ts`
- `frontend/src/hooks/useChordSheet/coordinators/clear-expired-cache.ts`
- `frontend/src/hooks/useChordSheet/coordinators/fetch-chord-sheet-from-backend.ts`
- `frontend/src/hooks/useChordSheet/coordinators/get-chord-sheet-data.ts`
- `frontend/src/hooks/useChordSheet/data-handlers.ts`
- `frontend/src/hooks/useChordSheet/index.ts`
- `frontend/src/hooks/useChordSheet/url-determination-strategy.ts`
- `frontend/src/hooks/useChordSheet/utils/__tests__/convert-response-to-chord-sheet.test.ts`
- `frontend/src/hooks/useChordSheet/utils/__tests__/parse-storage-key.test.ts`
- `frontend/src/hooks/useChordSheet/utils/convert-response-to-chord-sheet.ts`
- `frontend/src/hooks/useChordSheet/utils/parse-storage-key.ts`

### Legacy Sample Hook

- `frontend/src/hooks/use-sample-chord-sheets/index.ts`

### Legacy Chord Sheet Storage Utils

- `frontend/src/utils/chord-sheet-storage/addChordSheet.ts`
- `frontend/src/utils/chord-sheet-storage/chordSheetToSong.ts`
- `frontend/src/utils/chord-sheet-storage/deleteChordSheet.ts`
- `frontend/src/utils/chord-sheet-storage/deleteChordSheetByPath.ts`
- `frontend/src/utils/chord-sheet-storage/getChordSheets.ts`
- `frontend/src/utils/chord-sheet-storage/getMyChordSheetsAsSongs.ts`
- `frontend/src/utils/chord-sheet-storage/handleDeleteChordSheetFromUI.ts`
- `frontend/src/utils/chord-sheet-storage/handleSaveNewChordSheetFromUI.ts`
- `frontend/src/utils/chord-sheet-storage/handleUpdateChordSheetFromUI.ts`
- `frontend/src/utils/chord-sheet-storage/index.ts`
- `frontend/src/utils/chord-sheet-storage/updateChordSheet.ts`

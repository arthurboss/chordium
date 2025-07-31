# Sample Chord Sheets Implementation

## Overview

The sample chord sheets feature provides sample data for development mode using IndexedDB storage. The implementation follows modular architecture principles and integrates seamlessly with the existing chord sheets system.

## Architecture

### Components

1. **SampleChordSheetsService** (`services/sample-chord-sheets/loader.ts`)
   - Main orchestrator for loading sample chord sheets
   - Follows Single Responsibility Principle
   - Dependency injection for storage interface

2. **IndexedDBStorage** (`services/sample-chord-sheets/indexeddb-storage.ts`)
   - Pure IndexedDB implementation of `IChordSheetStorage`
   - Wraps `ChordSheetStore` with clean interface
   - Consistent with overall storage architecture

3. **useChordSheets Hook** (`hooks/use-chord-sheets.ts`)
   - Main hook for complete chord sheets management
   - Handles both saved chord sheets and sample loading
   - Unified loading states and error handling

4. **useSampleLoading Hook** (`hooks/chord-sheets/use-sample-loading.ts`)
   - Focused hook for sample loading functionality
   - Manual trigger for sample loading operations
   - Development mode only functionality

## Key Features

✅ **Pure IndexedDB Implementation**
- Uses existing IndexedDB infrastructure
- Consistent with overall storage architecture
- No external dependencies

✅ **Development Mode Only**
- Automatic environment detection
- Safe for production builds
- Configurable behavior

✅ **Duplicate Prevention**
- Checks existing saved chord sheets
- Prevents redundant data
- Maintains data integrity

✅ **Unified State Management**
- Single `useChordSheets` hook for complete functionality
- Automatic sample loading coordination
- Combined loading states and error handling

✅ **Modular Architecture**
- Clean separation of concerns
- Testable components
- Focused responsibilities

✅ **Error Handling**
- Comprehensive error management
- Graceful fallbacks
- Detailed logging

## Sample Data

The implementation includes sample chord sheets for development:

1. **Oasis - Wonderwall**
   - Classic chord progression
   - Popular beginner song

2. **Eagles - Hotel California**
   - Complex chord patterns
   - Advanced guitar techniques

Sample chord sheets are marked with `storage.saved: true` to appear in the "My Chord Sheets" section.

## Usage

### Complete Chord Sheets Management

```typescript
import { useChordSheets } from '@/storage/hooks';

function MyComponent() {
  const { myChordSheets, isLoading, error, refreshMyChordSheets } = useChordSheets();
  
  if (isLoading) return <div>Loading chord sheets...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h3>My Chord Sheets ({myChordSheets.length})</h3>
      {myChordSheets.map(sheet => (
        <div key={sheet.id}>{sheet.title}</div>
      ))}
    </div>
  );
}
```

### Sample Loading Only

```typescript
import { useSampleLoading } from '@/storage/hooks';

function SampleLoader() {
  const { isLoadingSamples, sampleError, loadSamples } = useSampleLoading();
  
  return (
    <button onClick={loadSamples} disabled={isLoadingSamples}>
      {isLoadingSamples ? 'Loading...' : 'Load Samples'}
    </button>
  );
}
```

### Direct Service Usage

```typescript
import { SampleChordSheetsService, indexedDBStorage } from '@/storage/services/sample-chord-sheets';

const service = new SampleChordSheetsService(indexedDBStorage);
await service.loadSampleChordSheets();
```

## API Reference

### useChordSheets Hook

Returns:
- `myChordSheets: StoredChordSheet[]` - All saved chord sheets
- `setMyChordSheets: Function` - Update chord sheets state
- `refreshMyChordSheets: Function` - Refresh from storage
- `isLoading: boolean` - Combined loading state
- `error: Error | null` - Any operation errors

### useSampleLoading Hook

Returns:
- `isLoadingSamples: boolean` - Sample loading state
- `sampleError: Error | null` - Sample loading errors
- `loadSamples: Function` - Trigger sample loading

## Testing

Test suite available at:
- `storage/tests/test-sample-chord-sheets.ts`

Covers:
- IndexedDB storage functionality
- Duplicate prevention
- Development mode restrictions
- Error handling scenarios

## Integration

Available exports:

```typescript
import { 
  useChordSheets,              // Complete chord sheets hook
  useSampleLoading,            // Sample loading hook
  SampleChordSheetsService,    // Service class
  indexedDBStorage             // Storage instance
} from '@/storage';
```

## Benefits

1. **Unified Interface**: Single hook for complete chord sheets functionality
2. **Performance**: Optimized IndexedDB operations with React 19 features
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Modularity**: Clean separation between concerns
5. **Developer Experience**: Automatic sample loading in development mode

## Data Flow

```
Development Mode Startup
├── useChordSheets hook initialization
├── useSampleLoading loads sample data
├── useChordSheetsInitialization coordinates loading
└── Refreshes saved chord sheets (includes samples)
```

The sample chord sheets feature provides a seamless development experience with sample data while maintaining production-ready architecture.

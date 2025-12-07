import { useOptimistic } from "react";
import type { StoredChordSheet } from "../types";
import type { OptimisticChordSheetActions } from "./optimized.types";

type OptimisticAction = 
  | { type: 'add'; payload: StoredChordSheet }
  | { type: 'remove'; payload: string };

/**
 * Hook for optimistic chord sheet updates using React 19
 * 
 * Provides immediate UI feedback when adding/removing chord sheets
 * before the actual database operations complete.
 */
export function useOptimisticChordSheets(
  initialChordSheets: StoredChordSheet[]
): [StoredChordSheet[], OptimisticChordSheetActions] {
  
  const [optimisticChordSheets, updateOptimistic] = useOptimistic(
    initialChordSheets,
    (state: StoredChordSheet[], action: OptimisticAction) => {
      switch (action.type) {
        case 'add':
          return [...state, action.payload];
        case 'remove':
          return state.filter(sheet => sheet.path !== action.payload);
        default:
          return state;
      }
    }
  );

  const actions: OptimisticChordSheetActions = {
    addOptimistic: (chordSheet: StoredChordSheet) => {
      updateOptimistic({ type: 'add', payload: chordSheet });
    },
    removeOptimistic: (path: string) => {
      updateOptimistic({ type: 'remove', payload: path });
    }
  };

  return [optimisticChordSheets, actions];
}

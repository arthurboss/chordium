import { useContext } from 'react';
import {
  ActiveChordSheetContext,
  type ActiveChordSheetContextValue,
} from './ActiveChordSheetContext';

/**
 * Reads the active chord sheet. Returns a null sheet when used outside the
 * provider so a consumer can render without a provider present (e.g. a header
 * rendered in isolation by a test).
 */
export function useActiveChordSheet(): ActiveChordSheetContextValue {
  return useContext(ActiveChordSheetContext) ?? { active: null, setActive: () => {} };
}

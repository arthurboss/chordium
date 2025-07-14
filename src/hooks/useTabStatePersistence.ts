import { useRef, useReducer } from "react";

/**
 * useTabStatePersistence
 *
 * A hook to persist and restore state for each tab by key.
 *
 * Usage:
 *   const { getTabState, setTabState } = useTabStatePersistence<{ [key: string]: MyTabStateType }>();
 *   // getTabState<T>(tabKey, initialState?) returns the state for that tab
 *   // setTabState<T>(tabKey, newState) sets the state for that tab
 */
export function useTabStatePersistence<T extends Record<string, unknown> = Record<string, unknown>>() {
  // Use a ref to store tab states
  const tabStatesRef = useRef<T>({} as T);
  // Use reducer to force re-render when state changes
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);


  function getTabState<S = unknown>(tabKey: string, initialState?: S): S {
    if (!(tabKey in tabStatesRef.current) && initialState !== undefined) {
      // Only set the initial value, do not call forceUpdate here!
      (tabStatesRef.current as Record<string, S>)[tabKey] = initialState;
    }
    return (tabStatesRef.current as Record<string, S>)[tabKey];
  }

  function setTabState<S = unknown>(tabKey: string, newState: S) {
    const prev = (tabStatesRef.current as Record<string, S>)[tabKey];
    if (JSON.stringify(prev) !== JSON.stringify(newState)) {
      (tabStatesRef.current as Record<string, S>)[tabKey] = newState;
      forceUpdate();
    }
  }

  return { getTabState, setTabState };
}

import { useEffect, useRef } from "react";

/**
 * Initialization logic for chord sheet store and DB connection
 */
export function useChordSheetsInit(onReady?: () => void) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // No explicit init required; store is ready for use
      initialized.current = true;
      if (onReady) onReady();
    }
  }, [onReady]);

  return initialized.current;
}

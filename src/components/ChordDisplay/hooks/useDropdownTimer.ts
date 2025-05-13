import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDropdownTimerProps {
  /**
   * Time in milliseconds after which the dropdown menu will auto-close
   * @default 3000
   */
  timeout?: number;
}

/**
 * Hook for dropdown menus with auto-close timer functionality
 * Returns open state and handlers for controlling the dropdown
 */
export const useDropdownTimer = ({ timeout = 3000 }: UseDropdownTimerProps = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [open, setOpen] = useState(false);

  const startCloseTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, timeout);
  }, [timeout]);

  const clearCloseTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Start timer when menu opens
  useEffect(() => {
    if (open) {
      startCloseTimer();
    }
  }, [open, startCloseTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    open,
    setOpen,
    startCloseTimer,
    clearCloseTimer,
  };
};

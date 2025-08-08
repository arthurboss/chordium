import React, { useEffect } from "react";

export interface OverlayProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  backdropClassName?: string;
  maxWidthClassName?: string; // e.g., "max-w-2xl"
  ariaLabel?: string;
}

/**
 * Overlay
 *
 * Accessible modal overlay used to display content on top of the current page.
 * - Adds backdrop with optional blur
 * - Supports ESC key and backdrop-click to close when onClose is provided
 * - Keeps a minimal, dependency-free API aligned with the app's UI patterns
 */
const Overlay: React.FC<OverlayProps> = ({
  open,
  onClose,
  children,
  containerClassName = "",
  backdropClassName = "",
  maxWidthClassName = "max-w-3xl",
  ariaLabel = "Modal",
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className={
        `fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-xl`
      }
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-testid="overlay-backdrop"
    >
      <div
        className={`relative w-full h-full ${maxWidthClassName} ${containerClassName} flex-1 container px-3 py-4 sm:px-4 sm:py-6 mx-auto`}
        data-testid="overlay-container"
      >
        {children}
      </div>
    </div>
  );
};

export default Overlay;



import React from 'react';
import { Card } from './ui/card';

interface StickyBottomContainerProps {
  isAtBottom: boolean;
  className?: string;
  children: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

/**
 * A reusable sticky bottom container for toolbars/controls.
 * Handles margin and background styling, and can be restricted to mobile/desktop only.
 */
const StickyBottomContainer: React.FC<StickyBottomContainerProps> = ({
  isAtBottom,
  className = '',
  children,
  mobileOnly = false,
  desktopOnly = false,
}) => {
  let base =
    'sticky bottom-4 mb-4 z-40 transition-all duration-200 bg-background/70 dark:bg-background/70 backdrop-blur-sm ';

  if (mobileOnly) base += ' sm:hidden';
  if (desktopOnly) base += ' hidden sm:block';
  base += isAtBottom ? ' mx-0' : ' mx-4';

  return (
    <Card className={`${base} ${className}`.trim()}>
      {children}
    </Card>
  );
};

export default StickyBottomContainer;

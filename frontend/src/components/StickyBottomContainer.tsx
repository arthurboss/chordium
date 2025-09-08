import React from 'react';
import { Card } from './ui/card';

interface StickyBottomContainerProps {
  isAtBottom: boolean;
  className?: string;
  children: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  expanded?: boolean;
}

/**
 * A sticky container for toolbars/controls to place at the bottom of the page.
 * Handles margin and background styling, and can be restricted to mobile/desktop only.
 */
const StickyBottomContainer: React.FC<StickyBottomContainerProps> = ({
  isAtBottom,
  className = '',
  children,
  mobileOnly = false,
  desktopOnly = false,
  expanded = false,
}) => {
  const commonStyles = {
    placement: 'sticky bottom-4 z-40',
    background: 'bg-background/70 dark:bg-background/70 backdrop-blur-sm',
    margins: 'mb-4 mt-0 p-2' + ` ${isAtBottom ? 'mx-0' : 'mx-4'}`,
    animation: 'transition-all duration-300 ease-in-out'
  }

  const mobileStyles = {
    visibility: 'sm:hidden',
    display: 'flex',
    flexDirection: expanded ? 'flex-col' : 'flex-row',
    border: 'border rounded-lg',
    maxHeight: expanded ? '200px' : '60px',
    overflow: 'hidden',
    transform: expanded ? 'scale(1)' : 'scale(1)',
    opacity: '1',
  };
  const desktopStyles = {
    visibility: 'hidden sm:flex sm:flex-row',
    placement: 'gap-4',
  };

  let baseStyles = `select-none ${commonStyles.placement} ${commonStyles.animation} ${commonStyles.background} ${commonStyles.margins}`;

  if (mobileOnly) baseStyles += ` ${mobileStyles.visibility} ${mobileStyles.display} ${mobileStyles.border}`;
  if (desktopOnly) baseStyles += ` ${desktopStyles.visibility} ${desktopStyles.placement} p-4 pt-2`;

  return (
    <Card className={`${baseStyles} ${className}`.trim()}>
      {children}
    </Card>
  );
};

export default StickyBottomContainer;

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
 * A sticky container for toolbars/controls to place at the bottom of the page.
 * Handles margin and background styling, and can be restricted to mobile/desktop only.
 */
const StickyBottomContainer: React.FC<StickyBottomContainerProps> = ({
  isAtBottom,
  className = '',
  children,
  mobileOnly = false,
  desktopOnly = false,
}) => {
  const commonStyles = {
    placement: 'sticky bottom-4 z-40',
    background: 'bg-background/70 dark:bg-background/70 backdrop-blur-sm',
    margins: 'mb-4 mt-0 p-2' + ` ${isAtBottom ? 'mx-0' : 'mx-4'}`,
    animation: 'transition-all duration-200',
  }

  const mobileStyles = {
    visibility: 'sm:hidden',
    display: 'flex-row',
    border: 'border rounded-lg',
  };
  const desktopStyles = {
    placement: 'hidden sm:block',
  };

  let baseStyles = `${commonStyles.placement} ${commonStyles.animation} ${commonStyles.background} ${commonStyles.margins}`;

  if (mobileOnly) baseStyles += ` ${mobileStyles.visibility} ${mobileStyles.display} ${mobileStyles.border}`;
  if (desktopOnly) baseStyles += ` ${desktopStyles.placement}`;

  return (
    <Card className={`${baseStyles} ${className}`.trim()}>
      {children}
    </Card>
  );
};

export default StickyBottomContainer;

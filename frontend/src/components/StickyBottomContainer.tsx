import React from "react";
import { Card } from "./ui/card";

interface StickyBottomContainerProps {
  isAtBottom: boolean;
  className?: string;
  children: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  expanded?: boolean;
}

const StickyBottomContainer: React.FC<StickyBottomContainerProps> = ({
  isAtBottom,
  className = "",
  children,
  mobileOnly = false,
  desktopOnly = false,
  expanded = false,
}) => {
  const base = [
    "select-none sticky bottom-4 z-40",
    "bg-background/70 dark:bg-background/70 backdrop-blur-sm",
    "mb-4 mt-0 p-2",
    isAtBottom ? "mx-0" : "mx-4",
    "transition-all duration-300 ease-in-out",
  ];

  if (mobileOnly) {
    base.push("sm:hidden flex border rounded-lg");
    base.push(expanded ? "flex-col" : "flex-row");
  }

  if (desktopOnly) {
    base.push("hidden sm:flex sm:flex-col gap-0 py-2 px-4");
  }

  return (
    <Card id="sticky-bottom-container" className={[...base, className].join(" ").trim()}>
      {children}
    </Card>
  );
};

export default StickyBottomContainer;

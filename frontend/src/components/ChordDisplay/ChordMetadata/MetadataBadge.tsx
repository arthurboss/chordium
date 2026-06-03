import React from "react";
import type { MetadataBadgeProps } from "./MetadataBadge.types";

const MetadataBadge: React.FC<MetadataBadgeProps> = ({ label, value, truncate, onClick, isClickable }) => {
  if (truncate) {
    return (
      <div className="flex overflow-hidden w-full">
        <span className="font-medium text-muted-foreground whitespace-nowrap shrink-0">{label}</span>
        <span
          className={`ml-2 font-medium text-chord-dark dark:text-primary/80 truncate ${isClickable ? 'cursor-pointer hover:underline' : ''}`}
          onClick={onClick}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="whitespace-nowrap">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span
        className={`ml-2 font-medium text-chord-dark dark:text-primary/80 ${isClickable ? 'cursor-pointer hover:underline' : ''}`}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      >
        {value}
      </span>
    </div>
  );
};

export default MetadataBadge;

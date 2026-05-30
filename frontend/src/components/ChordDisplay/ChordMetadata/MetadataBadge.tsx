import React from "react";
import type { MetadataBadgeProps } from "./MetadataBadge.types";

const MetadataBadge: React.FC<MetadataBadgeProps> = ({ label, value, truncate }) => {
  if (truncate) {
    return (
      <div className="flex overflow-hidden w-full">
        <span className="font-medium text-muted-foreground whitespace-nowrap shrink-0">{label}</span>
        <span className="ml-2 font-medium text-chord-dark dark:text-primary/80 truncate">{value}</span>
      </div>
    );
  }

  return (
    <div className="whitespace-nowrap">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="ml-2 font-medium text-chord-dark dark:text-primary/80">{value}</span>
    </div>
  );
};

export default MetadataBadge;

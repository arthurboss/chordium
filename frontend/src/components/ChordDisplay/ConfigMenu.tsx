import React from 'react';
import { DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { Edit, Download } from 'lucide-react';

interface ConfigMenuProps {
  viewMode: string;
  setViewMode: (v: string) => void;
  hideGuitarTabs: boolean;
  setHideGuitarTabs: (v: boolean) => void;
  setIsEditing: (v: boolean) => void;
  handleDownload: () => void;
  isMobile?: boolean;
}

const ConfigMenu: React.FC<ConfigMenuProps> = ({
  viewMode,
  setViewMode,
  hideGuitarTabs,
  setHideGuitarTabs,
  setIsEditing,
  handleDownload,
  isMobile = false,
}) => (
  <DropdownMenuContent align="start">
    {!isMobile && (
      <>
        <DropdownMenuLabel>Display Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setViewMode(viewMode === "tabs-off" ? "tabs-on" : "tabs-off")}
          className={viewMode !== "tabs-off" ? "bg-accent text-accent-foreground" : ""}
        >
          {viewMode === "tabs-off" ? "Show" : "Hide"} Tabs
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setViewMode("lyrics-only")}
          className={viewMode === "lyrics-only" ? "bg-accent text-accent-foreground" : ""}
        >
          Lyrics Only
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </>
    )}
    <DropdownMenuItem onClick={() => setIsEditing(true)}>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" />
      Download
    </DropdownMenuItem>
  </DropdownMenuContent>
);

export default ConfigMenu; 
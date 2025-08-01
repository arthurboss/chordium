import { Button } from "@/components/ui/button";
import type { EmptyChordSheetStateProps } from "./empty-chord-sheet-state.types";

/**
 * Empty state component displayed when no chord sheets are saved
 * Shows message and upload button to guide user to add chord sheets
 */
const EmptyChordSheetState = ({ onUploadClick }: EmptyChordSheetStateProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-3">You haven't saved any chord sheets yet.</p>
      <Button
        onClick={onUploadClick}
        variant="outline"
        tabIndex={0}
        aria-label="Upload a chord sheet"
      >
        Upload a chord sheet
      </Button>
    </div>
  );
};

export default EmptyChordSheetState;

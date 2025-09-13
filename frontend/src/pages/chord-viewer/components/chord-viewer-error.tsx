import ErrorState from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import type { ChordViewerNavigationMethods } from "../chord-viewer.types";

interface ChordViewerErrorProps {
  readonly error: string;
  readonly navigation: ChordViewerNavigationMethods;
  readonly onBack: () => void;
}

/**
 * Error state component for chord viewer
 * Shows error message with appropriate navigation options
 */
export function ChordViewerError({ error, navigation, onBack }: ChordViewerErrorProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <PageHeader onBack={onBack} />
        <ErrorState error={error} />
      </main>
    </div>
  );
}

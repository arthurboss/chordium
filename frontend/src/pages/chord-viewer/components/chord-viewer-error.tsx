import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorState from "@/components/ErrorState";
import NavigationCard from "@/components/NavigationCard";
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
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <NavigationCard onBack={onBack} />
        <ErrorState error={error} />
      </main>
      <Footer />
    </div>
  );
}

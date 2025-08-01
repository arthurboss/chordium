import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingState from "@/components/LoadingState";

/**
 * Loading state component for chord viewer
 * Shows loading indicator while chord sheet data is being fetched
 */
export function ChordViewerLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <LoadingState message="Loading..." />
      </main>
      <Footer />
    </div>
  );
}

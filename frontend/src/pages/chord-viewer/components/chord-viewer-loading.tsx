import LoadingState from "@/components/LoadingState";
import i18n from "@/i18n/config";

export function ChordViewerLoading() {
  return (
    <main id="page-chord-viewer-loading" className="flex-1 w-full max-w-3xl mx-auto py-8 px-4">
      <LoadingState message={i18n.t("errors:loading")} />
    </main>
  );
}

import LoadingState from "@/components/LoadingState";
import i18n from "@/i18n/config";

export function ChordViewerLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 px-4 max-w-3xl mx-auto">
        <LoadingState message={i18n.t("errors:loading")} />
      </main>
    </div>
  );
}

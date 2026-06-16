export function ChordLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4" />
      <p className="text-sm">Loading chord content...</p>
    </div>
  );
}

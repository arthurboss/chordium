import { Card } from "@/components/ui/card";
import { getQueryDisplayText } from "@/utils/search-results-utils";

const EmptyState = ({ searchParams }: { searchParams: any }) => (
  <Card className="p-6 text-center">
    <p className="text-lg font-medium mb-2">No results for {getQueryDisplayText(searchParams)}</p>
    <p className="text-muted-foreground">Try a different search term.</p>
  </Card>
);

export default EmptyState;

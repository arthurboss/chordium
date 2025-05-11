import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SearchBar from "@/components/SearchBar";

const SearchTab = () => {
  return (
    <div className="space-y-4">
      <SearchBar />
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          This is a demo application. In a real implementation, this would search online sources for chord sheets.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SearchTab;

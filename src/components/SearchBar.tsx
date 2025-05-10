
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="flex flex-col sm:flex-row gap-2 w-full mx-auto"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          type="text" 
          placeholder="Search for a song or artist..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 w-full bg-card dark:bg-[var(--card)] "
        />
      </div>
      <Button type="submit" className="sm:w-auto">Search</Button>
    </form>
  );
};

export default SearchBar;

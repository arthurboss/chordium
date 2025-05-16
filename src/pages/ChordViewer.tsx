import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

const ChordViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ title: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const q = query.get("q");

    if (q) {
      setSearchTerm(q);
      setIsLoading(true);
      setError(null);
      axios
        .get(`/api/cifraclub-search?q=${encodeURIComponent(q)}`)
        .then((res) => {
          setResults(res.data);
          setIsLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch results. Please try again later.");
          setIsLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 overflow-x-hidden">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">
            Search Results for "{searchTerm}"
          </h1>
        </div>
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-chord" />
            <p className="mt-4 text-muted-foreground">Searching for chord sheets...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Try Another Search
            </Button>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result, index) => (
              <a
                key={index}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border rounded-lg hover:border-chord transition-colors cursor-pointer bg-white block"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-chord" />
                  <div>
                    <h3 className="font-medium">{result.title}</h3>
                    <p className="text-sm text-muted-foreground">Cifra Club</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p>No chord sheets found for "{searchTerm}"</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Try Another Search
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;

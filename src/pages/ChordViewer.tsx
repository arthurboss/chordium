import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChordSheetViewer from "@/components/ChordSheetViewer";

const ChordViewer = () => {
  const navigate = useNavigate();
  const { artist, song, id } = useParams();
  const location = useLocation();
  
  // Handle back navigation
  const handleBack = () => {
    // If we came from our app, go back in history
    if (document.referrer.includes(window.location.host)) {
      navigate(-1);
    } else {
      // Otherwise go to search page
      navigate("/search");
    }
  };
  
  // Format the title based on available data
  const formatTitle = () => {
    if (artist && song) {
      return `${decodeURIComponent(artist.replace(/-/g, ' '))} - ${decodeURIComponent(song.replace(/-/g, ' '))}`;
    } else if (id) {
      return `Chord Sheet`;
    }
    return 'Chord Sheet';
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 overflow-x-hidden">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {formatTitle()}
          </h1>
        </div>
        <ChordSheetViewer />
      </main>
      <Footer />
    </div>
  );
};

export default ChordViewer;

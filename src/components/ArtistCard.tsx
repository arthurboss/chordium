import { User, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cyAttr } from "@/utils/test-utils";

interface ArtistCardProps {
  artistName: string;
  artistUrl: string;
  onView: (artistUrl: string) => void;
  viewButtonIcon?: "view" | "external";
  viewButtonLabel?: string;
}

const ArtistCard = ({ 
  artistName, 
  artistUrl, 
  onView,
  viewButtonIcon = "view",
  viewButtonLabel
}: ArtistCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer" {...cyAttr(`artist-card-${artistName}`)}>
      <CardContent 
        className="p-4" 
        onClick={() => onView(artistUrl)}
        {...cyAttr(`artist-card-content-${artistName}`)}
      >
        <div className="flex items-start gap-2">
          <User className="h-6 w-6 text-chord mt-1" />
          <div>
            <h3 className="font-semibold text-base" {...cyAttr(`artist-name-${artistName}`)}>{artistName}</h3>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <button 
          className="text-chord hover:underline font-medium text-sm flex items-center gap-1"
          onClick={() => onView(artistUrl)}
          tabIndex={0}
          aria-label={viewButtonLabel || `See songs by ${artistName}`}
          {...cyAttr(`view-artist-btn-${artistName}`)}
        >
          {viewButtonIcon === 'external' ? (
            <ExternalLink className="h-3 w-3" />
          ) : null}
          {viewButtonLabel || "See Songs"}
        </button>
      </CardFooter>
    </Card>
  );
};

export default ArtistCard;

import { Music, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SongData } from "../types/song";

interface SongCardProps {
  song: SongData;
  onView: (song: SongData) => void;
  onDelete: (songId: string) => void;
}

const SongCard = ({ song, onView, onDelete }: SongCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <Music className="h-6 w-6 text-chord mt-1" />
          <div>
            <h3 className="font-semibold text-base">{song.title}</h3>
            {song.artist && (
              <p className="text-muted-foreground text-sm">{song.artist}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-4 py-2 flex justify-between">
        <button 
          className="text-chord hover:underline font-medium text-sm"
          onClick={() => onView(song)}
          tabIndex={0}
          aria-label={`View chords for ${song.title}`}
        >
          View Chords
        </button>
        <button 
          className="text-destructive dark:text-red-500 hover:underline text-sm"
          onClick={() => onDelete(song.id)}
          tabIndex={0}
          aria-label={`Delete ${song.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardFooter>
    </Card>
  );
};

export default SongCard;

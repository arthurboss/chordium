
import { Music, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cyAttr } from "@/utils/test-utils";
import { SEARCH_TYPES, type SearchType } from "@chordium/types";

interface ResultCardProps {
  searchType: Omit<SearchType, 'artist-song'>;
  title: string;
  subtitle?: string;
  path: string;
  onClick: (item: { title: string; artist: string; path: string }) => void;
}

const ResultCard = ({
  searchType,
  title,
  subtitle,
  path,
  onClick,
}: ResultCardProps) => {
  const Icon = searchType === SEARCH_TYPES.SONG ? Music : User;

  return (
    <Card className="overflow-hidden cursor-pointer w-full h-12 min-h-0" {...cyAttr(`${searchType}-card-compact-${path}`)}>
      <CardContent
        className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
        onClick={() => onClick({ title, artist: subtitle || '', path })}
        {...cyAttr(`${searchType}-card-compact-content-${path}`)}
      >
        <Icon className="h-6 w-6 text-chord" />
        <div className="min-w-0 flex-1">
          <h3
            className="w-full block font-semibold truncate text-sm"
            {...cyAttr(`${searchType}-title-${path}`)}
            title={title}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-muted-foreground text-xs truncate w-full block"
              {...cyAttr(`${searchType}-subtitle-${path}`)}
              title={subtitle}
            >
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;

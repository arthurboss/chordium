import { Music, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cyAttr } from "@/utils/test-utils";

import type { ResultCardProps } from './ResultCard.type';

const ResultCard = ({
  result,
  onClick,
}: ResultCardProps) => {
  const path = result.path;
  let Icon: React.ElementType;
  let title: string;
  let subtitle: string | undefined;

  if (result.type === 'song') {
    Icon = Music;
    title = result.title;
    subtitle = result.artist;
  } else {
    Icon = User;
    title = result.displayName;
    subtitle = undefined;
  }

  return (
    <Card className="overflow-hidden cursor-pointer w-full h-12 min-h-0" {...cyAttr(`${result.type}-card-compact-${path}`)}>
      <CardContent
        className="p-4 flex-1 flex flex-row items-center gap-2 min-h-0"
        onClick={() => onClick(result)}
        {...cyAttr(`${result.type}-card-compact-content-${path}`)}
      >
        <Icon className="h-6 w-6 text-chord" />
        <div className="min-w-0 flex-1">
          <h3
            className="w-full block font-semibold truncate text-sm"
            {...cyAttr(`${result.type}-title-${path}`)}
            title={title}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-muted-foreground text-xs truncate w-full block"
              {...cyAttr(`${result.type}-subtitle-${path}`)}
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

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

interface ActionToolbarProps {
  onSearch?: () => void;
  onBack?: () => void;
  backLabel?: string;
  showBackButton?: boolean;
  loadingSearch?: boolean;
  className?: string;
}

/**
 * Generic action toolbar that mimics the style of ChordEditToolbar
 * Can be used for various actions (search, navigation, etc.)
 */
const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onSearch,
  onBack,
  backLabel = 'Back',
  showBackButton = false,
  loadingSearch = false,
  className = '',
}) => {
  return (
    <Card className={`mb-4 ${className}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            {showBackButton && onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                aria-label={`Go ${backLabel.toLowerCase()}`}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {backLabel}
              </Button>
            )}
          </div>
          {onSearch && (
            <Button
              variant="default"
              size="sm"
              onClick={onSearch}
              disabled={loadingSearch}
              aria-label="Search for songs"
            >
              <Search className="mr-1 h-4 w-4" />
              Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ActionToolbar);

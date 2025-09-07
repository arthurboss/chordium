import React from 'react';
import { Button } from '../../../ui/button';
import { Link, Unlink } from 'lucide-react';

interface CapoTransposeLinkProps {
  isLinked: boolean;
  onToggle: () => void;
  title?: string;
}

/**
 * Link button between Capo and Transpose controls
 * When enabled, increasing capo reduces transpose value
 */
const CapoTransposeLink: React.FC<CapoTransposeLinkProps> = ({
  isLinked,
  onToggle,
  title = "Link Capo & Transpose"
}) => {
  return (
    <>
      <div className="text-xs text-muted-foreground mb-1">
        <span>{title}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-auto bg-none transition-colors duration-100 ${
          isLinked 
            ? 'text-primary hover:text-primary/80' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={onToggle}
        title={isLinked ? "Unlink Capo & Transpose" : "Link Capo & Transpose"}
      >
        {isLinked ? <Link size={14} /> : <Unlink size={14} />}
      </Button>
    </>
  );
};

export default CapoTransposeLink;

import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '../ui/dropdown-menu';
import { Music } from 'lucide-react';

interface TransposeMenuProps {
  transpose: number;
  setTranspose: (value: number) => void;
  transposeOptions: number[];
}

const TransposeMenu: React.FC<TransposeMenuProps> = ({ transpose, setTranspose, transposeOptions }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0">
          <Music size={18} className="text-chord" />
          <span className="font-medium text-sm">Transpose: {transpose > 0 ? `+${transpose}` : transpose}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-2">
        <div className="grid grid-cols-5 gap-2">
          {transposeOptions.map((value: number) => (
            <Button
              key={value}
              variant={value === transpose ? "default" : "outline"}
              size="sm"
              className="min-w-[36px] h-8 px-0 text-sm"
              onClick={() => setTranspose(value)}
            >
              {value > 0 ? `+${value}` : value}
            </Button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TransposeMenu;

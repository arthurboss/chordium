import React from 'react';
import { Button } from '../../ui/button';
import { Music } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent 
} from '../../ui/dropdown-menu';
import { useDropdownTimer } from '../hooks/useDropdownTimer';
import { TransposeMenuProps } from '../hooks/types';

/**
 * TransposeMenu dropdown component for chord transposition controls
 */
const TransposeMenu: React.FC<TransposeMenuProps> = ({
  transpose,
  setTranspose,
  transposeOptions,
  buttonClassName = '',
  iconSize = 18,
}) => {
  const { open, setOpen, startCloseTimer, clearCloseTimer } = useDropdownTimer();

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={buttonClassName || "h-8 px-3 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-0"}
        >
          <Music size={iconSize} className="text-chord" />
          <span className="font-medium text-sm">Transpose: {transpose > 0 ? `+${transpose}` : transpose}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="p-2 data-[state=open]:animate-merge-in data-[state=closed]:animate-merge-out"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          e.preventDefault();
          startCloseTimer();
        }}
        onPointerDownOutside={(e) => e.stopPropagation()}
        onTouchStart={clearCloseTimer}
        onTouchEnd={startCloseTimer}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={startCloseTimer}
        style={{
          transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
          opacity: '1'
        }}
      >
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

import React from 'react';
import { Switch } from '../../ui/switch';

interface FontStyleSelectorProps {
  fontStyle: string;
  setFontStyle: (style: string) => void;
}

/**
 * A component for toggling between sans-serif and serif font styles
 */
const FontStyleSelector: React.FC<FontStyleSelectorProps> = ({ fontStyle, setFontStyle }) => {
  return (
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm">Sans</span>
      <Switch
        checked={fontStyle === 'serif'}
        onCheckedChange={(checked) => setFontStyle(checked ? 'serif' : 'sans-serif')}
        className="w-[64px] h-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:data-[state=checked]:translate-x-[40px]"
      />
      <span className="text-sm">Serif</span>
    </div>
  );
};

export default FontStyleSelector;

import React from 'react';
import { Slider } from '../../ui/slider';

interface SliderControlProps {
  /** Current value */
  value: number;
  /** Function to set the value */
  setValue: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step: number;
  /** Label for the control */
  label: string;
  /** Format function for the display value */
  formatValue?: (value: number) => string;
  /** Width for the slider (CSS class) */
  width?: string;
}

/**
 * A reusable slider control component for font-related settings
 */
const SliderControl: React.FC<SliderControlProps> = ({
  value,
  setValue,
  min,
  max,
  step,
  label,
  formatValue = (val) => `${val}`,
  width = 'w-32',
}) => {
  return (
    <div className="px-2 py-1">
      <div className="font-semibold text-xs mb-1">{label}</div>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => setValue(val[0])}
          className={`${width} cursor-pointer`}
        />
        <span className="w-10 text-center text-sm">{formatValue(value)}</span>
      </div>
    </div>
  );
};

export default SliderControl;

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectOption<T extends string> {
  value: T;
  label: string;
}

interface SortSelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SortSelectOption<T>[];
  disabled?: boolean;
}

function SortSelect<T extends string>({ value, onValueChange, options, disabled }: SortSelectProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as T)} disabled={disabled}>
      <SelectTrigger className="h-7 w-auto gap-1 bg-popover px-2 text-xs focus:ring-1 focus:ring-offset-0 [&>span]:text-left">
        <SelectValue />
      </SelectTrigger>
      <SelectContent fitContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} hideCheck>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default SortSelect;

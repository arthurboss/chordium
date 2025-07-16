import { type HTMLAttributes } from "react";
import { cn } from "./utils";

// Using type alias instead of empty interface
type DropdownMenuShortcutProps = HTMLAttributes<HTMLSpanElement>;

const DropdownMenuShortcut = ({
  className,
  ...props
}: DropdownMenuShortcutProps) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export { DropdownMenuShortcut };

import { 
  Root, 
  Trigger, 
  Group, 
  Portal, 
  Sub,
  RadioGroup
} from "@radix-ui/react-dropdown-menu";

// Import all sub-components
import { DropdownMenuSubTrigger } from "./sub-trigger";
import { DropdownMenuSubContent } from "./sub-content";
import { DropdownMenuContent } from "./content";
import { DropdownMenuItem } from "./item";
import { DropdownMenuCheckboxItem } from "./checkbox-item";
import { DropdownMenuRadioItem } from "./radio-item";
import { DropdownMenuLabel } from "./label";
import { DropdownMenuSeparator } from "./separator";
import { DropdownMenuShortcut } from "./shortcut";

// Re-export Radix primitives with proper names
const DropdownMenu = Root;
const DropdownMenuTrigger = Trigger;
const DropdownMenuGroup = Group;
const DropdownMenuPortal = Portal;
const DropdownMenuSub = Sub;
const DropdownMenuRadioGroup = RadioGroup;

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

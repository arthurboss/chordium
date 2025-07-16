import {
  Root,
  Trigger,
  Group,
  Portal,
  Sub,
  RadioGroup
} from "@radix-ui/react-dropdown-menu";

// Import all sub-components
import { DropdownMenuSubTrigger } from "./dropdown-menu/sub-trigger";
import { DropdownMenuSubContent } from "./dropdown-menu/sub-content";
import { DropdownMenuContent } from "./dropdown-menu/content";
import { DropdownMenuItem } from "./dropdown-menu/item";
import { DropdownMenuCheckboxItem } from "./dropdown-menu/checkbox-item";
import { DropdownMenuRadioItem } from "./dropdown-menu/radio-item";
import { DropdownMenuLabel } from "./dropdown-menu/label";
import { DropdownMenuSeparator } from "./dropdown-menu/separator";
import { DropdownMenuShortcut } from "./dropdown-menu/shortcut";

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

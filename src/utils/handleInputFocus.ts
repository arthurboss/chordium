// Utility to handle input focus for cursor placement
// On desktop, moves the cursor to the end of existing text
import { RefObject } from "react";
import { isTouchDevice } from "@/utils/isTouchDevice";

export function handleInputFocus(e: React.FocusEvent<HTMLInputElement>, value: string, inputRef: RefObject<HTMLInputElement>) {
  if (!isTouchDevice() && value && inputRef.current) {
    const len = value.length;
    inputRef.current.setSelectionRange(len, len);
  }
}

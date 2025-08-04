import { createContext } from "react";
import type { SearchStateContextValue } from "./SearchStateContext.types";

export const SearchStateContext = createContext<
  SearchStateContextValue | undefined
>(undefined);

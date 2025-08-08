import { SearchDataState } from "../types/SearchDataState";

export const defaultSearchState: SearchDataState = {
  searchType: "artist",
  results: [],
  query: {
    artist: "",
    song: ""
  }
};

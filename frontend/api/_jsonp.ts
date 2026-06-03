import axios from "axios";

export interface JsonpDoc {
  t: "1" | "2"; // "1" = artist, "2" = song
  m: string;    // name/title
  a: string;    // artist name
  d: string;    // artist slug
  u?: string;   // song slug (only present for songs)
}

export const JSONP_SEARCH_URL = "https://solr.sscdn.co/cc/h2/";

export async function fetchJsonpDocs(query: string): Promise<JsonpDoc[]> {
  const response = await axios.get<string>(JSONP_SEARCH_URL, {
    params: { q: query, callback: "x" },
  });
  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed = JSON.parse(jsonStr);
  return parsed.response?.docs ?? [];
}

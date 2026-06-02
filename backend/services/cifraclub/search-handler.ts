import axios from "axios";
import logger from "../../utils/logger.js";
import SEARCH_TYPES from "../../constants/searchTypes.js";
import type { Artist, Song, SearchType } from "../../../shared/types/index.js";

const JSONP_SEARCH_URL = "https://solr.sscdn.co/cc/h2/";

interface JsonpDoc {
  t: "1" | "2"; // "1" = artist, "2" = song
  m: string;    // name/title
  a: string;    // artist name
  d: string;    // artist slug
  u?: string;   // song slug (only present for songs)
}

interface JsonpResponse {
  response: {
    numFound: number;
    docs: JsonpDoc[];
  };
}

export async function performSearch(
  _baseUrl: string,
  query: string,
  searchType: SearchType
): Promise<Artist[] | Song[]> {
  logger.info(`Searching CifraClub via JSONP for: ${query} (Type: ${searchType})`);

  const response = await axios.get<string>(JSONP_SEARCH_URL, {
    params: { q: query, callback: "x" },
  });

  // Strip JSONP wrapper: x({...}) -> {...}
  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed: JsonpResponse = JSON.parse(jsonStr);
  const docs = parsed.response?.docs ?? [];

  logger.info(`[DATA SOURCE] JSONP (CifraClub search)`);
  logger.debug(`Found ${docs.length} raw results`);

  if (searchType === SEARCH_TYPES.ARTIST) {
    return docs
      .filter((doc) => doc.t === "1" && doc.d)
      .map((doc): Artist => ({
        displayName: doc.m,
        path: doc.d,
        songCount: null,
      }));
  }

  // SONG or ARTIST_SONG: return songs (t==="2", has slug u)
  return docs
    .filter((doc) => doc.t === "2" && doc.d && doc.u)
    .map((doc): Song => ({
      title: doc.m,
      artist: doc.a,
      path: `${doc.d}/${doc.u}`,
    }));
}

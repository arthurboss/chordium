import axios from "axios";
import logger from "../../utils/logger.js";
import SEARCH_TYPES from "../../constants/searchTypes.js";
import type { Artist, Song, SearchType } from "../../../shared/types/index.js";

const JSONP_SEARCH_URL = "https://solr.sscdn.co/cc/h2/";

interface JsonpDoc {
  t: "1" | "2";
  m: string;
  a: string;
  d: string;
  u?: string;
}

interface JsonpResponse {
  response: {
    numFound: number;
    docs: JsonpDoc[];
  };
}

async function fetchJsonpDocs(query: string): Promise<JsonpDoc[]> {
  const response = await axios.get<string>(JSONP_SEARCH_URL, {
    params: { q: query, callback: "x" },
  });
  const jsonStr = response.data.trim().replace(/^x\(/, "").replace(/\)$/, "");
  const parsed: JsonpResponse = JSON.parse(jsonStr);
  return parsed.response?.docs ?? [];
}

export async function performSearch(
  query: string,
  searchType: SearchType
): Promise<Artist[] | Song[]> {
  logger.info(`Searching CifraClub via JSONP for: ${query} (Type: ${searchType})`);

  const docs = await fetchJsonpDocs(query);

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

  return docs
    .filter((doc) => doc.t === "2" && doc.d && doc.u)
    .map((doc): Song => ({
      title: doc.m,
      artist: doc.a,
      path: `${doc.d}/${doc.u}`,
    }));
}

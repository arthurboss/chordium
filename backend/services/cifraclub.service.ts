import config from "../config/config.js";
import { performSearch } from "./cifraclub/search-handler.js";
import { fetchArtistSongs } from "./cifraclub/artist-songs-handler.js";
import { fetchWithProgressiveExtraction, fetchPreferredChordSheet, fetchFullChordSheet, type CascadeResult } from "../utils/chord-sheet-fetcher.js";
import type { Artist, Song, ChordSheet, SongMetadata, SearchType } from "../../shared/types/index.js";

class CifraClubService {
  public readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(
    query: string,
    searchType: SearchType
  ): Promise<Artist[] | Song[]> {
    return performSearch(query, searchType);
  }

  async getArtistSongs(artistUrl: string): Promise<Song[]> {
    return fetchArtistSongs(this.baseUrl, artistUrl);
  }

  async getChordSheet(songUrl: string): Promise<ChordSheet> {
    const progressive = await fetchWithProgressiveExtraction(songUrl);
    return await progressive.getContent();
  }

  async getSongMetadata(songUrl: string): Promise<SongMetadata> {
    const progressive = await fetchWithProgressiveExtraction(songUrl);
    return await progressive.getMetadata();
  }

  /**
   * Fetches a song preferring the simplified arrangement, cascading through
   * simplified-print → full-print → regular routes. Returns content, metadata,
   * which variant was used, and whether it contains tab blocks.
   */
  async getPreferredChordSheet(songUrl: string): Promise<CascadeResult> {
    return fetchPreferredChordSheet(songUrl);
  }

  /**
   * Fetches the full arrangement (with tabs) for the simplified⇄full toggle.
   */
  async getFullChordSheet(songUrl: string): Promise<CascadeResult> {
    return fetchFullChordSheet(songUrl);
  }

}

const cifraClubService = new CifraClubService();

export default cifraClubService;

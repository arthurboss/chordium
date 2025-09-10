import config from "../config/config.js";
import { performSearch } from "./cifraclub/search-handler.js";
import { fetchArtistSongs } from "./cifraclub/artist-songs-handler.js";
import { fetchWithProgressiveExtraction } from "../utils/chord-sheet-fetcher.js";
import type { Artist, Song, ChordSheetContent, SongMetadata, SearchType } from "../../shared/types/index.js";

class CifraClubService {
  public readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(
    query: string,
    searchType: SearchType
  ): Promise<Artist[] | Song[]> {
    return performSearch(this.baseUrl, query, searchType);
  }

  async getArtistSongs(artistUrl: string): Promise<Song[]> {
    return fetchArtistSongs(this.baseUrl, artistUrl);
  }

  async getChordSheet(songUrl: string): Promise<ChordSheetContent> {
    // Return content-only using progressive extraction (no backward compatibility)
    const progressive = await fetchWithProgressiveExtraction(songUrl);
    return await progressive.getContent();
  }

  async getSongMetadata(songUrl: string): Promise<SongMetadata> {
    const progressive = await fetchWithProgressiveExtraction(songUrl);
    return await progressive.getMetadata();
  }

}

const cifraClubService = new CifraClubService();

export default cifraClubService;

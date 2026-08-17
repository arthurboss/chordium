import config from "../config/config.js";
import { performSearch } from "./cifraclub/search-handler.js";
import { fetchArtistSongs } from "./cifraclub/artist-songs-handler.js";
import { fetchWithProgressiveExtraction, fetchPreferredChordSheet, fetchFullChordSheet, type CascadeResult } from "../utils/chord-sheet-fetcher.js";
import type { Song, ChordSheet, SongMetadata, SearchHit } from "../../shared/types/index.js";

class CifraClubService {
  public readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(query: string): Promise<SearchHit[]> {
    return performSearch(query);
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

  async getPreferredChordSheet(songUrl: string): Promise<CascadeResult> {
    return fetchPreferredChordSheet(songUrl);
  }

  async getFullChordSheet(songUrl: string): Promise<CascadeResult> {
    return fetchFullChordSheet(songUrl);
  }
}

const cifraClubService = new CifraClubService();

export default cifraClubService;

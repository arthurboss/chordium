import config from "../config/config.js";
import { performSearch } from "./cifraclub/search-handler.js";
import { fetchArtistSongs } from "./cifraclub/artist-songs-handler.js";
import { fetchChordSheet } from "../utils/chord-sheet-fetcher.js";
import type { Artist, Song, ChordSheet, SearchType } from '../../packages/types/dist';

class CifraClubService {
  public readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(query: string, searchType: SearchType): Promise<Artist[] | Song[]> {
    return performSearch(this.baseUrl, query, searchType);
  }

  async getArtistSongs(artistUrl: string): Promise<Song[]> {
    return fetchArtistSongs(this.baseUrl, artistUrl);
  }

  async getChordSheet(songUrl: string): Promise<ChordSheet> {
    return fetchChordSheet(songUrl);
  }
}

const cifraClubService = new CifraClubService();

export default cifraClubService;

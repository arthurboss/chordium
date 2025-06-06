import config from "../config/config.js";
import { performSearch } from "./cifraclub/search-handler.js";
import { fetchArtistSongs } from "./cifraclub/artist-songs-handler.js";
import { fetchChordSheet } from "../utils/chord-sheet-fetcher.js";

class CifraClubService {
  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(query, searchType) {
    return performSearch(this.baseUrl, query, searchType);
  }

  async getArtistSongs(artistUrl) {
    return fetchArtistSongs(this.baseUrl, artistUrl);
  }

  async getChordSheet(songUrl) {
    return fetchChordSheet(songUrl);
  }
}

const cifraClubService = new CifraClubService();

export default cifraClubService;

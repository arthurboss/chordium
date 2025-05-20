import { URL } from 'url';
import puppeteerService from './puppeteer.service.js';
import config from '../config/config.js';
import SEARCH_TYPES from '../constants/searchTypes.js';
import logger from '../utils/logger.js';

class CifraClubService {
  constructor() {
    this.baseUrl = config.cifraClub.baseUrl;
  }

  async search(query, searchType) {
    const searchUrl = `${this.baseUrl}/?q=${encodeURIComponent(query)}`;
    logger.info(`Searching CifraClub for: ${query} (Type: ${searchType})`);

    return puppeteerService.withPage(async (page) => {
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      logger.debug('Search page loaded, extracting results...');

      const results = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.gsc-result a'));
        return links
          .filter(link => {
            const parent = link.parentElement;
            return parent && parent.className === 'gs-title';
          })
          .map(link => ({
            title: link.textContent.trim(),
            url: link.href.startsWith('http') ? link.href : `${window.location.origin}${link.href}`
          }))
          .filter(r => r.title && r.url);
      });

      logger.debug(`Found ${results.length} total results`);
      return this.filterResults(results, searchType);
    });
  }

  filterResults(results, searchType) {
    const processResult = (result) => ({
      ...result,
      title: result.title.replace(/ - Cifra Club$/, '')
    });

    return results
      .filter(result => this.isValidResult(result, searchType))
      .map(processResult);
  }

  isValidResult(result, searchType) {
    try {
      const url = new URL(result.url);
      const path = url.pathname.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
      const segments = path.split('/').filter(Boolean);

      switch (searchType) {
        case SEARCH_TYPES.ARTIST:
          return segments.length === 1;
        case SEARCH_TYPES.SONG:
          return segments.length === 2;
        case SEARCH_TYPES.COMBINED:
          return segments.length <= 2;
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }

  async getArtistSongs(artistUrl) {
    const artistSlug = this.extractArtistSlug(artistUrl);
    if (!artistSlug) {
      throw new Error('Invalid artist URL');
    }

    const pageUrl = `${this.baseUrl}/${artistSlug}/`;
    logger.info(`Fetching songs for artist: ${artistSlug}`);

    return puppeteerService.withPage(async (page) => {
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
      logger.debug('Artist page loaded, extracting songs...');

      return page.evaluate(() => {
        const songMap = new Map();
        
        document.querySelectorAll('a.art_music-link').forEach(link => {
          try {
            const title = link.textContent.trim();
            const url = link.href;
            if (title && url) {
              songMap.set(url, {
                title: title.replace(/\s+/g, ' ').trim(),
                url
              });
            }
          } catch (e) {
            console.error('Error processing song:', e);
          }
        });

        return Array.from(songMap.values());
      });
    });
  }

  async getChordSheet(songUrl) {
    logger.info(`Fetching chord sheet from: ${songUrl}`);
    
    return puppeteerService.withPage(async (page) => {
      await page.goto(songUrl, { waitUntil: 'networkidle2' });
      logger.debug('Song page loaded, extracting chord sheet...');

      return page.evaluate(() => {
        const preElement = document.querySelector('pre');
        return preElement ? preElement.textContent : '';
      });
    });
  }

  extractArtistSlug(url) {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
      return path.split('/')[0];
    } catch (e) {
      return null;
    }
  }
}

const cifraClubService = new CifraClubService();

export default cifraClubService;

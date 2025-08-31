/**
 * Service to persist the last search URL across component unmounts
 * This ensures that when switching tabs, the URL is preserved
 */

const STORAGE_KEY = 'chordium_last_search_url';

export class UrlPersistenceService {
  private static instance: UrlPersistenceService;
  private currentUrl: string | null = null;

  private constructor() {
    // Load from localStorage on initialization
    this.currentUrl = this.loadFromStorage();
  }

  static getInstance(): UrlPersistenceService {
    if (!UrlPersistenceService.instance) {
      UrlPersistenceService.instance = new UrlPersistenceService();
    }
    return UrlPersistenceService.instance;
  }

  private loadFromStorage(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to load URL from localStorage:', error);
      return null;
    }
  }

  private saveToStorage(url: string | null): void {
    try {
      if (url) {
        localStorage.setItem(STORAGE_KEY, url);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save URL to localStorage:', error);
    }
  }

  setLastSearchUrl(url: string | null): void {
    console.log('🔄 UrlPersistenceService: setting URL:', url);
    this.currentUrl = url;
    this.saveToStorage(url);
  }

  getLastSearchUrl(): string | null {
    return this.currentUrl;
  }

  clearLastSearchUrl(): void {
    this.setLastSearchUrl(null);
  }
}

// Export a singleton instance
export const urlPersistenceService = UrlPersistenceService.getInstance();

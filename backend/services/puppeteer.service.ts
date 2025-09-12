import puppeteer, { type Browser, type Page } from 'puppeteer';
import config from '../config/config.js';
import logger from '../utils/logger.js';

class PuppeteerService {
  private browser: Browser | null = null;
  private isInitializing: boolean = false;
  private lastActivity: number = Date.now();
  private keepAliveTimer: NodeJS.Timeout | null = null;

  async init(): Promise<Browser> {
    if (this.browser && !this.browser.process()?.killed) {
      this.updateActivity();
      return this.browser;
    }

    if (this.isInitializing) {
      // Wait for ongoing initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.browser && !this.browser.process()?.killed) {
        return this.browser;
      }
    }

    this.isInitializing = true;
    try {
      await this.launchBrowser();
      this.setupBrowserEventHandlers();
      this.startKeepAliveTimer();
      logger.info('Puppeteer browser instance created with recovery mechanisms');
    } finally {
      this.isInitializing = false;
    }

    return this.browser!;
  }

  private async launchBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        logger.warn('Error closing existing browser during restart:', error);
      }
      this.browser = null;
    }

    this.browser = await puppeteer.launch({
      headless: config.puppeteer.headless,
      args: config.puppeteer.args
    });
    
    this.updateActivity();
    logger.info('Puppeteer browser instance launched');
  }

  private setupBrowserEventHandlers(): void {
    if (!this.browser) return;

    this.browser.on('disconnected', () => {
      logger.warn('Puppeteer browser disconnected - will restart on next request');
      this.browser = null;
      this.clearKeepAliveTimer();
    });

    this.browser.on('targetcreated', () => {
      this.updateActivity();
    });

    this.browser.on('targetdestroyed', () => {
      this.updateActivity();
    });
  }

  private startKeepAliveTimer(): void {
    this.clearKeepAliveTimer();
    
    const keepAliveInterval = config.puppeteer.keepAlive || 10 * 60 * 1000;
    this.keepAliveTimer = setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      
      if (timeSinceActivity > keepAliveInterval) {
        logger.info('Browser has been inactive - restarting to prevent sleep');
        this.restartBrowser().catch(error => {
          logger.error('Error during scheduled browser restart:', error);
        });
      }
    }, Math.min(keepAliveInterval / 2, 5 * 60 * 1000)); // Check every 5 minutes or half the keep-alive time
  }

  private clearKeepAliveTimer(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
  }

  private async restartBrowser(): Promise<void> {
    logger.info('Restarting Puppeteer browser...');
    try {
      await this.launchBrowser();
      this.setupBrowserEventHandlers();
      this.startKeepAliveTimer();
      logger.info('Puppeteer browser restarted successfully');
    } catch (error) {
      logger.error('Failed to restart Puppeteer browser:', error);
      throw error;
    }
  }

  async createPage(): Promise<Page> {
    const maxRetries = config.puppeteer.maxRetries || 3;
    const retryDelay = config.puppeteer.retryDelay || 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.browser || this.browser.process()?.killed) {
          await this.init();
        }

        const page = await this.browser!.newPage();
        this.updateActivity();
        
        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });
        
        // Set extra headers
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        });
        
        await this.setupRequestInterception(page);
        return page;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to create page (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to create page after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Check if it's a browser connection issue
        if (errorMessage.includes('Protocol error') || 
            errorMessage.includes('Connection closed') ||
            errorMessage.includes('Target closed') ||
            errorMessage.includes('Session closed')) {
          logger.info('Browser connection issue detected - restarting browser');
          this.browser = null;
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected error in createPage - should not reach here');
  }

  private async setupRequestInterception(page: Page): Promise<void> {
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (config.cifraClub.blockedDomains.some(domain => request.url().includes(domain))) {
        logger.debug(`Blocking ad request: ${request.url()}`);
        void request.abort();
      } else {
        void request.continue();
      }
    });
  }

  async close(): Promise<void> {
    this.clearKeepAliveTimer();
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        logger.warn('Error closing browser:', error);
      }
      this.browser = null;
      logger.info('Puppeteer browser instance closed');
    }
  }

  async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
    const maxRetries = config.puppeteer.maxRetries || 3;
    const retryDelay = config.puppeteer.retryDelay || 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let page: Page | null = null;
      try {
        page = await this.createPage();
        this.updateActivity();
        const result = await callback(page);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`withPage operation failed (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
        
        if (attempt === maxRetries) {
          throw new Error(`withPage operation failed after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Check if it's a browser connection issue that requires restart
        if (errorMessage.includes('Protocol error') || 
            errorMessage.includes('Connection closed') ||
            errorMessage.includes('Target closed') ||
            errorMessage.includes('Session closed') ||
            errorMessage.includes('Navigation failed')) {
          logger.info('Browser connection issue detected during operation - restarting browser');
          this.browser = null;
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (page) {
          try {
            await page.close();
          } catch (error) {
            logger.warn('Error closing page:', error);
          }
        }
      }
    }

    throw new Error('Unexpected error in withPage - should not reach here');
  }

  /**
   * Force restart the browser instance
   * Useful for recovery from critical errors
   */
  async forceRestart(): Promise<void> {
    logger.info('Force restarting Puppeteer browser...');
    await this.restartBrowser();
  }

  /**
   * Check if the browser is healthy and connected
   */
  isHealthy(): boolean {
    return this.browser !== null && !this.browser.process()?.killed;
  }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;

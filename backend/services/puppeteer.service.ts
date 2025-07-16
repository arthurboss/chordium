import puppeteer, { type Browser, type Page } from 'puppeteer';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

class PuppeteerService {
  private browser: Browser | null = null;

  async init(): Promise<Browser> {
    if (!this.browser) {
      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        '/opt/render/.cache/puppeteer/chrome/linux-138.0.7204.94/chrome-linux64/chrome';

      // Debug logs
      console.log('=== Puppeteer Debug Info ===');
      console.log('Current working directory:', process.cwd());
      console.log('Node version:', process.version);
      console.log('Environment variables (filtered):', {
        PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
        PATH: process.env.PATH,
        NODE_ENV: process.env.NODE_ENV,
      });
      console.log('Launching Puppeteer from:', executablePath);
      console.log('Exists?', fs.existsSync(executablePath));
      try {
        const dir = path.dirname(executablePath);
        if (fs.existsSync(dir)) {
          console.log('Contents of Chrome directory:', fs.readdirSync(dir));
        } else {
          console.log('Chrome directory does not exist:', dir);
        }
        const cacheDir = '/opt/render/.cache/puppeteer';
        if (fs.existsSync(cacheDir)) {
          console.log('Contents of Puppeteer cache directory:', fs.readdirSync(cacheDir));
        } else {
          console.log('Puppeteer cache directory does not exist:', cacheDir);
        }
      } catch (err) {
        console.log('Error reading directories:', err);
      }
      console.log('============================');

      this.browser = await puppeteer.launch({
        headless: config.puppeteer.headless,
        args: config.puppeteer.args,
        executablePath,
      });
      logger.info('Puppeteer browser instance created');
    }
    return this.browser;
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.init();
    }
    const page = await this.browser!.newPage();
    
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
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser instance closed');
    }
  }

  async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
    const page = await this.createPage();
    try {
      return await callback(page);
    } finally {
      await page.close();
    }
  }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;

import puppeteer from 'puppeteer';
import config from '../config/config.js';
import logger from '../utils/logger.js';

class PuppeteerService {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: config.puppeteer.headless,
        args: config.puppeteer.args
      });
      logger.info('Puppeteer browser instance created');
    }
    return this.browser;
  }

  async createPage() {
    if (!this.browser) {
      await this.init();
    }
    const page = await this.browser.newPage();
    await this.setupRequestInterception(page);
    return page;
  }

  async setupRequestInterception(page) {
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (config.cifraClub.blockedDomains.some(domain => request.url().includes(domain))) {
        logger.debug(`Blocking ad request: ${request.url()}`);
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Puppeteer browser instance closed');
    }
  }

  async withPage(callback) {
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

/**
 * Tests for Puppeteer Service Browser Recovery
 * Tests the new browser lifecycle management and recovery mechanisms
 */

import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals";

// Mock the config
jest.unstable_mockModule('../../config/config.js', () => ({
  default: {
    puppeteer: {
      headless: true,
      args: ['--no-sandbox'],
      keepAlive: 60000, // 1 minute for testing
      maxRetries: 2,
      retryDelay: 100
    }
  }
}));

// Mock the logger
jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Import after mocking
const puppeteerService = (await import('../../services/puppeteer.service.js')).default;

describe('Puppeteer Service Browser Recovery', () => {
  beforeEach(async () => {
    // Clean up any existing browser
    await puppeteerService.close();
  });

  afterEach(async () => {
    // Clean up after each test
    await puppeteerService.close();
  });

  it('should initialize browser successfully', async () => {
    const browser = await puppeteerService.init();
    expect(browser).toBeDefined();
    expect(puppeteerService.isHealthy()).toBe(true);
  });

  it('should detect unhealthy browser state', async () => {
    // Initially no browser
    expect(puppeteerService.isHealthy()).toBe(false);
    
    // After initialization
    await puppeteerService.init();
    expect(puppeteerService.isHealthy()).toBe(true);
    
    // After closing
    await puppeteerService.close();
    expect(puppeteerService.isHealthy()).toBe(false);
  });

  it('should create page with retry mechanism', async () => {
    await puppeteerService.init();
    
    const page = await puppeteerService.createPage();
    expect(page).toBeDefined();
    
    await page.close();
  });

  it('should handle withPage operations with retry', async () => {
    await puppeteerService.init();
    
    const result = await puppeteerService.withPage(async (page) => {
      expect(page).toBeDefined();
      return 'test-result';
    });
    
    expect(result).toBe('test-result');
  });

  it('should force restart browser', async () => {
    await puppeteerService.init();
    expect(puppeteerService.isHealthy()).toBe(true);
    
    await puppeteerService.forceRestart();
    expect(puppeteerService.isHealthy()).toBe(true);
  });

  it('should handle multiple initialization calls gracefully', async () => {
    // Multiple concurrent init calls should not cause issues
    const promises = [
      puppeteerService.init(),
      puppeteerService.init(),
      puppeteerService.init()
    ];
    
    const browsers = await Promise.all(promises);
    expect(browsers).toHaveLength(3);
    expect(browsers.every(browser => browser !== null)).toBe(true);
    expect(puppeteerService.isHealthy()).toBe(true);
  });
});

import { chromium, Browser, Page } from 'playwright';
import { ScrapingPlan, ScrapingResult, TaskLog } from '../types/index.js';
import path from 'path';
import fs from 'fs/promises';

export class PlaywrightScrapingService {
  private browser: Browser | null = null;
  private logs: TaskLog[] = [];
  private screenshotDir = 'screenshots';

  constructor() {
    this.ensureScreenshotDir();
  }

  private async ensureScreenshotDir() {
    try {
      await fs.mkdir(this.screenshotDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create screenshot directory:', error);
    }
  }

  private addLog(level: TaskLog['level'], message: string, objectiveId: string) {
    const log: TaskLog = {
      timestamp: new Date(),
      level,
      message,
      objectiveId
    };
    this.logs.push(log);
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true, // Set to false for debugging
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async executeScraping(
    objectiveId: string,
    plan: ScrapingPlan,
    url: string
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    let page: Page | null = null;
    const screenshots: string[] = [];

    try {
      await this.initBrowser();
      if (!this.browser) throw new Error('Failed to initialize browser');

      // Create new page with human-like settings
      page = await this.browser.newPage({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      // Set realistic timeouts
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      this.addLog('info', 'Starting scraping execution...', objectiveId);

      // Execute each step in the plan
      for (const step of plan.steps) {
        await this.executeStep(page, step, objectiveId, screenshots);
        
        // Add human-like delay between actions
        await this.humanDelay();
      }

      // Extract data using selectors
      const extractedData = await this.extractData(page, plan, objectiveId);

      const duration = Date.now() - startTime;
      this.addLog('success', `Scraping completed! Extracted ${extractedData.length} items in ${duration}ms`, objectiveId);

      return {
        objectiveId,
        data: extractedData,
        metadata: {
          url,
          timestamp: new Date(),
          duration,
          itemsExtracted: extractedData.length,
          screenshots
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.addLog('error', `Scraping failed: ${errorMessage}`, objectiveId);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async executeStep(
    page: Page, 
    step: ScrapingPlan['steps'][0], 
    objectiveId: string,
    screenshots: string[]
  ): Promise<void> {
    this.addLog('info', step.description, objectiveId);

    try {
      switch (step.action) {
        case 'navigate':
          if (step.target) {
            await page.goto(step.target, { waitUntil: 'networkidle' });
          }
          break;

        case 'wait':
          const waitTime = parseInt(step.target || '1000');
          await page.waitForTimeout(waitTime);
          break;

        case 'click':
          if (step.selector) {
            await page.click(step.selector);
            await page.waitForTimeout(1000); // Wait after click
          }
          break;

        case 'scroll':
          const scrollAmount = parseInt(step.target || '500');
          await page.evaluate((amount) => {
            window.scrollBy(0, amount);
          }, scrollAmount);
          await page.waitForTimeout(1000);
          break;

        case 'type':
          if (step.selector && step.value) {
            await page.fill(step.selector, step.value);
            await page.waitForTimeout(500);
          }
          break;

        case 'screenshot':
          const screenshotPath = path.join(this.screenshotDir, `${objectiveId}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          screenshots.push(screenshotPath);
          break;

        case 'extract':
          // This will be handled separately in extractData
          break;
      }
    } catch (error) {
      this.addLog('warning', `Step failed: ${step.description} - ${error}`, objectiveId);
    }
  }

  private async extractData(
    page: Page, 
    plan: ScrapingPlan, 
    objectiveId: string
  ): Promise<Record<string, any>[]> {
    this.addLog('info', 'Extracting data using selectors...', objectiveId);

    try {
      // Fix: Pass selectors and dataFields as a single object argument
      const data = await page.evaluate((planData) => {
        const { selectors, dataFields } = planData;
        const results: Record<string, any>[] = [];
        
        // Try to find container elements that might hold multiple items
        const containers = document.querySelectorAll([
          '[data-testid*="item"]',
          '.item',
          '.product',
          '.card',
          '.listing',
          'article',
          'li:not(nav li):not(ul.menu li)',
          'tr:not(thead tr)',
          '.book',
          '.result'
        ].join(', '));

        console.log(`Found ${containers.length} potential containers`);

        if (containers.length > 1) {
          // Multiple items detected
          containers.forEach((container, index) => {
            const item: Record<string, any> = {};
            let hasData = false;
            
            dataFields.forEach((field: string) => {
              const selector = selectors[field];
              if (selector) {
                // Try to find element within the container first
                let element = container.querySelector(selector);
                
                // If not found in container, try the container itself
                if (!element && container.matches(selector)) {
                  element = container;
                }
                
                if (element) {
                  const text = element.textContent?.trim() || '';
                  if (text) {
                    item[field] = text;
                    hasData = true;
                  }
                }
              }
            });
            
            // Only add if we found some meaningful data
            if (hasData && Object.keys(item).length > 0) {
              results.push({ ...item, index: index + 1 });
            }
          });
        } else {
          // Single item or page-level extraction
          const item: Record<string, any> = {};
          let hasData = false;
          
          dataFields.forEach((field: string) => {
            const selector = selectors[field];
            if (selector) {
              const elements = document.querySelectorAll(selector);
              if (elements.length === 1) {
                const text = elements[0].textContent?.trim() || '';
                if (text) {
                  item[field] = text;
                  hasData = true;
                }
              } else if (elements.length > 1) {
                // Multiple elements, collect all non-empty text
                const texts = Array.from(elements)
                  .map(el => el.textContent?.trim())
                  .filter(text => text && text.length > 0);
                if (texts.length > 0) {
                  item[field] = texts;
                  hasData = true;
                }
              }
            }
          });
          
          if (hasData && Object.keys(item).length > 0) {
            results.push(item);
          }
        }
        
        console.log(`Extracted ${results.length} items:`, results);
        return results;
      }, { selectors: plan.selectors, dataFields: plan.dataFields });

      this.addLog('info', `Successfully extracted ${data.length} items`, objectiveId);
      return data;

    } catch (error) {
      this.addLog('error', `Data extraction failed: ${error}`, objectiveId);
      return [];
    }
  }

  private async humanDelay(): Promise<void> {
    // Random delay between 500-2000ms to simulate human behavior
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  getLogs(objectiveId?: string): TaskLog[] {
    return objectiveId 
      ? this.logs.filter(log => log.objectiveId === objectiveId)
      : this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const scrapingService = new PlaywrightScrapingService();
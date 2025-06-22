import { ScrapingPlan, ScrapingResult, TaskLog } from '../types';

export class ScrapingService {
  private logs: TaskLog[] = [];
  private onLogUpdate?: (logs: TaskLog[]) => void;

  setLogCallback(callback: (logs: TaskLog[]) => void) {
    this.onLogUpdate = callback;
  }

  private addLog(level: TaskLog['level'], message: string, objectiveId: string) {
    const log: TaskLog = {
      timestamp: new Date(),
      level,
      message,
      objectiveId
    };
    this.logs.push(log);
    this.onLogUpdate?.(this.logs);
  }

  async executeScraping(
    objectiveId: string,
    plan: ScrapingPlan,
    url: string
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    this.addLog('info', 'Starting scraping execution...', objectiveId);

    try {
      // Simulate scraping execution since Playwright requires Node.js backend
      // In a real implementation, this would communicate with a backend service
      
      this.addLog('info', `Navigating to ${url}`, objectiveId);
      await this.delay(1000);
      
      this.addLog('info', 'Page loaded successfully', objectiveId);
      await this.delay(500);
      
      // Simulate data extraction based on the plan
      const mockData = await this.simulateDataExtraction(plan, objectiveId);
      
      const duration = Date.now() - startTime;
      this.addLog('success', `Scraping completed! Extracted ${mockData.length} items in ${duration}ms`, objectiveId);
      
      return {
        objectiveId,
        data: mockData,
        metadata: {
          url,
          timestamp: new Date(),
          duration,
          itemsExtracted: mockData.length
        }
      };
    } catch (error) {
      this.addLog('error', `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`, objectiveId);
      throw error;
    }
  }

  private async simulateDataExtraction(plan: ScrapingPlan, objectiveId: string): Promise<Record<string, any>[]> {
    this.addLog('info', 'Extracting data using selectors...', objectiveId);
    await this.delay(1500);
    
    // Generate mock data based on the plan's data fields
    const mockData: Record<string, any>[] = [];
    const itemCount = Math.floor(Math.random() * 10) + 5; // 5-15 items
    
    for (let i = 0; i < itemCount; i++) {
      const item: Record<string, any> = {};
      
      plan.dataFields.forEach(field => {
        switch (field.toLowerCase()) {
          case 'title':
          case 'name':
            item[field] = `Sample Item ${i + 1}`;
            break;
          case 'price':
          case 'cost':
            item[field] = `$${(Math.random() * 100 + 10).toFixed(2)}`;
            break;
          case 'description':
            item[field] = `This is a sample description for item ${i + 1}`;
            break;
          case 'url':
          case 'link':
            item[field] = `https://example.com/item/${i + 1}`;
            break;
          default:
            item[field] = `Sample ${field} ${i + 1}`;
        }
      });
      
      mockData.push(item);
    }
    
    this.addLog('info', `Successfully extracted ${mockData.length} items`, objectiveId);
    return mockData;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLogs(): TaskLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.onLogUpdate?.([]);
  }
}

export const scrapingService = new ScrapingService();
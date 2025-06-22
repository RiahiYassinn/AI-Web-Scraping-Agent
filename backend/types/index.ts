export interface ScrapingObjective {
  id: string;
  description: string;
  url: string;
  status: 'pending' | 'analyzing' | 'scraping' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ScrapingPlan {
  steps: ScrapingStep[];
  selectors: Record<string, string>;
  dataFields: string[];
}

export interface ScrapingStep {
  action: 'navigate' | 'click' | 'extract' | 'wait' | 'scroll' | 'type' | 'screenshot';
  target?: string;
  description: string;
  selector?: string;
  value?: string;
}

export interface ScrapingResult {
  objectiveId: string;
  data: Record<string, any>[];
  metadata: {
    url: string;
    timestamp: Date;
    duration: number;
    itemsExtracted: number;
    screenshots?: string[];
  };
}

export interface TaskLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  objectiveId: string;
}

export interface CreateObjectiveRequest {
  description: string;
  url: string;
}

export interface ObjectiveResponse {
  objective: ScrapingObjective;
  logs: TaskLog[];
  result?: ScrapingResult;
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreateObjectiveRequest {
  description: string;
  url: string;
}

export interface ApiObjective {
  id: string;
  description: string;
  url: string;
  status: 'pending' | 'analyzing' | 'scraping' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ApiTaskLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  objectiveId: string;
}

export interface ApiScrapingResult {
  objectiveId: string;
  data: Record<string, any>[];
  metadata: {
    url: string;
    timestamp: string;
    duration: number;
    itemsExtracted: number;
    screenshots?: string[];
  };
}

export interface ObjectiveResponse {
  objective: ApiObjective;
  logs: ApiTaskLog[];
  result?: ApiScrapingResult;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createObjective(data: CreateObjectiveRequest): Promise<{ objective: ApiObjective }> {
    return this.request('/objectives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getObjectives(): Promise<{ objectives: ApiObjective[] }> {
    return this.request('/objectives');
  }

  async getObjective(id: string): Promise<ObjectiveResponse> {
    return this.request(`/objectives/${id}`);
  }

  async getObjectiveLogs(id: string): Promise<{ logs: ApiTaskLog[] }> {
    return this.request(`/objectives/${id}/logs`);
  }

  async deleteObjective(id: string): Promise<{ success: boolean }> {
    return this.request(`/objectives/${id}`, { method: 'DELETE' });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
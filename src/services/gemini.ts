import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScrapingPlan } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeObjective(objective: string, url: string): Promise<ScrapingPlan> {
    const prompt = `
Analyze this web scraping objective and create a detailed scraping plan:

Objective: ${objective}
Target URL: ${url}

Please provide a JSON response with:
1. "steps": Array of scraping steps with actions (navigate, click, extract, wait, scroll)
2. "selectors": Object mapping data fields to CSS selectors
3. "dataFields": Array of data field names to extract

Consider common web elements like:
- Product listings, prices, titles, descriptions
- Table data, article content, contact information
- Pagination, infinite scroll, modal dialogs
- Form inputs, buttons, links

Response must be valid JSON only, no markdown formatting.

Example format:
{
  "steps": [
    {"action": "navigate", "target": "${url}", "description": "Navigate to target page"},
    {"action": "wait", "target": "2000", "description": "Wait for page to load"},
    {"action": "extract", "description": "Extract main data"}
  ],
  "selectors": {
    "title": "h1, .title, .product-name",
    "price": ".price, .cost, [data-price]",
    "description": ".description, .summary, p"
  },
  "dataFields": ["title", "price", "description"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to ensure it's valid JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }
      
      const plan = JSON.parse(jsonMatch[0]);
      
      // Validate the plan structure
      if (!plan.steps || !Array.isArray(plan.steps)) {
        throw new Error('Invalid plan structure: missing steps array');
      }
      
      return plan as ScrapingPlan;
    } catch (error) {
      console.error('Error analyzing objective:', error);
      throw new Error(`Failed to analyze objective: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
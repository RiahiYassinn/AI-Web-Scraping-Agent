import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScrapingPlan } from '../types/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY ;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeObjective(objective: string, url: string): Promise<ScrapingPlan> {
    const prompt = `
Analyze this web scraping objective and create a detailed scraping plan for Playwright automation:

Objective: ${objective}
Target URL: ${url}

Create a JSON response with:
1. "steps": Array of scraping steps with actions (navigate, wait, click, scroll, extract, type, screenshot)
2. "selectors": Object mapping data fields to CSS selectors (use robust selectors)
3. "dataFields": Array of data field names to extract

Consider:
- Page loading times and dynamic content
- Common web patterns (product listings, tables, articles, forms)
- Pagination and infinite scroll
- Modal dialogs and popups
- Anti-bot measures (reasonable delays)

Use human-like behavior:
- Add wait times between actions
- Use realistic scroll speeds
- Handle common UI patterns

Response must be valid JSON only:

{
  "steps": [
    {"action": "navigate", "target": "${url}", "description": "Navigate to target page"},
    {"action": "wait", "target": "3000", "description": "Wait for page to load"},
    {"action": "screenshot", "description": "Take initial screenshot"},
    {"action": "scroll", "target": "500", "description": "Scroll to reveal content"},
    {"action": "extract", "description": "Extract main data"}
  ],
  "selectors": {
    "title": "h1, .title, .product-name, [data-testid*='title']",
    "price": ".price, .cost, [data-price], .amount",
    "description": ".description, .summary, p, .content"
  },
  "dataFields": ["title", "price", "description"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }
      
      const plan = JSON.parse(jsonMatch[0]);
      
      // Validate plan structure
      if (!plan.steps || !Array.isArray(plan.steps) || !plan.selectors || !plan.dataFields) {
        throw new Error('Invalid plan structure from Gemini');
      }
      
      return plan as ScrapingPlan;
    } catch (error) {
      console.error('Error analyzing objective:', error);
      throw new Error(`Failed to analyze objective: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
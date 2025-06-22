import express from 'express';
import cors from 'cors';
import { geminiService } from './services/gemini.js';
import { scrapingService } from './services/scraper.js';
import { ScrapingObjective, CreateObjectiveRequest, ObjectiveResponse } from './types/index.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a proper database)
const objectives: Map<string, ScrapingObjective> = new Map();
const results: Map<string, any> = new Map();

// Routes
app.post('/api/objectives', async (req, res) => {
  try {
    const { description, url }: CreateObjectiveRequest = req.body;
    
    if (!description || !url) {
      return res.status(400).json({ error: 'Description and URL are required' });
    }

    // Create objective
    const objective: ScrapingObjective = {
      id: Date.now().toString(),
      description,
      url,
      status: 'pending',
      createdAt: new Date()
    };

    objectives.set(objective.id, objective);

    // Start processing asynchronously
    processObjective(objective.id).catch(error => {
      console.error(`Failed to process objective ${objective.id}:`, error);
      const obj = objectives.get(objective.id);
      if (obj) {
        obj.status = 'failed';
        obj.error = error.message;
        obj.completedAt = new Date();
        objectives.set(objective.id, obj);
      }
    });

    res.json({ objective });
  } catch (error) {
    console.error('Error creating objective:', error);
    res.status(500).json({ error: 'Failed to create objective' });
  }
});

app.get('/api/objectives', (req, res) => {
  const objectivesList = Array.from(objectives.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json({ objectives: objectivesList });
});

app.get('/api/objectives/:id', (req, res) => {
  const { id } = req.params;
  const objective = objectives.get(id);
  
  if (!objective) {
    return res.status(404).json({ error: 'Objective not found' });
  }

  const logs = scrapingService.getLogs(id);
  const result = results.get(id);

  const response: ObjectiveResponse = {
    objective,
    logs,
    result
  };

  res.json(response);
});

app.get('/api/objectives/:id/logs', (req, res) => {
  const { id } = req.params;
  const logs = scrapingService.getLogs(id);
  res.json({ logs });
});

app.delete('/api/objectives/:id', (req, res) => {
  const { id } = req.params;
  objectives.delete(id);
  results.delete(id);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function processObjective(objectiveId: string): Promise<void> {
  const objective = objectives.get(objectiveId);
  if (!objective) return;

  try {
    // Update status to analyzing
    objective.status = 'analyzing';
    objectives.set(objectiveId, objective);

    // Analyze with Gemini
    const plan = await geminiService.analyzeObjective(objective.description, objective.url);
    
    // Update status to scraping
    objective.status = 'scraping';
    objectives.set(objectiveId, objective);

    // Execute scraping with Playwright
    const result = await scrapingService.executeScraping(objectiveId, plan, objective.url);
    
    // Store result
    results.set(objectiveId, result);
    
    // Update status to completed
    objective.status = 'completed';
    objective.completedAt = new Date();
    objectives.set(objectiveId, objective);

  } catch (error) {
    objective.status = 'failed';
    objective.error = error instanceof Error ? error.message : 'Unknown error';
    objective.completedAt = new Date();
    objectives.set(objectiveId, objective);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await scrapingService.closeBrowser();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

// Middleware
app.use(cors());
app.use(express.json());

// Cache for articles
let articlesCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 60000; // 1 minute

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all articles
app.get('/api/articles', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached data if fresh
    if (articlesCache.data && (now - articlesCache.timestamp < CACHE_DURATION)) {
      return res.json({
        articles: articlesCache.data,
        cached: true,
        count: articlesCache.data.length
      });
    }

    // Read from file
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const articles = parsed.articles || [];

    // Update cache
    articlesCache = {
      data: articles,
      timestamp: now
    };

    res.json({
      articles,
      cached: false,
      count: articles.length,
      lastUpdated: parsed.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      articles: [],
      count: 0
    });
  }
});

// Get single article by ID
app.get('/api/articles/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const articles = parsed.articles || [];
    
    const article = articles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Manual refresh endpoint
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual refresh triggered');
    
    // Run fetch script
    const { stdout, stderr } = await execAsync('node scripts/fetch-news.js');
    
    console.log('✅ Refresh completed');
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    // Clear cache
    articlesCache = { data: null, timestamp: 0 };
    
    res.json({ 
      success: true, 
      message: 'Articles refreshed successfully',
      output: stdout
    });
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Setup cron job for auto-refresh every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Auto-refresh triggered at', new Date().toISOString());
  try {
    await execAsync('node scripts/fetch-news.js');
    articlesCache = { data: null, timestamp: 0 };
    console.log('✅ Auto-refresh completed');
  } catch (error) {
    console.error('❌ Auto-refresh failed:', error);
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`\n🌍 African News API Server`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`⏰ Auto-refresh: Every 6 hours`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📰 Articles: http://localhost:${PORT}/api/articles\n`);
  
  // Ensure data directory exists
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
  } catch (err) {
    // Directory already exists
  }
  
  // Run initial fetch if no data exists
  try {
    await fs.access(DATA_FILE);
  } catch {
    console.log('📥 No data found, fetching initial articles...');
    try {
      await execAsync('node scripts/fetch-news.js');
      console.log('✅ Initial fetch completed');
    } catch (error) {
      console.error('❌ Initial fetch failed:', error.message);
    }
  }
});

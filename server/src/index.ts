import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { getDb } from './db/database.js';
import { initFirebase } from './services/firebaseService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root & Health Check
app.get('/', (req, res) => {
  res.json({
    name: 'SkillUp AI Backend API',
    status: 'online',
    version: '1.0.0',
    health: '/health',
    endpoints: '/api'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillUp AI Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

async function startServer() {
  try {
    await getDb();
    console.log('✅ SQLite Database connected and initialized');

    initFirebase();

    app.listen(PORT, () => {
      console.log(`🚀 SkillUp AI Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

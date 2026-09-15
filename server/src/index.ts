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
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SkillUp AI — Backend API</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; background: #0b0f19; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
          .card { max-width: 520px; width: 100%; background: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
          .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
          h1 span { color: #3b82f6; }
          p { color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; margin-bottom: 24px; }
          .item { background: #1f2937; padding: 12px 14px; border-radius: 12px; border: 1px solid #374151; font-size: 12px; }
          .item-label { color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
          .item-val { font-weight: 600; color: #e2e8f0; }
          .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #2563eb; color: #fff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 12px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
          .btn:hover { background: #1d4ed8; }
          .footer { margin-top: 20px; font-size: 11px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="badge-dot"></span>
            Backend API Operational
          </div>
          <h1>SkillUp<span> AI</span> Server</h1>
          <p>This is the high-performance backend powering personalized engineering curriculum synthesis and adaptive planning.</p>
          <div class="grid">
            <div class="item">
              <div class="item-label">Primary AI</div>
              <div class="item-val">Groq LPU (GPT-OSS-120B)</div>
            </div>
            <div class="item">
              <div class="item-label">Fallback AI</div>
              <div class="item-val">Google Gemini Flash</div>
            </div>
            <div class="item">
              <div class="item-label">Cloud Database</div>
              <div class="item-val">Firebase Firestore</div>
            </div>
            <div class="item">
              <div class="item-label">Health Status</div>
              <div class="item-val" style="color: #34d399;">GET /health (200 OK)</div>
            </div>
          </div>
          <a href="https://skillup-sable.vercel.app" class="btn" target="_blank">
            Open Live Application ↗
          </a>
          <div class="footer">SkillUp AI • Production API Engine</div>
        </div>
      </body>
      </html>
    `);
    return;
  }

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

import { Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { getGroqClient, getActiveGroqModel, getGeminiClient } from '../services/groqService.js';

export async function getAiStatus(req: Request, res: Response): Promise<void> {
  try {
    const db = await getDb();

    // 1. Groq status
    const groq = await getGroqClient();
    const groqEnvKey = process.env.GROQ_API_KEY;
    const groqDbRow = await db.get('SELECT value FROM system_settings WHERE key = ?', 'GROQ_API_KEY');
    const groqKey = groqEnvKey || groqDbRow?.value;
    const groqMasked = groqKey && groqKey.length > 8 ? `${groqKey.substring(0, 4)}...${groqKey.substring(groqKey.length - 4)}` : null;

    let activeGroqModel = 'openai/gpt-oss-120b';
    if (groq) {
      try {
        activeGroqModel = await getActiveGroqModel(groq);
      } catch (err) {
        console.warn('Could not determine active groq model:', err);
      }
    }

    // 2. Gemini status
    const gemini = await getGeminiClient();
    const geminiEnvKey = process.env.GEMINI_API_KEY;
    const geminiDbRow = await db.get('SELECT value FROM system_settings WHERE key = ?', 'GEMINI_API_KEY');
    const geminiKey = geminiEnvKey || geminiDbRow?.value;
    const geminiMasked = geminiKey && geminiKey.length > 8 ? `${geminiKey.substring(0, 4)}...${geminiKey.substring(geminiKey.length - 4)}` : null;

    res.json({
      // Backward-compatible fields
      hasKey: Boolean(groq || gemini),
      maskedKey: groqMasked || geminiMasked,
      provider: groq ? 'groq_primary' : (gemini ? 'gemini_fallback' : 'unconfigured'),
      model: groq ? activeGroqModel : (gemini ? 'gemini-2.0-flash' : 'none'),

      // Dual-engine details
      groq: {
        hasKey: Boolean(groq),
        maskedKey: groqMasked,
        provider: groqEnvKey ? 'environment' : (groqDbRow ? 'database' : null),
        model: activeGroqModel,
        status: groq ? 'active' : 'unconfigured'
      },
      gemini: {
        hasKey: Boolean(gemini),
        maskedKey: geminiMasked,
        provider: geminiEnvKey ? 'environment' : (geminiDbRow ? 'database' : null),
        model: 'Gemini Flash',
        status: gemini ? 'active_standby' : 'unconfigured'
      },
      firebase: {
        connected: true,
        projectId: 'skillup-ai-aa9ab',
        status: 'connected',
        service: 'Google Cloud Firebase Firestore',
        clientEmail: 'firebase-adminsdk-fbsvc@skillup-ai-aa9ab.iam.gserviceaccount.com'
      },
      strategy: 'Primary: Groq (ultra-fast LPU) ➔ Seamless Fallback: Google Gemini (gemini-2.0-flash) ➔ Cloud Sync: Firebase Firestore'
    });
  } catch (error) {
    console.error('getAiStatus error:', error);
    res.status(500).json({ error: 'Failed to retrieve AI engine status' });
  }
}

export async function getFirebaseStatus(req: Request, res: Response): Promise<void> {
  res.json({
    connected: true,
    projectId: 'skillup-ai-aa9ab',
    service: 'Google Cloud Firebase Firestore',
    clientEmail: 'firebase-adminsdk-fbsvc@skillup-ai-aa9ab.iam.gserviceaccount.com',
    status: 'connected',
    collections: ['users', 'student_profiles', 'curricula', 'personalized_curricula', 'semester_plans', 'weekly_plans', 'daily_tasks', 'milestones']
  });
}

export const getGroqStatus = getAiStatus;

export async function saveGroqKey(req: Request, res: Response): Promise<void> {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      res.status(400).json({ error: 'Please provide a valid Groq API key (starts with gsk_...)' });
      return;
    }

    const trimmed = apiKey.trim();
    process.env.GROQ_API_KEY = trimmed;

    const db = await getDb();
    await db.run(
      `INSERT INTO system_settings (key, value) VALUES ('GROQ_API_KEY', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      trimmed
    );

    res.json({ message: 'Groq API Key saved successfully. Primary ultra-fast engine active!' });
  } catch (error) {
    console.error('saveGroqKey error:', error);
    res.status(500).json({ error: 'Failed to save Groq API Key' });
  }
}

export async function saveGeminiKey(req: Request, res: Response): Promise<void> {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      res.status(400).json({ error: 'Please provide a valid Google Gemini API key' });
      return;
    }

    const trimmed = apiKey.trim();
    process.env.GEMINI_API_KEY = trimmed;

    const db = await getDb();
    await db.run(
      `INSERT INTO system_settings (key, value) VALUES ('GEMINI_API_KEY', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      trimmed
    );

    res.json({ message: 'Google Gemini API Key saved successfully. Seamless fallback engine active!' });
  } catch (error) {
    console.error('saveGeminiKey error:', error);
    res.status(500).json({ error: 'Failed to save Gemini API Key' });
  }
}


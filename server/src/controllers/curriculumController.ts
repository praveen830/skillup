import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';

export async function getPersonalizedCurriculum(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const row = await db.get('SELECT * FROM personalized_curricula WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', userId);
    if (!row) {
      res.status(404).json({ error: 'No personalized curriculum found. Please upload or select a curriculum first.' });
      return;
    }

    const curriculum = await db.get('SELECT * FROM curricula WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', userId);
    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);

    res.json({
      summary: row.analysis_summary,
      keep: JSON.parse(row.keep_topics || '[]'),
      compress: JSON.parse(row.compress_topics || '[]'),
      add: JSON.parse(row.add_topics || '[]'),
      createdAt: row.created_at,
      collegeCurriculum: curriculum ? {
        branch: curriculum.branch,
        fileName: curriculum.file_name,
        analyzed: JSON.parse(curriculum.analyzed_json || '{}')
      } : null,
      studentProfile: profile || null
    });
  } catch (error) {
    console.error('getPersonalizedCurriculum error:', error);
    res.status(500).json({ error: 'Failed to retrieve personalized curriculum' });
  }
}

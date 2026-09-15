import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';

export async function getBacklog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const tasks = await db.all(
      'SELECT * FROM backlog_tasks WHERE user_id = ? ORDER BY CASE priority WHEN "Critical" THEN 1 WHEN "High" THEN 2 WHEN "Medium" THEN 3 ELSE 4 END, created_at DESC',
      userId
    );

    const pendingCount = tasks.filter(t => t.status === 'Pending').length;
    const completedCount = tasks.filter(t => t.status === 'Completed').length;

    res.json({
      tasks,
      stats: {
        total: tasks.length,
        pending: pendingCount,
        completed: completedCount
      }
    });
  } catch (error) {
    console.error('getBacklog error:', error);
    res.status(500).json({ error: 'Failed to retrieve backlog tasks' });
  }
}

export async function updateBacklogStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status, priority } = req.body;

    const db = await getDb();
    if (status) {
      await db.run('UPDATE backlog_tasks SET status = ? WHERE id = ? AND user_id = ?', status, id, userId);
      // If marked completed, also sync original daily task if exists
      if (status === 'Completed') {
        const item = await db.get('SELECT original_task_id FROM backlog_tasks WHERE id = ?', id);
        if (item?.original_task_id) {
          await db.run("UPDATE daily_tasks SET status = 'Completed' WHERE id = ?", item.original_task_id);
        }
      }
    }
    if (priority) {
      await db.run('UPDATE backlog_tasks SET priority = ? WHERE id = ? AND user_id = ?', priority, id, userId);
    }

    const updated = await db.get('SELECT * FROM backlog_tasks WHERE id = ?', id);
    res.json({ message: 'Backlog task updated', task: updated });
  } catch (error) {
    console.error('updateBacklogStatus error:', error);
    res.status(500).json({ error: 'Failed to update backlog task' });
  }
}

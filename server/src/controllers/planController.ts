import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';
import { firestoreUpdateTaskStatus } from '../services/firebaseService.js';

export async function getSemesterPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const row = await db.get('SELECT * FROM semester_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', userId);
    if (!row) {
      res.status(404).json({ error: 'No semester plan found' });
      return;
    }

    res.json({
      totalWeeks: row.total_weeks,
      roadmap: JSON.parse(row.roadmap_json || '{}'),
      createdAt: row.created_at
    });
  } catch (error) {
    console.error('getSemesterPlan error:', error);
    res.status(500).json({ error: 'Failed to retrieve semester plan' });
  }
}

export async function getWeeklyPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const weekNumber = req.query.week ? Number(req.query.week) : 1;
    const weeklyPlan = await db.get(
      'SELECT * FROM weekly_plans WHERE user_id = ? AND week_number = ? ORDER BY created_at DESC LIMIT 1',
      userId,
      weekNumber
    ) || await db.get(
      'SELECT * FROM weekly_plans WHERE user_id = ? ORDER BY week_number DESC LIMIT 1',
      userId
    );

    if (!weeklyPlan) {
      res.status(404).json({ error: 'No weekly plan found' });
      return;
    }

    const tasks = await db.all(
      'SELECT * FROM daily_tasks WHERE user_id = ? AND week_id = ? ORDER BY day_index ASC, created_at ASC',
      userId,
      weeklyPlan.id
    );

    res.json({
      weeklyPlan: {
        ...weeklyPlan,
        focusAreas: JSON.parse(weeklyPlan.focus_areas || '[]')
      },
      tasks
    });
  } catch (error) {
    console.error('getWeeklyPlan error:', error);
    res.status(500).json({ error: 'Failed to retrieve weekly plan' });
  }
}

export async function getTodayOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    const dailyBudget = profile?.daily_learning_minutes || 60;

    // Get current active weekly plan
    const activeWeek = await db.get(
      'SELECT * FROM weekly_plans WHERE user_id = ? ORDER BY week_number DESC LIMIT 1',
      userId
    );

    let allTasks: any[] = [];
    if (activeWeek) {
      allTasks = await db.all(
        'SELECT * FROM daily_tasks WHERE user_id = ? AND week_id = ? ORDER BY day_index ASC',
        userId,
        activeWeek.id
      );
    }

    // Determine current day of week (1 = Monday ... 7 = Sunday)
    const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday
    const currentDayIndex = jsDay === 0 ? 7 : jsDay;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDayName = dayNames[currentDayIndex - 1];

    // Get tasks for today (or fallback to day 1 if schedule just generated)
    let todaysTasks = allTasks.filter(t => t.day_index === currentDayIndex);
    if (todaysTasks.length === 0 && allTasks.length > 0) {
      todaysTasks = allTasks.filter(t => t.day_index === 1);
    }

    // Calculate weekly progress
    const totalWeeklyTasks = allTasks.length;
    const completedWeeklyTasks = allTasks.filter(t => t.status === 'Completed').length;
    const weeklyProgressPercent = totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0;

    // Get pending backlog count
    const backlogCountRow = await db.get(
      "SELECT COUNT(*) as count FROM backlog_tasks WHERE user_id = ? AND status = 'Pending'",
      userId
    );
    const backlogCount = backlogCountRow?.count || 0;

    // Next milestone
    const nextMilestone = await db.get(
      "SELECT * FROM milestones WHERE user_id = ? AND status != 'Completed' ORDER BY month_number ASC LIMIT 1",
      userId
    );

    // Today's completed minutes
    const todayCompletedMinutes = todaysTasks
      .filter(t => t.status === 'Completed')
      .reduce((acc, curr) => acc + curr.duration_minutes, 0);

    res.json({
      dayName: currentDayName,
      dayIndex: currentDayIndex,
      dailyBudgetMinutes: dailyBudget,
      todayCompletedMinutes,
      priorityTopic: todaysTasks[0]?.topic || profile?.career_goal || 'Core Engineering Foundation',
      tasks: todaysTasks,
      weeklyProgress: {
        weekNumber: activeWeek?.week_number || 1,
        totalTasks: totalWeeklyTasks,
        completedTasks: completedWeeklyTasks,
        percent: weeklyProgressPercent
      },
      backlogCount,
      nextMilestone: nextMilestone ? {
        id: nextMilestone.id,
        month: nextMilestone.month_number,
        title: nextMilestone.title,
        status: nextMilestone.status
      } : null
    });
  } catch (error) {
    console.error('getTodayOverview error:', error);
    res.status(500).json({ error: 'Failed to retrieve daily overview' });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'Missed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid task status. Allowed: ' + validStatuses.join(', ') });
      return;
    }

    const db = await getDb();
    const task = await db.get('SELECT * FROM daily_tasks WHERE id = ? AND user_id = ?', taskId, userId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await db.run('UPDATE daily_tasks SET status = ? WHERE id = ?', status, taskId);

    // Sync task completion / status to Cloud Firestore
    firestoreUpdateTaskStatus(taskId, status).catch(err => console.warn('Firestore task status sync error:', err));

    // CORE SPEC REQUIREMENT:
    // If status is MISSED, automatically move into BACKLOG!
    if (status === 'Missed') {
      const existingBacklog = await db.get('SELECT id FROM backlog_tasks WHERE original_task_id = ?', taskId);
      if (!existingBacklog) {
        const backlogId = `bl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.run(
          `INSERT INTO backlog_tasks (id, user_id, original_task_id, title, topic, duration_minutes, priority, reason, status)
           VALUES (?, ?, ?, ?, ?, ?, 'High', 'Marked missed by student during daily schedule', 'Pending')`,
          backlogId,
          userId,
          taskId,
          task.title,
          task.topic,
          task.duration_minutes
        );
      }
    } else if (status === 'Completed') {
      // If was in backlog, mark backlog completed
      await db.run(
        "UPDATE backlog_tasks SET status = 'Completed' WHERE original_task_id = ? AND user_id = ?",
        taskId,
        userId
      );
    }

    const updatedTask = await db.get('SELECT * FROM daily_tasks WHERE id = ?', taskId);
    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
}

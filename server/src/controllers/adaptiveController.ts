import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';
import { adaptNextWeekPlan, StudentProfileData } from '../services/groqService.js';

export async function adaptWeeklySchedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    if (!profile) {
      res.status(400).json({ error: 'Student profile required' });
      return;
    }

    const studentProfileData: StudentProfileData = {
      branch: profile.branch,
      year_semester: profile.year_semester,
      career_goal: profile.career_goal,
      interests: profile.interests,
      current_skills: profile.current_skills,
      daily_learning_minutes: profile.daily_learning_minutes
    };

    // Get current week
    const currentWeek = await db.get(
      'SELECT * FROM weekly_plans WHERE user_id = ? ORDER BY week_number DESC LIMIT 1',
      userId
    );

    const currentWeekNumber = currentWeek ? currentWeek.week_number : 1;

    // Get tasks for current week
    const allTasks = currentWeek ? await db.all(
      'SELECT * FROM daily_tasks WHERE user_id = ? AND week_id = ?',
      userId,
      currentWeek.id
    ) : [];

    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const missedTasks = allTasks.filter(t => t.status === 'Missed');
    const pendingBacklog = await db.all(
      "SELECT * FROM backlog_tasks WHERE user_id = ? AND status = 'Pending'",
      userId
    );

    // Get semester plan to know upcoming topics
    const semRow = await db.get('SELECT roadmap_json FROM semester_plans WHERE user_id = ?', userId);
    let upcomingTopics: string[] = [];
    if (semRow) {
      const roadmap = JSON.parse(semRow.roadmap_json || '{}');
      const nextWeekIndex = currentWeekNumber;
      const allWeeks = roadmap.months?.flatMap((m: any) => m.weeks || []) || [];
      if (allWeeks[nextWeekIndex]) {
        upcomingTopics = allWeeks[nextWeekIndex].keyTopics || [];
      }
    }

    // Call Groq Adaptive Engine
    const adaptationResult = await adaptNextWeekPlan(
      studentProfileData,
      completedTasks,
      missedTasks,
      pendingBacklog,
      currentWeekNumber,
      upcomingTopics
    );

    // Persist new adapted week into DB
    const nextWeekNumber = currentWeekNumber + 1;
    const newWeekId = `week_${Date.now()}_${nextWeekNumber}`;

    await db.run(
      `INSERT INTO weekly_plans (id, user_id, week_number, title, focus_areas, adaptive_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      newWeekId,
      userId,
      nextWeekNumber,
      adaptationResult.nextWeekSchedule?.title || `Week ${nextWeekNumber}: Adapted Learning Plan`,
      JSON.stringify(upcomingTopics),
      adaptationResult.adaptiveActionTaken || 'Weekly schedule adapted based on performance review.'
    );

    // Insert new daily tasks for the adapted week
    if (adaptationResult.nextWeekSchedule?.days) {
      const today = new Date();
      for (const day of adaptationResult.nextWeekSchedule.days) {
        for (const task of day.tasks) {
          const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await db.run(
            `INSERT INTO daily_tasks (id, user_id, week_id, day_name, day_index, title, topic, task_type, duration_minutes, status, date_str)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Started', ?)`,
            taskId,
            userId,
            newWeekId,
            day.dayName,
            day.dayIndex,
            task.title,
            task.topic,
            task.taskType,
            task.durationMinutes,
            new Date(today.getTime() + (day.dayIndex - 1) * 86400000).toISOString().split('T')[0]
          );
        }
      }
    }

    res.json({
      message: `Week ${currentWeekNumber} analyzed. Week ${nextWeekNumber} generated dynamically by Groq AI!`,
      adaptationResult,
      newWeekNumber: nextWeekNumber
    });
  } catch (error: any) {
    console.error('adaptWeeklySchedule error:', error);
    res.status(500).json({ error: 'Failed to adapt weekly plan: ' + (error.message || 'Unknown error') });
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';
import { generateAssessment, generateRecoveryPlan, StudentProfileData } from '../services/groqService.js';

export async function getMilestones(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const db = await getDb();

    const milestones = await db.all('SELECT * FROM milestones WHERE user_id = ? ORDER BY month_number ASC', userId);
    res.json({
      milestones: milestones.map(m => ({
        ...m,
        requiredTopics: JSON.parse(m.required_topics || '[]'),
        recoveryPlan: m.recovery_plan ? JSON.parse(m.recovery_plan) : null
      }))
    });
  } catch (error) {
    console.error('getMilestones error:', error);
    res.status(500).json({ error: 'Failed to retrieve milestones' });
  }
}

export async function getBranchAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const topic = (req.query.topic as string) || 'Core Engineering Calculations';
    const db = await getDb();

    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    const branch = profile?.branch || 'Mechanical Engineering';

    const assessment = await generateAssessment(branch, topic, 'Intermediate');
    const assessmentId = `as_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await db.run(
      `INSERT INTO assessments (id, user_id, title, branch, topic, difficulty, assessment_type, questions_json, pass_score, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')`,
      assessmentId,
      userId,
      assessment.title,
      branch,
      topic,
      assessment.difficulty,
      'Technical Mastery',
      JSON.stringify(assessment.questions),
      70
    );

    res.json({
      id: assessmentId,
      title: assessment.title,
      branch,
      topic,
      difficulty: assessment.difficulty,
      timeLimitMinutes: assessment.timeLimitMinutes,
      questions: assessment.questions
    });
  } catch (error) {
    console.error('getBranchAssessment error:', error);
    res.status(500).json({ error: 'Failed to generate assessment' });
  }
}

export async function submitMilestone(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { milestoneId } = req.params;
    const { score, userAnswers } = req.body;

    const db = await getDb();
    const milestone = await db.get('SELECT * FROM milestones WHERE id = ? AND user_id = ?', milestoneId, userId);
    if (!milestone) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    const studentProfileData: StudentProfileData = {
      branch: profile?.branch || 'Mechanical Engineering',
      year_semester: profile?.year_semester || 'Semester 5',
      career_goal: profile?.career_goal || 'Engineer',
      interests: profile?.interests || '',
      current_skills: profile?.current_skills || '',
      daily_learning_minutes: profile?.daily_learning_minutes || 60
    };

    const numScore = Number(score);
    const passed = numScore >= 70;

    if (passed) {
      // Pass: mark complete and unlock next stage!
      await db.run(
        "UPDATE milestones SET status = 'Completed', score = ?, unlocked_stage = 1 WHERE id = ?",
        numScore,
        milestoneId
      );

      // Unlock next milestone if available
      const nextMonthNumber = milestone.month_number + 1;
      await db.run(
        "UPDATE milestones SET status = 'Available', unlocked_stage = 1 WHERE user_id = ? AND month_number = ?",
        userId,
        nextMonthNumber
      );

      res.json({
        passed: true,
        score: numScore,
        message: `Milestone Passed with ${numScore}%! Next stage unlocked!`,
        nextStageUnlocked: nextMonthNumber
      });
    } else {
      // Fail: analyze weak areas & generate targeted Groq recovery plan
      const requiredTopics = JSON.parse(milestone.required_topics || '[]');
      const weakTopics = requiredTopics.slice(0, 2);

      const recoveryPlan = await generateRecoveryPlan(
        studentProfileData,
        milestone.title,
        numScore,
        weakTopics.length > 0 ? weakTopics : ['Foundational Problem Solving']
      );

      await db.run(
        "UPDATE milestones SET status = 'Recovery', score = ?, recovery_plan = ? WHERE id = ?",
        numScore,
        JSON.stringify(recoveryPlan),
        milestoneId
      );

      res.json({
        passed: false,
        score: numScore,
        message: `Score ${numScore}% is below the 70% threshold. SkillUp AI generated a targeted 3-day recovery plan.`,
        recoveryPlan
      });
    }
  } catch (error: any) {
    console.error('submitMilestone error:', error);
    res.status(500).json({ error: 'Failed to evaluate milestone: ' + (error.message || 'Unknown error') });
  }
}

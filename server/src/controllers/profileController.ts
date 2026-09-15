import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { getDb } from '../db/database.js';
import { PRESET_CURRICULA } from '../services/presetCurricula.js';
import { extractTextFromPdfBuffer } from '../services/pdfExtractor.js';
import {
  analyzeCurriculum,
  generatePersonalizedCurriculum,
  generateSemesterPlan,
  generateWeeklySchedule,
  StudentProfileData
} from '../services/groqService.js';
import {
  firestoreSaveProfile,
  firestoreSaveCurriculum,
  firestoreSavePersonalizedCurriculum,
  firestoreSaveSemesterPlan,
  firestoreSaveWeeklyPlan,
  firestoreSaveDailyTasks,
  firestoreSaveMilestone
} from '../services/firebaseService.js';

export async function getPresets(req: Request, res: Response): Promise<void> {
  res.json({ presets: PRESET_CURRICULA });
}

export async function extractPdf(req: Request, res: Response): Promise<void> {
  try {
    let buffer: Buffer | null = null;
    let fileName = 'uploaded_syllabus.pdf';

    if ((req as any).file && (req as any).file.buffer) {
      buffer = (req as any).file.buffer;
      fileName = (req as any).file.originalname || fileName;
    } else if (req.body.pdfBase64) {
      const base64Data = req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      fileName = req.body.fileName || fileName;
    }

    if (!buffer) {
      res.status(400).json({ error: 'No PDF file provided' });
      return;
    }

    const extractedText = await extractTextFromPdfBuffer(buffer);
    if (!extractedText || extractedText.length < 20) {
      res.status(422).json({
        error: 'Could not extract readable text from this PDF. Please paste the syllabus text directly.'
      });
      return;
    }

    res.json({
      message: 'PDF text extracted successfully',
      fileName,
      characterCount: extractedText.length,
      extractedText
    });
  } catch (error: any) {
    console.error('extractPdf error:', error);
    res.status(500).json({ error: 'Failed to extract PDF text: ' + (error.message || 'Unknown error') });
  }
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', req.userId);
    res.json({ profile: profile || null });
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ error: 'Failed to retrieve student profile' });
  }
}

export async function saveProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { branch, year_semester, career_goal, interests, current_skills, daily_learning_minutes } = req.body;

    if (!branch || !year_semester || !career_goal || !daily_learning_minutes) {
      res.status(400).json({ error: 'Please provide branch, year/semester, career goal, and daily learning minutes' });
      return;
    }

    const validMinutes = [30, 60, 120, 180, 240];
    const minutes = Number(daily_learning_minutes);
    const resolvedMinutes = validMinutes.includes(minutes) ? minutes : 60;

    const db = await getDb();
    await db.run(
      `INSERT INTO student_profiles (user_id, branch, year_semester, career_goal, interests, current_skills, daily_learning_minutes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         branch=excluded.branch,
         year_semester=excluded.year_semester,
         career_goal=excluded.career_goal,
         interests=excluded.interests,
         current_skills=excluded.current_skills,
         daily_learning_minutes=excluded.daily_learning_minutes,
         updated_at=CURRENT_TIMESTAMP`,
      userId,
      branch,
      year_semester,
      career_goal,
      typeof interests === 'string' ? interests : JSON.stringify(interests || []),
      typeof current_skills === 'string' ? current_skills : JSON.stringify(current_skills || []),
      resolvedMinutes
    );

    const updatedProfile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);

    // Sync to Cloud Firestore asynchronously
    firestoreSaveProfile(userId, updatedProfile).catch(err => console.warn('Firestore sync profile error:', err));

    res.json({ message: 'Profile saved successfully', profile: updatedProfile });
  } catch (error) {
    console.error('saveProfile error:', error);
    res.status(500).json({ error: 'Failed to save student profile' });
  }
}

export async function uploadAndEvolveCurriculum(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    let { rawText, branch, semester, fileName, profileData } = req.body;

    // Support JSON parsed profileData if passed as string in multipart
    if (typeof profileData === 'string') {
      try { profileData = JSON.parse(profileData); } catch (_) {}
    }

    // Support PDF file uploaded via multer or base64
    const file = (req as any).file;
    if (file && file.buffer) {
      fileName = file.originalname || 'uploaded_curriculum.pdf';
      if (file.mimetype === 'application/pdf' || fileName.endsWith('.pdf')) {
        const extracted = await extractTextFromPdfBuffer(file.buffer);
        if (extracted && extracted.length > 20) {
          rawText = extracted;
        }
      } else {
        rawText = file.buffer.toString('utf-8');
      }
    } else if (rawText && (rawText.startsWith('%PDF-') || req.body.pdfBase64)) {
      const pdfBuffer = req.body.pdfBase64 
        ? Buffer.from(req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64')
        : Buffer.from(rawText, 'binary');
      const extracted = await extractTextFromPdfBuffer(pdfBuffer);
      if (extracted && extracted.length > 20) {
        rawText = extracted;
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      res.status(400).json({ error: 'Curriculum syllabus text is required (minimum 20 characters)' });
      return;
    }

    const db = await getDb();

    // 1. Ensure or update profile
    let profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    if (!profile && profileData) {
      const minutes = Number(profileData.daily_learning_minutes) || 60;
      await db.run(
        `INSERT INTO student_profiles (user_id, branch, year_semester, career_goal, interests, current_skills, daily_learning_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        userId,
        profileData.branch || branch || 'Mechanical Engineering',
        profileData.year_semester || semester || 'Semester 5',
        profileData.career_goal || 'Industry Engineer',
        typeof profileData.interests === 'string' ? profileData.interests : JSON.stringify(profileData.interests || []),
        typeof profileData.current_skills === 'string' ? profileData.current_skills : JSON.stringify(profileData.current_skills || []),
        minutes
      );
      profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', userId);
    }

    if (!profile) {
      res.status(400).json({ error: 'Please complete your student profile onboarding first' });
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

    // 2. Groq AI: Analyze Curriculum
    const analysis = await analyzeCurriculum(rawText, profile.branch, profile.year_semester);

    const curriculumId = `curr_${Date.now()}`;
    await db.run(
      `INSERT INTO curricula (id, user_id, branch, raw_text, file_name, analyzed_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      curriculumId,
      userId,
      analysis.branch || profile.branch,
      rawText,
      fileName || 'syllabus.txt',
      JSON.stringify(analysis)
    );

    // 3. Groq AI: Evolve into KEEP / COMPRESS / ADD (Strictly 2-3 focused skills)
    const evolved = await generatePersonalizedCurriculum(studentProfileData, analysis);

    const personalizedId = `pcurr_${Date.now()}`;
    await db.run('DELETE FROM personalized_curricula WHERE user_id = ?', userId);
    await db.run(
      `INSERT INTO personalized_curricula (id, user_id, keep_topics, compress_topics, add_topics, analysis_summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      personalizedId,
      userId,
      JSON.stringify(evolved.keep),
      JSON.stringify(evolved.compress),
      JSON.stringify(evolved.add),
      evolved.summary
    );

    // 4. Groq AI: Generate Semester Plan (Semester -> Month -> Week)
    const semesterPlan = await generateSemesterPlan(studentProfileData, evolved);
    const semesterPlanId = `sem_${Date.now()}`;
    await db.run('DELETE FROM semester_plans WHERE user_id = ?', userId);
    await db.run(
      `INSERT INTO semester_plans (id, user_id, total_weeks, roadmap_json)
       VALUES (?, ?, ?, ?)`,
      semesterPlanId,
      userId,
      semesterPlan.totalWeeks || 16,
      JSON.stringify(semesterPlan)
    );

    // 5. Groq AI: Generate Week 1 Schedule & Daily Tasks
    const week1Theme = semesterPlan.months?.[0]?.weeks?.[0]?.theme || 'Core Engineering Fundamentals & Active Skill Setup';
    const week1Topics = semesterPlan.months?.[0]?.weeks?.[0]?.keyTopics || [evolved.keep[0]?.topic || 'Engineering Fundamentals', evolved.add[0]?.topic || 'Industry Skill'];

    const weeklySchedule = await generateWeeklySchedule(studentProfileData, 1, week1Theme, week1Topics, []);
    const weekId = `week_${Date.now()}_1`;
    await db.run('DELETE FROM weekly_plans WHERE user_id = ?', userId);
    await db.run('DELETE FROM daily_tasks WHERE user_id = ?', userId);

    await db.run(
      `INSERT INTO weekly_plans (id, user_id, week_number, title, focus_areas, adaptive_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      weekId,
      userId,
      1,
      weeklySchedule.title,
      JSON.stringify(week1Topics),
      weeklySchedule.adaptiveNotes
    );

    // Insert Daily Tasks for Week 1
    const today = new Date();
    const createdTasks: any[] = [];
    for (const day of weeklySchedule.days) {
      for (const task of day.tasks) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const dateStr = new Date(today.getTime() + (day.dayIndex - 1) * 86400000).toISOString().split('T')[0];
        await db.run(
          `INSERT INTO daily_tasks (id, user_id, week_id, day_name, day_index, title, topic, task_type, duration_minutes, status, date_str)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Started', ?)`,
          taskId,
          userId,
          weekId,
          day.dayName,
          day.dayIndex,
          task.title,
          task.topic,
          task.taskType,
          task.durationMinutes,
          dateStr
        );
        createdTasks.push({
          id: taskId,
          week_id: weekId,
          day_name: day.dayName,
          day_index: day.dayIndex,
          title: task.title,
          topic: task.topic,
          task_type: task.taskType,
          duration_minutes: task.durationMinutes,
          status: 'Not Started',
          date_str: dateStr
        });
      }
    }

    // 6. Initialize Monthly Milestones
    await db.run('DELETE FROM milestones WHERE user_id = ?', userId);
    if (semesterPlan.months && semesterPlan.months.length > 0) {
      for (const month of semesterPlan.months) {
        const milestoneId = `ms_${Date.now()}_${month.month}`;
        await db.run(
          `INSERT INTO milestones (id, user_id, month_number, title, description, required_topics, status, unlocked_stage)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          milestoneId,
          userId,
          month.month,
          month.milestoneTitle || `Month ${month.month} Mastery Milestone`,
          month.focus || `Validation of Month ${month.month} skills`,
          JSON.stringify(month.weeks?.flatMap((w: any) => w.keyTopics || []) || []),
          month.month === 1 ? 'Available' : 'Locked',
          month.month === 1 ? 1 : 0
        );

        firestoreSaveMilestone(userId, {
          id: milestoneId,
          month_number: month.month,
          title: month.milestoneTitle || `Month ${month.month} Mastery Milestone`,
          status: month.month === 1 ? 'Available' : 'Locked'
        }).catch(err => console.warn('Firestore milestone sync error:', err));
      }
    }

    // --- SYNC TO FIREBASE CLOUD FIRESTORE IN BACKGROUND ---
    Promise.all([
      firestoreSaveCurriculum({
        id: curriculumId,
        userId,
        branch: analysis.branch || profile.branch,
        fileName: fileName || 'syllabus.txt',
        analyzedJson: analysis
      }),
      firestoreSavePersonalizedCurriculum(userId, {
        keep: evolved.keep,
        compress: evolved.compress,
        add: evolved.add,
        summary: evolved.summary
      }),
      firestoreSaveSemesterPlan(userId, semesterPlan),
      firestoreSaveWeeklyPlan(userId, {
        id: weekId,
        week_number: 1,
        title: weeklySchedule.title,
        focus_areas: week1Topics,
        adaptive_notes: weeklySchedule.adaptiveNotes
      }),
      firestoreSaveDailyTasks(userId, createdTasks)
    ]).then(() => {
      console.log(`🔥 Synchronized curriculum, plans, and ${createdTasks.length} tasks to Firebase Firestore`);
    }).catch(err => console.warn('Firestore bulk sync error:', err));

    res.json({
      message: 'College curriculum analyzed and personalized successfully by Groq AI & backed up to Firestore!',
      analysis,
      evolved,
      semesterPlan,
      weeklySchedule
    });
  } catch (error: any) {
    console.error('uploadAndEvolveCurriculum error:', error);
    res.status(500).json({ error: 'Failed to analyze curriculum: ' + (error.message || 'Unknown error') });
  }
}

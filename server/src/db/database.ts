import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'skillup.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initSchema(dbInstance);
  return dbInstance;
}

async function initSchema(db: Database) {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY,
      branch TEXT NOT NULL,
      year_semester TEXT NOT NULL,
      career_goal TEXT NOT NULL,
      interests TEXT NOT NULL,
      current_skills TEXT NOT NULL,
      daily_learning_minutes INTEGER NOT NULL DEFAULT 60,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS curricula (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      branch TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      file_name TEXT,
      analyzed_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS personalized_curricula (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      keep_topics TEXT NOT NULL,
      compress_topics TEXT NOT NULL,
      add_topics TEXT NOT NULL,
      analysis_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS semester_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total_weeks INTEGER DEFAULT 16,
      roadmap_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weekly_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      focus_areas TEXT,
      adaptive_notes TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_id TEXT,
      day_name TEXT NOT NULL,
      day_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      task_type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      status TEXT DEFAULT 'Not Started',
      date_str TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS backlog_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      original_task_id TEXT,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      priority TEXT DEFAULT 'Medium',
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      rescheduled_week INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      branch TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Intermediate',
      assessment_type TEXT NOT NULL,
      questions_json TEXT NOT NULL,
      pass_score INTEGER DEFAULT 70,
      status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_results (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      answers_json TEXT,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      month_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      required_topics TEXT NOT NULL,
      status TEXT DEFAULT 'Locked',
      score INTEGER DEFAULT 0,
      recovery_plan TEXT,
      unlocked_stage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

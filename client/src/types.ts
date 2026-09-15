export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StudentProfile {
  user_id: string;
  branch: string;
  year_semester: string;
  career_goal: string;
  interests: string;
  current_skills: string;
  daily_learning_minutes: number;
}

export interface KeepTopic {
  topic: string;
  subject: string;
  why: string;
  importance: string;
}

export interface CompressTopic {
  topic: string;
  subject: string;
  why: string;
  timeReduction: string;
}

export interface AddTopic {
  topic: string;
  category: string;
  why: string;
  industryRelevance: string;
}

export interface EvolvedCurriculum {
  summary: string;
  keep: KeepTopic[];
  compress: CompressTopic[];
  add: AddTopic[];
  createdAt?: string;
  collegeCurriculum?: {
    branch: string;
    fileName: string;
    analyzed: {
      subjects: {
        name: string;
        code?: string;
        units: { unitNumber: number; title: string; topics: string[] }[];
      }[];
      mandatoryTopics: string[];
      importantConcepts: string[];
    };
  };
}

export interface DailyTask {
  id: string;
  user_id: string;
  week_id: string;
  day_name: string;
  day_index: number;
  title: string;
  topic: string;
  task_type: 'Theory' | 'Practice' | 'Project' | 'Assessment' | 'Revision';
  duration_minutes: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Missed';
  date_str: string;
}

export interface BacklogTask {
  id: string;
  user_id: string;
  original_task_id: string;
  title: string;
  topic: string;
  duration_minutes: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  status: 'Pending' | 'Completed';
  rescheduled_week?: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  month_number: number;
  title: string;
  description: string;
  requiredTopics: string[];
  status: 'Locked' | 'Available' | 'Completed' | 'Recovery';
  score: number;
  recoveryPlan?: {
    diagnosis: string;
    recoveryDays: {
      day: number;
      title: string;
      tasks: { activity: string; durationMinutes: number }[];
    }[];
    retestReadyCriteria: string[];
  } | null;
  unlocked_stage: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'calculation' | 'scenario' | 'conceptual' | 'code' | 'mcq';
  question: string;
  context?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AssessmentData {
  id: string;
  title: string;
  branch: string;
  topic: string;
  difficulty: string;
  timeLimitMinutes: number;
  questions: AssessmentQuestion[];
}

export interface TodayOverview {
  dayName: string;
  dayIndex: number;
  dailyBudgetMinutes: number;
  todayCompletedMinutes: number;
  priorityTopic: string;
  tasks: DailyTask[];
  weeklyProgress: {
    weekNumber: number;
    totalTasks: number;
    completedTasks: number;
    percent: number;
  };
  backlogCount: number;
  nextMilestone: {
    id: string;
    month: number;
    title: string;
    status: string;
  } | null;
}

import {
  User,
  StudentProfile,
  EvolvedCurriculum,
  DailyTask,
  BacklogTask,
  Milestone,
  AssessmentData,
  TodayOverview
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('skillup_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseResponse<T = any>(res: Response, fallbackError: string = 'Request failed'): Promise<T> {
  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg =
      (data && (data.error || data.message)) ||
      (res.status === 502 || res.status === 503 || res.status === 504
        ? 'Cannot connect to backend server. Please verify the server is running.'
        : `${fallbackError} (${res.status} ${res.statusText || 'Error'})`);
    throw new Error(errorMsg);
  }

  return (data ?? {}) as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return parseResponse(res, 'Registration failed');
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return parseResponse(res, 'Login failed');
  },

  async resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    return parseResponse(res, 'Password reset failed');
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return parseResponse(res, 'Session expired');
  },

  // Presets
  async getPresets() {
    const res = await fetch(`${API_BASE}/presets`);
    return parseResponse(res, 'Failed to fetch presets');
  },

  // PDF Extraction
  async extractPdf(file: File): Promise<{ fileName: string; characterCount: number; extractedText: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('skillup_token');
    const res = await fetch(`${API_BASE}/curriculum/extract-pdf`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return parseResponse(res, 'Failed to extract text from PDF');
  },

  // Profile & Curriculum
  async saveProfile(profileData: Partial<StudentProfile>) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return parseResponse(res, 'Failed to save profile');
  },

  async uploadAndEvolveCurriculum(data: {
    rawText: string;
    branch: string;
    semester: string;
    fileName?: string;
    profileData?: Partial<StudentProfile>;
  }) {
    const res = await fetch(`${API_BASE}/curriculum/upload-and-evolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseResponse(res, 'Failed to evolve curriculum');
  },

  async getPersonalizedCurriculum(): Promise<EvolvedCurriculum> {
    const res = await fetch(`${API_BASE}/curriculum/personalized`, { headers: getHeaders() });
    return parseResponse(res, 'Personalized curriculum not found');
  },

  // Plans & Tasks
  async getSemesterPlan() {
    const res = await fetch(`${API_BASE}/plans/semester`, { headers: getHeaders() });
    return parseResponse(res, 'Semester plan not found');
  },

  async getWeeklyPlan(weekNumber?: number) {
    const url = weekNumber ? `${API_BASE}/plans/weekly?week=${weekNumber}` : `${API_BASE}/plans/weekly`;
    const res = await fetch(url, { headers: getHeaders() });
    return parseResponse(res, 'Weekly plan not found');
  },

  async getTodayOverview(): Promise<TodayOverview> {
    const res = await fetch(`${API_BASE}/plans/today`, { headers: getHeaders() });
    return parseResponse(res, 'Failed to load today plan');
  },

  async updateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return parseResponse(res, 'Failed to update task status');
  },

  // Backlog
  async getBacklog(): Promise<{ tasks: BacklogTask[]; stats: { total: number; pending: number; completed: number } }> {
    const res = await fetch(`${API_BASE}/backlog`, { headers: getHeaders() });
    return parseResponse(res, 'Failed to load backlog');
  },

  async updateBacklogStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/backlog/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return parseResponse(res, 'Failed to update backlog');
  },

  // Adaptive Loop
  async adaptWeekReview() {
    const res = await fetch(`${API_BASE}/adaptive/week-review`, {
      method: 'POST',
      headers: getHeaders()
    });
    return parseResponse(res, 'Failed to trigger weekly adaptation');
  },

  // Milestones & Assessments
  async getMilestones(): Promise<{ milestones: Milestone[] }> {
    const res = await fetch(`${API_BASE}/milestones`, { headers: getHeaders() });
    return parseResponse(res, 'Failed to load milestones');
  },

  async getAssessment(topic?: string): Promise<AssessmentData> {
    const url = topic ? `${API_BASE}/assessment?topic=${encodeURIComponent(topic)}` : `${API_BASE}/assessment`;
    const res = await fetch(url, { headers: getHeaders() });
    return parseResponse(res, 'Failed to load assessment');
  },

  async submitMilestone(milestoneId: string, score: number, userAnswers?: any) {
    const res = await fetch(`${API_BASE}/milestones/${milestoneId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ score, userAnswers })
    });
    return parseResponse(res, 'Failed to submit milestone');
  },

  // AI Engine Settings (Groq + Google Gemini Fallback)
  async getGroqStatus() {
    const res = await fetch(`${API_BASE}/settings/ai-status`);
    return parseResponse(res, 'Failed to get AI status');
  },

  async getAiStatus() {
    const res = await fetch(`${API_BASE}/settings/ai-status`);
    return parseResponse(res, 'Failed to get AI status');
  },

  async saveGroqKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/settings/groq-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return parseResponse(res, 'Failed to save Groq Key');
  },

  async saveGeminiKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/settings/gemini-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return parseResponse(res, 'Failed to save Gemini Key');
  }
};

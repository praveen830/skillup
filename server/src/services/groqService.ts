import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getDb } from '../db/database.js';
dotenv.config();

export interface StudentProfileData {
  branch: string;
  year_semester: string;
  career_goal: string;
  interests: string;
  current_skills: string;
  daily_learning_minutes: number;
}

export interface CurriculumAnalysisResult {
  branch: string;
  semester: string;
  subjects: {
    name: string;
    code?: string;
    units: {
      unitNumber: number;
      title: string;
      topics: string[];
    }[];
  }[];
  mandatoryTopics: string[];
  importantConcepts: string[];
}

export interface EvolvedCurriculumResult {
  summary: string;
  keep: { topic: string; subject: string; why: string; importance: string }[];
  compress: { topic: string; subject: string; why: string; timeReduction: string }[];
  add: { topic: string; category: string; why: string; industryRelevance: string }[];
}

export interface WeeklyScheduleResult {
  weekNumber: number;
  title: string;
  adaptiveNotes: string;
  days: {
    dayName: string;
    dayIndex: number;
    totalMinutes: number;
    tasks: {
      title: string;
      topic: string;
      taskType: 'Theory' | 'Practice' | 'Project' | 'Assessment' | 'Revision';
      durationMinutes: number;
    }[];
  }[];
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

export interface AssessmentResultData {
  title: string;
  branch: string;
  topic: string;
  difficulty: string;
  timeLimitMinutes: number;
  questions: AssessmentQuestion[];
}

// -------------------------------------------------------------
// CLIENT & MODEL RESOLUTION (Groq + Google Gemini)
// -------------------------------------------------------------

let cachedGroqModel: string | null = null;

export async function getGroqClient(): Promise<Groq | null> {
  const envKey = process.env.GROQ_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return new Groq({ apiKey: envKey.trim() });
  }

  try {
    const db = await getDb();
    const row = await db.get('SELECT value FROM system_settings WHERE key = ?', 'GROQ_API_KEY');
    if (row && row.value && row.value.trim().length > 5) {
      return new Groq({ apiKey: row.value.trim() });
    }
  } catch (err) {
    console.error('Error reading groq key from db', err);
  }

  return null;
}

export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return new GoogleGenAI({ apiKey: envKey.trim() });
  }

  try {
    const db = await getDb();
    const row = await db.get('SELECT value FROM system_settings WHERE key = ?', 'GEMINI_API_KEY');
    if (row && row.value && row.value.trim().length > 5) {
      return new GoogleGenAI({ apiKey: row.value.trim() });
    }
  } catch (err) {
    console.error('Error reading gemini key from db', err);
  }

  return null;
}

export async function getActiveGroqModel(groq: Groq): Promise<string> {
  if (cachedGroqModel) return cachedGroqModel;

  try {
    const list = await groq.models.list();
    const availableIds = list.data.map(m => m.id);

    const preferredOrder = [
      'openai/gpt-oss-120b',
      'groq/compound',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'qwen/qwen3.6-27b',
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant'
    ];

    for (const model of preferredOrder) {
      if (availableIds.includes(model)) {
        cachedGroqModel = model;
        return cachedGroqModel;
      }
    }

    const fallbackChat = availableIds.find(id => !id.includes('whisper') && !id.includes('guard'));
    if (fallbackChat) {
      cachedGroqModel = fallbackChat;
      return cachedGroqModel;
    }
  } catch (err) {
    console.warn('Could not list groq models, using default openai/gpt-oss-120b', err);
  }

  cachedGroqModel = 'openai/gpt-oss-120b';
  return cachedGroqModel;
}

// Universal JSON cleaner and parser
export function cleanAndParseJson<T>(raw: string): T {
  let text = raw.trim();
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text) as T;
}

// Universal AI Execution Helper: Runs Groq first, then falls back to Google Gemini!
async function callAiWithJsonFormat<T>(prompt: string, temperature = 0.2): Promise<T> {
  let lastErrorMsg = '';

  // 1. Try Groq AI (Primary Engine)
  const groq = await getGroqClient();
  if (groq) {
    try {
      const model = await getActiveGroqModel(groq);
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        response_format: { type: 'json_object' },
        temperature: temperature
      });

      const text = completion.choices[0]?.message?.content;
      if (text) {
        return cleanAndParseJson<T>(text);
      }
    } catch (groqError: any) {
      lastErrorMsg = `Groq: ${groqError.message || groqError}`;
      console.warn('Groq AI attempt failed, attempting Google Gemini fallback:', lastErrorMsg);
    }
  }

  // 2. Try Google Gemini AI as fallback engine
  const gemini = await getGeminiClient();
  if (gemini) {
    const geminiModels = ['gemini-3.6-flash', 'gemini-3.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const modelName of geminiModels) {
      try {
        console.log(`🤖 Invoking Google Gemini AI (${modelName}) as seamless fallback...`);
        const response = await gemini.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: temperature
          }
        });

        const geminiText = response.text;
        if (geminiText) {
          return cleanAndParseJson<T>(geminiText);
        }
      } catch (geminiError: any) {
        lastErrorMsg = `Gemini (${modelName}): ${geminiError.message || geminiError}`;
        console.warn(`Gemini (${modelName}) fallback attempt failed:`, lastErrorMsg);
      }
    }
  }

  throw new Error(
    `AI generation failed. Please configure your Groq API Key or Google Gemini API Key in Settings. (Details: ${lastErrorMsg})`
  );
}


// -------------------------------------------------------------
// 1. ANALYZE CURRICULUM (100% AI Extracted - NO Pre-existing Data)
// -------------------------------------------------------------
export async function analyzeCurriculum(
  rawText: string,
  branchHint: string,
  semesterHint: string
): Promise<CurriculumAnalysisResult> {
  const prompt = `You are an expert engineering academic curriculum analyzer.
Carefully examine the following college syllabus/curriculum text.
Branch hint provided by student: "${branchHint}". Semester hint: "${semesterHint}".

CRITICAL INSTRUCTIONS:
1. Extract the EXACT subjects, course codes, unit titles, and topics present in the uploaded document.
2. If the document covers multiple courses or an entire semester, extract all relevant engineering subjects.
3. Identify mandatory academic topics (core math, thermodynamics, circuit laws, mechanics, algorithms, or structural standards) that must never be dropped for degree accreditation.
4. Extract important high-value concepts.
5. Do NOT invent unrelated subjects. All extracted subjects MUST come directly from the syllabus text.

Return a valid JSON object matching EXACTLY this structure:
{
  "branch": "Engineering Branch identified from syllabus",
  "semester": "Semester identified or confirmed",
  "subjects": [
    {
      "name": "Subject Name",
      "code": "Subject Code if found in text",
      "units": [
        {
          "unitNumber": 1,
          "title": "Unit / Chapter Title",
          "topics": ["Topic 1", "Topic 2", "Topic 3"]
        }
      ]
    }
  ],
  "mandatoryTopics": ["Mandatory academic foundations extracted directly from syllabus"],
  "importantConcepts": ["Key foundational concepts in this curriculum"]
}

SYLLABUS CONTENT:
${rawText.slice(0, 15000)}`;

  return callAiWithJsonFormat<CurriculumAnalysisResult>(prompt, 0.1);
}

// -------------------------------------------------------------
// 2. EVOLVE CURRICULUM (KEEP / COMPRESS / ADD)
// -------------------------------------------------------------
export async function generatePersonalizedCurriculum(
  profile: StudentProfileData,
  curriculumData: CurriculumAnalysisResult
): Promise<EvolvedCurriculumResult> {
  const prompt = `You are the central brain of "SkillUp AI", an AI personalized curriculum creator for ENGINEERING STUDENTS of ANY branch.
Tagline: "College gives you one curriculum. SkillUp evolves it for YOU."

STUDENT CONTEXT:
- Engineering Branch: ${profile.branch}
- Year/Semester: ${profile.year_semester}
- Target Career Goal: ${profile.career_goal}
- Areas of Interest: ${profile.interests}
- Current Skills (Baseline): ${profile.current_skills}
- Available Daily Study Time: ${profile.daily_learning_minutes} minutes/day

COLLEGE CURRICULUM EXTRACTED SUBJECTS:
${JSON.stringify(curriculumData.subjects)}
Mandatory Core Topics: ${JSON.stringify(curriculumData.mandatoryTopics)}

CRITICAL RULES FOR PERSONALIZATION (REALISTIC SEMESTER PACING):
1. KEEP: Essential academic foundations from the uploaded college curriculum directly relevant to their degree and career goal.
   - CRITICAL RULE: NEVER remove mandatory academic requirements! Keep topics required for degree accreditation and core engineering principles.
2. COMPRESS: Topics from the uploaded curriculum that have lower relevance to the student's career goal OR topics where their current skills already cover the basics. Explain the exact time-saving rationale.
3. ADD (STRICT LIMIT: EXACTLY 2 TO 3 INDUSTRY SKILLS / TOOLS FOR THIS SEMESTER):
   - A student CANNOT learn 6 to 8 new technologies in a single semester alongside their college classes. DO NOT overwhelm them with a laundry list.
   - Recommend EXACTLY 2 to 3 high-impact industry skills/tools for this semester—NEVER MORE.
   - Each of the 2-3 skills MUST:
     a) Directly bridge from their CURRENT SKILLS (${profile.current_skills}) as a realistic stepping stone.
     b) Match their explicit stated INTERESTS (${profile.interests}).
     c) Be an indispensable industry standard for their TARGET CAREER GOAL (${profile.career_goal}).
     d) Be sequenced realistically across the 4-month semester (e.g. Skill 1 in Month 1-2, Skill 2 in Month 2-3, Skill 3 in Month 4).
4. EXPLANATIONS: For EVERY single item in KEEP, COMPRESS, and ADD, you MUST provide a clear, empathetic 1-2 sentence "why" explanation referencing their current skills and career goal so the student understands the value.

Return a valid JSON object matching EXACTLY this structure:
{
  "summary": "2-3 sentences explaining the overarching strategic shift made to the student's curriculum, highlighting the specific 2-3 focus skills selected for this semester",
  "keep": [
    { "topic": "Topic Name from College Curriculum", "subject": "Parent Subject", "why": "Why this must be kept", "importance": "High" }
  ],
  "compress": [
    { "topic": "Topic Name from College Curriculum", "subject": "Parent Subject", "why": "Why this can be streamlined/compressed", "timeReduction": "40% condensed" }
  ],
  "add": [
    { "topic": "Skill/Tool Name", "category": "Industry Skill / Modern Tool", "why": "Why this was added based on their current skills, interests, and career goal", "industryRelevance": "Critical for [Goal] (Semester Focus)" }
  ]
}`;

  return callAiWithJsonFormat<EvolvedCurriculumResult>(prompt, 0.2);
}

// -------------------------------------------------------------
// 3. GENERATE SEMESTER ROADMAP (Semester -> Month -> Week)
// -------------------------------------------------------------
export async function generateSemesterPlan(
  profile: StudentProfileData,
  evolvedCurriculum: EvolvedCurriculumResult
) {
  const prompt = `Create a realistic 16-week semester roadmap for an engineering student in ${profile.branch}.
Student Career Goal: ${profile.career_goal}
Current Baseline Skills: ${profile.current_skills}
Target Areas of Interest: ${profile.interests}
Daily Available Study Time: ${profile.daily_learning_minutes} minutes/day

CURRICULUM INGREDIENTS:
- MANDATORY ACADEMIC CORE (KEEP): ${evolvedCurriculum.keep.map(k => k.topic).join(', ')}
- TARGETED SEMESTER SKILLS (ADD - MAX 2-3 SKILLS): ${evolvedCurriculum.add.map(a => a.topic).join(', ')}
- COMPRESSED UNITS: ${evolvedCurriculum.compress.map(c => c.topic).join(', ')}

ROADMAP STRUCTURE RULES:
Phase the 2-3 ADD skills progressively across 4 Months alongside the college core:
- Month 1 (Weeks 1-4): Academic Foundations (KEEP) + Phase 1 of Industry Skill #1 (ADD).
- Month 2 (Weeks 5-8): Core Engineering Calculations + Advanced Skill #1 & Intro to Skill #2 (ADD).
- Month 3 (Weeks 9-12): Deep Practical Lab & Simulation on Skill #2 (ADD) + Advanced Academic Integration.
- Month 4 (Weeks 13-16): Industry Capstone Project synthesizing College Core + The 2-3 Learned Industry Skills for ${profile.career_goal}.

Return valid JSON:
{
  "totalWeeks": 16,
  "months": [
    {
      "month": 1,
      "title": "Month 1 Title",
      "focus": "Core focus and active industry skill",
      "milestoneTitle": "Month 1 Milestone Challenge",
      "weeks": [
        { "week": 1, "theme": "Week 1 Theme", "keyTopics": ["Topic 1", "Topic 2"] },
        { "week": 2, "theme": "Week 2 Theme", "keyTopics": ["Topic 3", "Topic 4"] },
        { "week": 3, "theme": "Week 3 Theme", "keyTopics": ["Topic 5", "Topic 6"] },
        { "week": 4, "theme": "Week 4 Theme", "keyTopics": ["Topic 7", "Topic 8"] }
      ]
    }
  ]
}`;

  return callAiWithJsonFormat<any>(prompt, 0.2);
}

// -------------------------------------------------------------
// 4. GENERATE WEEKLY & DAILY TASKS (Strictly respects daily study time!)
// -------------------------------------------------------------
export async function generateWeeklySchedule(
  profile: StudentProfileData,
  weekNumber: number,
  theme: string,
  topics: string[],
  backlogTasks: any[] = []
): Promise<WeeklyScheduleResult> {
  const dailyTime = profile.daily_learning_minutes;

  const prompt = `Generate a realistic, highly structured 7-day schedule (Monday to Sunday) for Week ${weekNumber}.
Engineering Branch: ${profile.branch}
Target Career Goal: ${profile.career_goal}
Current Baseline Skills: ${profile.current_skills}
Areas of Interest: ${profile.interests}
Weekly Theme: ${theme}
Focus Topics for this week: ${topics.join(', ')}
Daily Available Study Time: EXACTLY ${dailyTime} minutes per day.
Pending Backlog Items: ${JSON.stringify(backlogTasks)}

CRITICAL SCHEDULING RULES:
1. DAILY TIME ENFORCEMENT: For EACH day, the sum of task durations MUST NOT exceed ${dailyTime} minutes!
   Example for 60m: Task 1 (35m) + Task 2 (25m) = 60m.
   Example for 30m: Task 1 (20m) + Task 2 (10m) = 30m.
2. PEDAGOGICAL STRUCTURE ACROSS THE 7 DAYS:
   - Monday: Academic Core Fundamentals & Governing Physics (Theory)
   - Tuesday: College Analytical Calculation & Problem Solving (Practice)
   - Wednesday: Focused Hands-on Tutorial in the Semester Focus Industry Skill (Practice)
   - Thursday: Real-World Engineering Scenario & Parameter Optimization (Practice)
   - Friday: Integration Exercise (Connecting college theory to modern industry standard)
   - Saturday: Practical Mini-Challenge or Implementation Drill (Project/Practice)
   - Sunday: Weekly Knowledge Check, Formula Synthesis & Mistake Correction (Revision/Assessment)
3. BACKLOG STRATEGY: If backlog items exist, strategically insert at most ONE backlog task (e.g. on Wednesday or Friday) by adjusting other tasks so total daily minutes still <= ${dailyTime}.
4. NO GENERIC FLUFF: All task titles must be concrete and discipline-specific to ${profile.branch}.

Return valid JSON:
{
  "weekNumber": ${weekNumber},
  "title": "Week ${weekNumber}: ${theme}",
  "adaptiveNotes": "Structured learning progression tailored to ${dailyTime}m/day",
  "days": [
    {
      "dayName": "Monday",
      "dayIndex": 1,
      "totalMinutes": ${dailyTime},
      "tasks": [
        { "title": "Specific task title", "topic": "Topic", "taskType": "Theory", "durationMinutes": ${Math.round(dailyTime * 0.6)} },
        { "title": "Guided calculation drill", "topic": "Topic", "taskType": "Practice", "durationMinutes": ${dailyTime - Math.round(dailyTime * 0.6)} }
      ]
    }
  ]
}`;

  return callAiWithJsonFormat<WeeklyScheduleResult>(prompt, 0.2);
}

// -------------------------------------------------------------
// 5. BRANCH-SPECIFIC ASSESSMENT GENERATOR
// -------------------------------------------------------------
export async function generateAssessment(
  branch: string,
  topic: string,
  difficulty: string = 'Intermediate'
): Promise<AssessmentResultData> {
  const prompt = `You are an expert engineering examiner for ${branch}.
Create a high-quality 4-question technical assessment on "${topic}" at ${difficulty} level.

CRITICAL INSTRUCTION:
Do NOT make this generic CS or pure multiple-choice unless the branch is CSE.
- If Mechanical: include thermodynamic cycles, stress calculation, EV torque, heat transfer calculations.
- If Civil: include shear force, moment distribution, soil compaction/shear, structural limit state.
- If ECE: include signal Nyquist rate, transistor operating points, Verilog syntax, op-amp gain.
- If EEE: include load flow equations, inverter switching frequency, reactive power calculation.
- If CSE: include algorithmic complexity, SQL query, concurrency race condition, distributed systems.

Return valid JSON:
{
  "title": "${branch} Technical Assessment: ${topic}",
  "branch": "${branch}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "timeLimitMinutes": 20,
  "questions": [
    {
      "id": "q1",
      "type": "calculation",
      "question": "Clear problem statement with numerical values or engineering scenario",
      "context": "Formula or design boundary conditions",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Step-by-step engineering solution"
    }
  ]
}`;

  return callAiWithJsonFormat<AssessmentResultData>(prompt, 0.2);
}

// -------------------------------------------------------------
// 6. WEEKLY AI ADAPTATION ENGINE
// -------------------------------------------------------------
export async function adaptNextWeekPlan(
  profile: StudentProfileData,
  completedTasks: any[],
  missedTasks: any[],
  currentBacklog: any[],
  currentWeekNumber: number,
  upcomingTopics: string[]
) {
  const prompt = `You are the adaptive brain of SkillUp AI.
At the end of Week ${currentWeekNumber}, analyze the student's actual performance and dynamically synthesize Week ${currentWeekNumber + 1}.

STUDENT:
Branch: ${profile.branch}
Career Goal: ${profile.career_goal}
Daily Time: ${profile.daily_learning_minutes} min/day

PERFORMANCE LOG:
- Completed Tasks (${completedTasks.length}): ${completedTasks.map(t => t.title).join(', ')}
- Missed Tasks (${missedTasks.length}): ${missedTasks.map(t => t.title).join(', ')}
- Existing Backlog (${currentBacklog.length}): ${currentBacklog.map(b => b.title).join(', ')}

RULES FOR ADAPTATION:
1. Do NOT copy the previous week's plan.
2. If student completed tasks ahead of schedule, introduce next-stage advanced topics earlier.
3. If student missed critical prerequisite tasks, prioritize them into the backlog and weave them into the next week's schedule without exceeding the daily study time limit of ${profile.daily_learning_minutes} min.
4. Provide an intelligent diagnosis of strengths and weaknesses.

Return valid JSON:
{
  "performanceSummary": "Diagnosis of this week's pace and consistency",
  "strengthsIdentified": ["Topic/Skill mastered"],
  "weaknessesIdentified": ["Topic needing reinforcement"],
  "adaptiveActionTaken": "Explanation of how Week ${currentWeekNumber + 1} was modified to adapt",
  "rescheduledBacklog": [
    { "title": "Task title", "priority": "High", "scheduledDay": "Tuesday" }
  ],
  "nextWeekSchedule": {
    "weekNumber": ${currentWeekNumber + 1},
    "title": "Week ${currentWeekNumber + 1}: Adapted Curriculum",
    "adaptiveNotes": "Adaptive focus based on Week ${currentWeekNumber} results",
    "days": []
  }
}`;

  return callAiWithJsonFormat<any>(prompt, 0.3);
}

// -------------------------------------------------------------
// 7. MONTHLY MILESTONE RECOVERY PLAN GENERATOR
// -------------------------------------------------------------
export async function generateRecoveryPlan(
  profile: StudentProfileData,
  milestoneTitle: string,
  failedScore: number,
  weakAreas: string[]
) {
  const prompt = `The engineering student scored ${failedScore}% on the Monthly Milestone "${milestoneTitle}".
Pass mark is 70%. The student needs a targeted 3-day recovery plan before taking the retest.
Branch: ${profile.branch}
Career Goal: ${profile.career_goal}
Daily Available Time: ${profile.daily_learning_minutes} minutes
Identified Weak Areas: ${weakAreas.join(', ')}

Return valid JSON:
{
  "diagnosis": "Encouraging but precise technical diagnosis of where the student fell short",
  "recoveryDays": [
    {
      "day": 1,
      "title": "Targeted Concept Remediation",
      "tasks": [
        { "activity": "Deep dive into failed concepts", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.6)} },
        { "activity": "Guided problem walkthrough", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.4)} }
      ]
    },
    {
      "day": 2,
      "title": "Hands-on Practice & Calculation Drill",
      "tasks": [
        { "activity": "Solve 5 variation problems", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.7)} },
        { "activity": "Self-audit against reference solutions", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.3)} }
      ]
    },
    {
      "day": 3,
      "title": "Mock Milestone Retest Preparation",
      "tasks": [
        { "activity": "Timed simulation quiz", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.8)} },
        { "activity": "Retest Readiness Check", "durationMinutes": ${Math.round(profile.daily_learning_minutes * 0.2)} }
      ]
    }
  ],
  "retestReadyCriteria": ["Criteria student must fulfill before retest"]
}`;

  return callAiWithJsonFormat<any>(prompt, 0.2);
}

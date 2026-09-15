# SkillUp AI 🎓⚡

> **"College gives you one curriculum. SkillUp evolves it for YOU."**

SkillUp AI is an AI-powered personalized curriculum and learning planner built from scratch specifically for **engineering students across ANY discipline** (Mechanical, Civil, Electronics & Communication, Electrical & Electronics, Computer Science / IT, Aerospace, Automobile, Mechatronics, Chemical, Biotechnology, and AI & Data Science).

Instead of treating all engineering students like software boot campers or giving them a one-size-fits-all static syllabus, SkillUp AI ingests the student's **actual uploaded college curriculum PDF**, bridges it with **modern industry demands**, cross-references their **current baseline skills** and **target career role**, and evolves the syllabus into a realistic **16-week study roadmap** strictly budgeted to their daily available study time.

---

## 🌟 The Core Formula

$$\text{College Curriculum} + \text{Industry Requirements} + \text{Student Interest} + \text{Current Skills} + \text{Daily Time} = \mathbf{\text{Personalized Evolving Curriculum}}$$

1. **Academic Foundation (KEEP)**: Core engineering principles (thermodynamics, circuits, mechanics, data structures, structural analysis) are rigorously preserved for degree accreditation.
2. **Academic Efficiency (COMPRESS)**: Outdated, overly repetitive, or descriptive-only syllabus units are compressed into essential high-yield summaries.
3. **Industry Bridge (ADD — Strictly 2–3 Skills)**: Recommends **strictly 2 to 3 targeted, high-impact industry skills per semester** (e.g. EV Powertrain Modelling, BIM Revit, Edge AI on Microcontrollers) phased across 4 months so students achieve true mastery alongside regular college coursework.
4. **Pedagogical Progression**: Monday–Sunday schedules with balanced theory, calculation, hands-on active drills, engineering scenarios, capstone projects, and weekly knowledge checks.
5. **Time Budget Enforcement**: Every single day's tasks are strictly budgeted within the student's chosen study limit (30m, 60m, 120m, 3h, or 4h/day).

---

## 🚀 Key Architectural Highlights

### 1. 100% Dynamic Syllabus Extraction (Zero Mock Data)
- **Zero Pre-Existing / Hardcoded Presets**: SkillUp AI contains no fake dummy subjects or hardcoded lists.
- **Server-Side PDF Parsing**: Upload your official university syllabus PDF (`.pdf`), plain text (`.txt`), or markdown (`.md`). The backend uses `pdf-parse` to extract real characters, course codes, unit breakdowns, and chapters directly from the document.
- **Domain-Agnostic AI Extraction**: Accurately extracts mechanical, civil, electrical, aerospace, chemical, or computer science syllabi with equal precision.

### 2. Dual-Engine Intelligent AI Architecture (Groq + Google Gemini Fallback)
- **Primary AI Engine**: **Groq LPU** running `openai/gpt-oss-120b` for ultra-fast, near-instant inference.
- **Automatic Fallback Engine**: **Google Gemini** running `gemini-3.6-flash` via the official `@google/genai` SDK.
- **Zero Downtime Resilience**: If Groq encounters rate limits (HTTP 429), API bottlenecks, or temporary downtime, SkillUp AI automatically and seamlessly delegates the request to Google Gemini with zero disruption to the student.
- **AI Engine Hub**: An interactive in-app modal allows students and administrators to inspect live connection status, switch models, and configure API keys on the fly.

### 3. Google Cloud Firebase Firestore Integration
- **Cloud Persistence**: Integrated with Google Cloud Firebase Firestore (`skillup-ai-aa9ab`) via `firebase-admin`.
- **Real-Time Synchronized Collections**:
  - `users`: Authenticated student accounts.
  - `student_profiles`: Branch, target career goal, baseline skills, interests, and daily study budget.
  - `curricula`: Uploaded syllabus texts and AI-parsed course structures.
  - `personalized_curricula`: Evolved KEEP, COMPRESS, and ADD topics with explicit rationales.
  - `semester_plans`: 16-week structured month-by-month roadmaps.
  - `weekly_plans`: Structured Monday-to-Sunday weekly schedules.
  - `daily_tasks`: Day-by-day task progress, status tracking, and completion timestamps.
  - `milestones`: Monthly mastery challenges and branch-specific assessments.
- **Dual Persistence**: Local SQLite database acts as an ultra-fast local cache while Firebase Firestore provides reliable cloud backup.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Ultra-fast SPA with reactive state and modular components |
| **Styling** | Tailwind CSS v4 | Modern glassmorphism, responsive grid, and accessible design system |
| **Icons & UI** | Lucide React | Clean, intuitive engineering and status icons |
| **Backend Server** | Node.js + Express (ES Modules) | High-performance REST API with TypeScript execution via `tsx` |
| **Primary AI** | Groq SDK (`openai/gpt-oss-120b`) | Ultra-fast LPU inference for real-time syllabus analysis |
| **Fallback AI** | Google Gemini (`gemini-3.6-flash`) | Multimodal intelligent fallback via `@google/genai` |
| **PDF Extraction** | `pdf-parse` | Server-side binary buffer parsing for syllabus documents |
| **Local Database** | SQLite3 (`sqlite` wrapper) | Fast, zero-config local relational database |
| **Cloud Database** | Firebase Firestore (`firebase-admin`) | Google Cloud real-time cloud document database |
| **Security** | JWT + BCrypt + Service Account | Secure authentication and protected private credentials |

---

## 📂 Project Structure

```
SkillUp Ai/
├── README.md                           # Comprehensive documentation
├── .gitignore                          # Git ignore for sensitive keys & builds
├── client/                             # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Navigation bar with AI Engine status badge
│   │   │   ├── GroqModal.tsx           # AI Engine Hub (Groq + Gemini + Firestore)
│   │   │   ├── BranchAssessmentModal.tsx # Branch-specific technical quizzes
│   │   │   ├── WeeklyAdaptationModal.tsx # Adaptive backlog rebalancer
│   │   │   └── EvolvingCurriculumVisualizer.tsx # KEEP/COMPRESS/ADD visualizer
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # User authentication & global state
│   │   ├── pages/
│   │   │   ├── OnboardingPage.tsx      # Clean syllabus upload & career input
│   │   │   ├── DashboardPage.tsx       # Daily task hub with study timer
│   │   │   ├── MyCurriculumPage.tsx    # Evolved syllabus viewer with rationales
│   │   │   ├── WeeklyPlannerPage.tsx   # 7-day schedule with backlog integration
│   │   │   ├── SemesterRoadmapPage.tsx # 16-week Month-by-Month roadmap
│   │   │   ├── BacklogPage.tsx         # Missed task manager & recovery planner
│   │   │   └── MilestonesPage.tsx      # Monthly capstones & assessments
│   │   ├── services/
│   │   │   └── api.ts                  # Centralized HTTP client
│   │   ├── App.tsx                     # Top-level view routing
│   │   └── main.tsx                    # React DOM entrypoint
│   └── package.json
└── server/                             # Backend Node.js + Express + TypeScript
    ├── src/
    │   ├── controllers/
    │   │   ├── authController.ts       # Registration & login with Firestore sync
    │   │   ├── profileController.ts    # Syllabus upload & AI evolution pipeline
    │   │   ├── planController.ts       # Semester, weekly, and daily task management
    │   │   ├── backlogController.ts    # Backlog queue & adaptive redistribution
    │   │   ├── milestoneController.ts  # Monthly assessments & capstone challenges
    │   │   └── settingsController.ts   # AI status, Gemini key & Firestore status
    │   ├── db/
    │   │   └── database.ts             # SQLite connection & schema initialization
    │   ├── middleware/
    │   │   └── auth.ts                 # JWT verification middleware
    │   ├── services/
    │   │   ├── groqService.ts          # Dual-engine AI pipeline (Groq + Gemini)
    │   │   ├── firebaseService.ts      # Firebase Admin SDK & Firestore persistence
    │   │   └── pdfExtractor.ts         # Binary PDF UTF-8 text extraction
    │   ├── routes/
    │   │   └── api.ts                  # Express router definitions
    │   └── index.ts                    # Server bootstrap & database initialization
    ├── firebase-service-account.json   # Google Cloud service account credentials
    ├── .env                            # Environment variables (API keys & secrets)
    └── package.json
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: Version 18 or higher (v20+ recommended).
- **npm**: Version 9 or higher.

### 1. Clone or Open the Repository
```bash
cd "SkillUp Ai"
```

### 2. Configure Environment Variables
Inside `server/.env`, verify or provide your API keys:
```env
PORT=5000
JWT_SECRET=skillup_ai_jwt_super_secret_production_key

# Primary Ultra-Fast Engine
GROQ_API_KEY=gsk_your_groq_api_key_here

# Automatic Intelligent Fallback Engine
GEMINI_API_KEY=AQ.your_gemini_api_key_here

# Firebase Firestore Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

> **Note**: A valid Firebase service account JSON is located at `server/firebase-service-account.json` for cloud project `skillup-ai-aa9ab`.

### 3. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
The server will start on: **`http://localhost:5000`**
- Health check: `http://localhost:5000/health`
- AI Engine status: `http://localhost:5000/api/settings/ai-status`
- Firebase Firestore status: `http://localhost:5000/api/settings/firebase-status`

### 4. Start the Frontend Client
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will start on: **`http://localhost:5173`**

---

## 🧪 Step-by-Step Usage Walkthrough

1. **Navigate to the App**: Open **`http://localhost:5173`** in your browser.
2. **Register/Login**: Create a new account (e.g. `alex@engineering.edu` / `password123`).
3. **Verify AI Engine Status**: Click the **"AI Engine Hub"** button in the top navigation bar to confirm:
   - **Groq AI (Primary)**: Connected (`openai/gpt-oss-120b`).
   - **Google Gemini (Fallback)**: Active Standby (`gemini-3.6-flash`).
   - **Firebase Firestore**: Connected (`skillup-ai-aa9ab`).
4. **Onboarding & Syllabus Upload**:
   - Select your engineering branch (e.g., *Mechanical Engineering*, *Civil Engineering*, *ECE*, *Mechatronics*, etc.).
   - Enter your target career role (e.g., *Electric Vehicle Powertrain Engineer* or *BIM Infrastructure Specialist*).
   - Enter your baseline skills and areas of interest.
   - Choose your daily study budget (**30m, 60m, 120m, 3h, or 4h/day**).
   - Click **"Upload College Syllabus PDF"** to select your official university syllabus PDF, or paste the text directly into the box.
   - Click **"Analyze Syllabus & Evolve Curriculum"**.
5. **View Personalized Evolving Curriculum**:
   - Inspect **KEEP Topics**: Mandatory degree topics preserved with academic rationale.
   - Inspect **COMPRESS Topics**: Outdated/descriptive topics compressed with time-saving metrics.
   - Inspect **ADD Topics**: **Strictly 2–3 high-impact industry skills** with industry relevance justifications.
6. **Execute Your Daily Schedule**:
   - Access the **Today's Plan** tab on your dashboard.
   - Run the study focus timer for each task.
   - Mark tasks as *Completed* or *Missed*.
   - Missed tasks are automatically moved to your **Backlog Queue** and intelligently redistributed without burning you out!
7. **Take Branch-Specific Assessments & Milestones**:
   - Complete technical calculations, governing equations, and scenario-based questions generated specifically for your branch.
   - Submit monthly capstone milestone challenges to unlock subsequent stages!

---

## 🛡️ License

Built with ❤️ for Engineering Students worldwide. All rights reserved.

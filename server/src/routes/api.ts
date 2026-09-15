import { Router } from 'express';
import multer from 'multer';
import { register, login, me, resetPassword } from '../controllers/authController.js';
import { getProfile, saveProfile, uploadAndEvolveCurriculum, getPresets, extractPdf } from '../controllers/profileController.js';
import { getPersonalizedCurriculum } from '../controllers/curriculumController.js';
import { getSemesterPlan, getWeeklyPlan, getTodayOverview, updateTaskStatus } from '../controllers/planController.js';
import { getBacklog, updateBacklogStatus } from '../controllers/backlogController.js';
import { adaptWeeklySchedule } from '../controllers/adaptiveController.js';
import { getMilestones, getBranchAssessment, submitMilestone } from '../controllers/milestoneController.js';
import { getGroqStatus, getAiStatus, getFirebaseStatus, saveGroqKey, saveGeminiKey } from '../controllers/settingsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Public Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/reset-password', resetPassword);
router.get('/presets', getPresets);
router.get('/settings/groq-status', getGroqStatus);
router.get('/settings/ai-status', getAiStatus);
router.get('/settings/firebase-status', getFirebaseStatus);
router.post('/settings/groq-key', saveGroqKey);
router.post('/settings/gemini-key', saveGeminiKey);
router.post('/curriculum/extract-pdf', upload.single('file'), extractPdf);

// Protected Routes
router.use(authMiddleware as any);

router.get('/auth/me', me);

// Profile & Onboarding
router.get('/profile', getProfile);
router.post('/profile', saveProfile);
router.post('/curriculum/upload-and-evolve', upload.single('file'), uploadAndEvolveCurriculum);

// Curriculum
router.get('/curriculum/personalized', getPersonalizedCurriculum);

// Plans & Tasks
router.get('/plans/semester', getSemesterPlan);
router.get('/plans/weekly', getWeeklyPlan);
router.get('/plans/today', getTodayOverview);
router.patch('/tasks/:taskId/status', updateTaskStatus);

// Backlog
router.get('/backlog', getBacklog);
router.patch('/backlog/:id', updateBacklogStatus);

// Adaptive Loop
router.post('/adaptive/week-review', adaptWeeklySchedule);

// Milestones & Assessments
router.get('/milestones', getMilestones);
router.get('/assessment', getBranchAssessment);
router.post('/milestones/:milestoneId/submit', submitMilestone);

export default router;

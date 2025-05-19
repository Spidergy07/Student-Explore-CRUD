import express from 'express';
import { getAllStudentsWithPreferences, getStudentPreferencesByStudentId } from '../controllers/teacherController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// All routes in this file are protected and restricted to teachers
router.use(protect);
router.use(restrictTo('teacher'));

router.route('/dashboard')
  .get(getAllStudentsWithPreferences);

// Route to get preferences for a specific student by ID
router.route('/students/:studentId/preferences')
  .get(getStudentPreferencesByStudentId);

export default router; 
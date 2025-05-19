import express from 'express';
import { getStudentPreferences, upsertStudentPreferences } from '../controllers/studentController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);
router.use(restrictTo('student')); // Ensure only users with 'student' role can access these routes

router.route('/preferences')
.get(getStudentPreferences)
.post(upsertStudentPreferences); // POST /api/students/preferences - Create or update current student's preferences

export default router; 
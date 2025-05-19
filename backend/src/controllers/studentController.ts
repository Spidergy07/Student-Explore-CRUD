import { Request, Response } from 'express';
import pool from '../db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
  body: any;
}

interface StudentPreference {
  user_id: number;
  favorite_subjects: string[];
  dreams: string;
  dream_job: string;
}

// Define Max Lengths (can be moved to config.env)
const MAX_DREAMS_LENGTH = 500; // Example max length for dreams
const MAX_DREAM_JOB_LENGTH = 100; // Example max length for dream_job
const MAX_SUBJECT_LENGTH = 50; // Example max length for individual subject tag

// Get student preferences (unchanged)
export const getStudentPreferences = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
  }
  const userId = req.user.id;

  try {
    const [rows] = await pool.query('SELECT favorite_subjects, dreams, dream_job FROM student_preferences WHERE user_id = ?', [userId]);
    const preferences = (rows as any[]);

    if (preferences.length > 0) {
      const dbPref = preferences[0];
      let parsedSubjects: string[] = [];
      if (dbPref.favorite_subjects) {
        try {
          parsedSubjects = JSON.parse(dbPref.favorite_subjects);
          if (!Array.isArray(parsedSubjects)) {
            console.warn('Parsed favorite_subjects is not an array, defaulting to empty. UserID:', userId, 'Value:', dbPref.favorite_subjects);
            parsedSubjects = [];
          }
        } catch (parseError) {
          console.error('Error parsing favorite_subjects from DB. UserID:', userId, 'Value:', dbPref.favorite_subjects, 'Error:', parseError);
          parsedSubjects = [];
        }
      }
      const parsedPreferences = {
        ...dbPref,
        favorite_subjects: parsedSubjects,
      };
      return res.status(200).json({ status: 'success', data: parsedPreferences });
    } else {
      return res.status(200).json({
        status: 'success',
        data: { favorite_subjects: [], dreams: '', dream_job: '' }
      });
    }
  } catch (error) {
    console.error('Error fetching student preferences:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Create or Update student preferences (upsert)
export const upsertStudentPreferences = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
  }
  const userId = req.user.id;
  const { favoriteSubjects, dreams, dream_job } = req.body;

  // Basic Type Validation
  if (!Array.isArray(favoriteSubjects) || typeof dreams !== 'string' || typeof dream_job !== 'string') {
    return res.status(400).json({ status: 'fail', message: 'Invalid data format for preferences' });
  }

  // Detailed Input Validation (A08)
  if (dreams.length > MAX_DREAMS_LENGTH) {
      return res.status(400).json({ status: 'fail', message: `Dreams cannot exceed ${MAX_DREAMS_LENGTH} characters.` });
  }
  if (dream_job.length > MAX_DREAM_JOB_LENGTH) {
      return res.status(400).json({ status: 'fail', message: `Dream job cannot exceed ${MAX_DREAM_JOB_LENGTH} characters.` });
  }
  // Validate individual subject tags length
  if (favoriteSubjects.some(subject => typeof subject !== 'string' || subject.length > MAX_SUBJECT_LENGTH)) {
       return res.status(400).json({ status: 'fail', message: `Each subject cannot exceed ${MAX_SUBJECT_LENGTH} characters and must be a string.` });
  }

  const favoriteSubjectsJSON = JSON.stringify(favoriteSubjects);

  try {
    const query = `
      INSERT INTO student_preferences (user_id, favorite_subjects, dreams, dream_job)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        favorite_subjects = VALUES(favorite_subjects),
        dreams = VALUES(dreams),
        dream_job = VALUES(dream_job);
    `;
    await pool.query(query, [userId, favoriteSubjectsJSON, dreams, dream_job]);
    
    // Fetch the updated/inserted data to return it
    const [updatedRows] = await pool.query('SELECT favorite_subjects, dreams, dream_job FROM student_preferences WHERE user_id = ?', [userId]);
    const updatedPref = (updatedRows as any[])[0];
    const responsePref = {
      ...updatedPref,
      favorite_subjects: updatedPref.favorite_subjects ? JSON.parse(updatedPref.favorite_subjects) : [],
    };

    return res.status(200).json({ status: 'success', message: 'Preferences saved successfully', data: responsePref });
  } catch (error) {
    console.error('Error upserting student preferences:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
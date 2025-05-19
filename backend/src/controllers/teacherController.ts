import { Request, Response } from 'express';
import pool from '../db';

interface AuthenticatedRequest extends Request {
    user?: { 
      id: number;
      username: string;
      role: string;
    };
    params: {
        studentId?: string;
        [key: string]: string | undefined;
    };
  }

export const getAllStudentsWithPreferences = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const query = `
            SELECT 
                u.id AS user_id,
                u.username,
                sp.favorite_subjects,
                sp.dreams,
                sp.dream_job,
                sp.created_at AS preferences_created_at,
                sp.updated_at AS preferences_updated_at
            FROM users u
            LEFT JOIN student_preferences sp ON u.id = sp.user_id
            WHERE u.role = 'student'; 
        `;
        
        const [rows] = await pool.query(query);
        const students = (rows as any[]).map(student => ({
            ...student,
            favorite_subjects: student.favorite_subjects ? JSON.parse(student.favorite_subjects) : [],
        }));

        return res.status(200).json({ status: 'success', results: students.length, data: { students } });

    } catch (error) {
        console.error('Error fetching all students with preferences:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getStudentPreferencesByStudentId = async (req: AuthenticatedRequest, res: Response) => {
    const studentIdString = req.params.studentId;
    if (!studentIdString) {
        return res.status(400).json({ status: 'fail', message: 'Student ID is required in path' });
    }
    const studentId = parseInt(studentIdString, 10);

    if (isNaN(studentId)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid student ID format' });
    }

    try {
        // verify the user is indeed a student
        const [userRows] = await pool.query('SELECT role FROM users WHERE id = ?', [studentId]);
        const users = userRows as any[];
        if (users.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'Student not found' });
        }
        if (users[0].role !== 'student') {
            return res.status(403).json({ status: 'fail', message: 'User is not a student' });
        }

        // Fetch preferences for the student
        const [prefRows] = await pool.query('SELECT favorite_subjects, dreams, dream_job, created_at, updated_at FROM student_preferences WHERE user_id = ?', [studentId]);
        const preferences = (prefRows as any[]);

        if (preferences.length > 0) {
            const dbPref = preferences[0];
            const parsedPreferences = {
                ...dbPref,
                favorite_subjects: dbPref.favorite_subjects ? JSON.parse(dbPref.favorite_subjects) : [],
            };
            return res.status(200).json({ status: 'success', data: parsedPreferences });
        } else {
            // No preferences found for this student, return empty/default structure
            return res.status(200).json({
                status: 'success',
                data: { favorite_subjects: [], dreams: '', dream_job: '', message: 'No preferences set by this student yet.' }
            });
        }
    } catch (error) {
        console.error('Error fetching student preferences by ID:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}; 
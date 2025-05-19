import express , { Request, Response } from 'express';
import { register, login, logout, changePassword} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define interface for user
interface User {
    id: number;
    password: string;
    [key: string]: any; // Allow any other properties
};

interface AuthRequest extends Request {
    user?: User;
};

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// Route for changing password (protected)
router.post('/change-password', protect, changePassword);

// Protected route : Get current user details
router.get('/me', protect, (req: AuthRequest, res: Response) => {
    if (req.user) {
        // Clone user object and remove password before sending
        const userToSend = { ...req.user };
        delete userToSend.password;

        res.status(200).json({
            status: 'success',
            data: {
                user: userToSend,
            },
        });
    } else {
        // This case should ideally be caught by the protect middleware already
        res.status(401).json({
            status: 'fail',
            message: 'User not found or not authenticated.',
        })
    }
});

export default router;
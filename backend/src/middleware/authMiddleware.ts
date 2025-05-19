import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import pool from '../db';

interface User {
    id: number;
    username: string;
    password: string;
    role?: string;
};

interface AuthRequest extends Request {
    user?: User,
    cookies?: { [key: string]: string };
    ip?: string;
};

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware protected route
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // get token from cookies
    // Check if the token is provided
    let token: string | undefined;
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    };

    if (!token || token === 'loggedout') {
        console.warn(`SECURITY: Authentication failed - No token provided or logged out. IP: ${req.ip}`);
        res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please log in to get access.',
        });
        return;
    }

    try {
        // Verify Token
        const decoded = await promisify(jwt.verify)(token, JWT_SECRET as string) as JwtPayload;
        // Check if the user still exists
        const [rows] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [decoded.id]);
        const users = rows as User[];
        if (users.length === 0) {
            console.warn(`SECURITY: Authentication failed - User from token not found. Token ID: ${decoded.id}, IP: ${req.ip}`);
            res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token does no longer exist.',
            });
            return;
        }
        const currentUser = users[0];
        // OPTIONAL: Check if the user changed the password after the token was issued
        // Example check (if you added passwordChangedAt to user table and User interface):
        // if (currentUser.passwordChangedAt && decoded.iat && currentUser.passwordChangedAt.getTime() / 1000 > decoded.iat) {
        //     console.warn(`SECURITY: Authentication failed - Password changed after token issued. User: ${currentUser.username} (ID: ${currentUser.id}), IP: ${req.ip}`);
        //     return res.status(401).json({ status: 'fail', message: 'Password recently changed. Please log in again.' });
        // }

        // Allow access to protected routes
        req.user = currentUser;
        next();
    } catch (error: any) {
        console.error(`SECURITY: Authentication failed - Token verification error: ${error.name} - ${error.message}. IP: ${req.ip}`);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                status: 'fail',
                message: 'Invalid token. Please log in again.',
            });
        } else if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                status: 'fail',
                message: 'Your token has expired! Please log in again.',
            });
        } else {
            res.status(401).json({
                status: 'fail',
                message: 'Authentication failed. Please log in again.',
            });
        }
    }
};

// Middleware For role-based access restrictions
export const restrictTo  = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        // roles is an array like ['admin', 'user']. req.user.role comes from protect
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            console.warn(`SECURITY: Authorization failed - User ${req.user?.username || 'N/A'} (ID: ${req.user?.id || 'N/A'}) with role '${req.user?.role || 'N/A'}' attempted to access restricted route. Allowed roles: ${roles.join(', ')}. IP: ${req.ip}`);
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action',
            });
            return;
        }
        next();
    };
};
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import { stat } from 'fs';

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '../config.env')})
// Critical Environment Variable Checks
const requiredEnvVars: string[] = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'COOKIE_EXPIRES_IN_MS', 'FRONTEND_URL', 'PORT'];
const missingEnvVars: string[] = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Fatal Error: Missing environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please ensure they are set in your config.env file or system environment.');
    process.exit(1);
};

console.log('Successfully loaded critical environment variables.');

// Initialize Express app
const app: Express = express();

// Global Middlewares
// Set security HTTP headers
app.use(helmet());

// CORS configuration
const corsOptions: cors.CorsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limit to 10kb

// Cookie parser
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,// Limit each IP to 10 login/register requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

// Global error handling middleware
interface ErrorWithStatus extends Error {
    statusCode?: number;
    status?: string;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err.stack);
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong', 
    })
})

// Start the server
const PORT: string | number = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
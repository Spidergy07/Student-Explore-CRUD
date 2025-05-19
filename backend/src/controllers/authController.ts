import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import pool from "../db";

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '../../config.env')})

const saltRounds = 10;

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}
if (!process.env.JWT_EXPIRES_IN) {
  throw new Error("FATAL ERROR: JWT_EXPIRES_IN is not defined in environment variables.");
}
if (!process.env.COOKIE_EXPIRES_IN_MS || isNaN(parseInt(process.env.COOKIE_EXPIRES_IN_MS, 10))) {
  throw new Error("FATAL ERROR: COOKIE_EXPIRES_IN_MS is not defined or not a valid number in environment variables.");
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN;
const COOKIE_EXPIRES_IN_MS: number = parseInt(process.env.COOKIE_EXPIRES_IN_MS, 10);

// Define Brute-force protection settings (can be moved to config.env)
const MAX_LOGIN_ATTEMPTS = 5; // Maximum failed attempts before lockout
const LOCKOUT_DURATION_MINUTES = 15; // Duration of lockout in minutes

// Define Max Lengths (can be moved to config.env)
const MAX_USERNAME_LENGTH = 50; // Example max length for username

interface User {
  id: number;
  username: string;
  password?: string;
  role: string;
}

const createSendToken = (user: User, statusCode: number, res: Response): void => {
  const tokenPayload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + COOKIE_EXPIRES_IN_MS),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as "Lax",
  };

  res.cookie("jwt", token, cookieOptions);

  const userForResponse = { ...user };
  delete userForResponse.password;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userForResponse,
    },
  });
};

// Password Policy Check Function
const checkPasswordPolicy = (password: string): string | null => {
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }
    // Check for at least one digit
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }
    // Check for at least one special character (adjust regex as needed for allowed chars)
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return "Password must contain at least one special character (!@#$%^&*()...).";
    }
    return null; // Password meets policy
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: "fail", message: "Username and password are required" });
  }

  // Validate username length
  if (username.length > MAX_USERNAME_LENGTH) {
      return res.status(400).json({ status: "fail", message: `Username cannot exceed ${MAX_USERNAME_LENGTH} characters.` });
  }

  // if (email && !/\S+@\S+\.\S+/.test(email)) {
  //   return res.status(400).json({ status: "fail", message: "Invalid email format" });
  // }

  // Check New Password Policy (Backend Validation)
  const policyError = checkPasswordPolicy(password);
  if (policyError) {
      return res.status(400).json({ status: "fail", message: policyError });
  }

  try {
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if ((existingUsers as User[]).length > 0) {
      const existingUser = (existingUsers as User[])[0];
      if (existingUser.username === username) {
        return res.status(409).json({ status: "fail", message: "Username already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultRole = 'student';
    
    const insertQuery = "INSERT INTO users (username, password, role, failed_login_attempts, lockout_until) VALUES (?, ?, ?, ?, ?)";
    const insertParams = [username, hashedPassword, defaultRole, 0, null];

    const [result] = await pool.query(insertQuery, insertParams);
    
    const newUser: User = {
      id: (result as any).insertId,
      username,
      role: defaultRole,
    };
    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ status: "error", message: "Internal server error during registration" });
  }
  return res;
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { username, password } = req.body;
  const userIp = req.ip; // Get IP address

  if (!username || !password) {
    console.warn(`SECURITY: Login failed - Missing credentials from IP: ${userIp}`);
    return res.status(400).json({ status: "fail", message: "Please provide username and password" });
  }

  try {
    // 1. Fetch user including failed_login_attempts and lockout_until
    const [rows] = await pool.query("SELECT id, username, password, role, failed_login_attempts, lockout_until FROM users WHERE username = ?", [username]);
    const users = rows as (User & { failed_login_attempts: number | null; lockout_until: Date | null })[];
    const user = users.length > 0 ? users[0] : null;

    // 2. Check if user exists and is currently locked out
    if (!user) {
        console.warn(`SECURITY: Login failed - User not found: ${username} from IP: ${userIp}`);
      return res.status(401).json({ status: "fail", message: "Incorrect username or password" });
    }

    if (user.lockout_until && user.lockout_until > new Date()) {
        console.warn(`SECURITY: Login failed - Account locked out: ${username} from IP: ${userIp}. Lockout ends at ${user.lockout_until}.`);
        const remainingTime = Math.ceil((user.lockout_until.getTime() - new Date().getTime()) / (60 * 1000));
        return res.status(401).json({ status: "fail", message: `Too many failed login attempts. Please try again in ${remainingTime} minutes.` });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
      // 4. Handle failed login attempt: Increment attempts, potentially lock out
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      let lockoutUntil = user.lockout_until;
      let updateQuery = "UPDATE users SET failed_login_attempts = ? WHERE id = ?";
      let updateParams: (string | number | Date | null)[] = [newAttempts, user.id];

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
          updateQuery = "UPDATE users SET failed_login_attempts = ?, lockout_until = ? WHERE id = ?";
          updateParams = [newAttempts, lockoutUntil, user.id];
          console.warn(`SECURITY: Login failed - User locked out: ${username} from IP: ${userIp} after ${newAttempts} attempts. Lockout until ${lockoutUntil}`);
      } else {
           console.warn(`SECURITY: Login failed - Incorrect password for user: ${username} from IP: ${userIp}. Failed attempts: ${newAttempts}`);
      }

      await pool.query(updateQuery, updateParams);

      return res.status(401).json({ status: "fail", message: "Incorrect username or password" });
    }

    // 5. Handle successful login: Reset failed attempts and lockout status
    if (user.failed_login_attempts > 0 || user.lockout_until) {
         await pool.query("UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = ?", [user.id]);
         console.log(`SECURITY: User logged in successfully: ${username} (ID: ${user.id}) from IP: ${userIp}. Failed attempts reset.`);
    } else {
         console.log(`SECURITY: User logged in successfully: ${username} (ID: ${user.id}) from IP: ${userIp}.`);
    }


    // 6. Create and send token
    createSendToken(user, 200, res);
  } catch (error) {
    console.error(`SECURITY: Error during login for user ${username} from IP ${userIp}:`, error);
    return res.status(500).json({ status: "error", message: "An error occurred during login." });
  }
  return res;
};

export const logout = (req: Request, res: Response): Response => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as "Lax",
  });
  return res.status(200).json({ status: "success", message: "User logged out successfully" });
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  const userId = (req as any).user?.id; // User ID from authenticated user
  const userUsername = (req as any).user?.username; // Get username for logging
  const userIp = req.ip; // Get IP address

  if (!userId) {
      console.error(`SECURITY: Password change failed - Authenticated user ID not found in request from IP: ${userIp}`);
      return res.status(500).json({ status: "error", message: "Authenticated user not found" });
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // 2. Server-side Validation
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ status: "fail", message: "Please provide current password, new password, and confirm password." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ status: "fail", message: "New password and confirm password do not match." });
  }

  // Check New Password Policy (Backend Validation)
  const policyError = checkPasswordPolicy(newPassword);
  if (policyError) {
      return res.status(400).json({ status: "fail", message: policyError });
  }

  if (newPassword.length < 8) { // Redundant check
    return res.status(400).json({ status: "fail", message: "New password must be at least 8 characters long." });
  }

  try {
    // 3. Find user by ID from authenticated user (A01 check)
    const [rows] = await pool.query("SELECT id, password FROM users WHERE id = ?", [userId]);
    const user = (rows as User[])[0];

    if (!user) {
      console.error(`SECURITY: Password change failed - User with ID ${userId} not found during password change from IP: ${userIp}.`);
      return res.status(404).json({ status: "fail", message: "User not found." });
    }

    // 4. Verify current password (A02 check)
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password as string);

    if (!isCurrentPasswordCorrect) {
      console.warn(`SECURITY: Password change failed - Incorrect current password for user ${userUsername} (ID: ${userId}) from IP: ${userIp}.`);
      return res.status(401).json({ status: "fail", message: "Incorrect current password." });
    }
    
    // Optional: Check if new password is the same as old password
    const isNewPasswordSameAsCurrent = await bcrypt.compare(newPassword, user.password as string);
    if (isNewPasswordSameAsCurrent) {
        console.warn(`SECURITY: Password change failed - New password is same as current for user ${userUsername} (ID: ${userId}) from IP: ${userIp}.`);
        return res.status(400).json({ status: "fail", message: "New password cannot be the same as the current password." });
    }


    // 5. Hash the new password (A02 check)
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. Update the password in the database (A03 prevention via Parameterized Query)
    const updateQuery = "UPDATE users SET password = ?, failed_login_attempts = 0, lockout_until = NULL WHERE id = ?"; // Reset failed attempts/lockout on success
    await pool.query(updateQuery, [hashedNewPassword, userId]);

    // 7. Invalidate Session/Token (A07)
    // Simplest approach for cookie-based JWT: Clear the cookie to force re-login.
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000), // Expire quickly
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax" as "Lax",
    });
    // A more robust approach for JWT would involve adding a 'passwordChangedAt' timestamp to the user DB
    // and checking it in the 'protect' middleware to invalidate older tokens.
    // Or implementing a server-side token blacklist (requires state management).
    // For this implementation, clearing the cookie forces the user to log in again, which is a reasonable security measure.

    console.log(`SECURITY: Password changed successfully for user ${userUsername} (ID: ${userId}) from IP: ${userIp}.`);

    // 8. Send success response
    return res.status(200).json({ status: "success", message: "Password changed successfully. Please log in again with your new password." });

  } catch (error) {
    console.error(`SECURITY: Error changing password for user ${userUsername} (ID: ${userId}) from IP ${userIp}:`, error);
    return res.status(500).json({ status: "error", message: "Internal server error during password change." });
  }
};

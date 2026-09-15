import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { firestoreSaveUser } from '../services/firebaseService.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase().trim());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.run(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      userId,
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash
    );

    // Sync to Cloud Firestore asynchronously
    firestoreSaveUser({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim()
    }).catch(err => console.warn('Firestore sync user error:', err));

    const token = generateToken(userId);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim() },
      hasProfile: false
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if student profile exists
    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', user.id);
    const personalized = await db.get('SELECT id FROM personalized_curricula WHERE user_id = ?', user.id);

    const token = generateToken(user.id);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
      hasProfile: !!profile,
      hasPersonalizedCurriculum: !!personalized,
      profile: profile || null
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const profile = await db.get('SELECT * FROM student_profiles WHERE user_id = ?', req.userId);
    const personalized = await db.get('SELECT id FROM personalized_curricula WHERE user_id = ?', req.userId);

    res.json({
      user,
      hasProfile: !!profile,
      hasPersonalizedCurriculum: !!personalized,
      profile: profile || null
    });
  } catch (error: any) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ error: 'Email and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const db = await getDb();
    const user = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase().trim());
    if (!user) {
      res.status(404).json({ error: 'No account found with this email address' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', passwordHash, user.id);

    res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error during password reset' });
  }
}

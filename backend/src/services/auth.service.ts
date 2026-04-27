import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export class AuthService {
  async register(email: string, password: string, name?: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await query(
        'INSERT INTO users (email, password, name, provider) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name || email.split('@')[0], 'email']
      );
      
      const userId = (result as any).lastID;
      const userResult = await query('SELECT id, email, name FROM users WHERE id = ?', [userId]);
      const user = userResult.rows[0];
      const token = this.generateToken(user);
      
      return { user, token };
    } catch (error: any) {
      if (error.message?.includes('UNIQUE')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const result = await query('SELECT * FROM users WHERE email = ? AND provider = ?', [email, 'email']);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  async findOrCreateOAuthUser(profile: any, provider: string) {
    const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.com`;
    
    let result = await query(
      'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
      [provider, profile.id]
    );

    if (result.rows.length === 0) {
      const insertResult = await query(
        'INSERT INTO users (email, name, avatar, provider, provider_id) VALUES (?, ?, ?, ?, ?)',
        [email, profile.displayName, profile.photos?.[0]?.value, provider, profile.id]
      );
      const userId = (insertResult as any).lastID;
      result = await query('SELECT * FROM users WHERE id = ?', [userId]);
    }

    const user = result.rows[0];
    const token = this.generateToken(user);
    
    return { user, token };
  }

  private generateToken(user: any): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }

  async getUserById(id: number) {
    const result = await query('SELECT id, email, name, avatar, provider FROM users WHERE id = ?', [id]);
    return result.rows[0];
  }
}

export default new AuthService();

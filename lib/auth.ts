import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db, User, Session } from './db/file-db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super_secret_key_that_is_at_least_32_bytes_long'
);

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createJWT(payload: any): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
  }

  static async verifyJWT(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (error) {
      return null;
    }
  }

  static async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await db.createUser({
      username,
      email,
      passwordHash,
    });

    // Create session
    const token = await this.createJWT({ userId: user.id, username: user.username });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await db.createSession({
      userId: user.id,
      token,
      expiresAt,
    });

    return { user, token };
  }

  static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await db.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const token = await this.createJWT({ userId: user.id, username: user.username });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await db.createSession({
      userId: user.id,
      token,
      expiresAt,
    });

    return { user, token };
  }

  static async logout(token: string): Promise<void> {
    const session = await db.getSessionByToken(token);
    if (session) {
      await db.deleteSession(session.id);
    }
  }

  static async authenticate(token: string): Promise<User | null> {
    try {
      const payload = await this.verifyJWT(token);
      if (!payload || !payload.userId) {
        return null;
      }

      const session = await db.getSessionByToken(token);
      if (!session) {
        return null;
      }

      const user = await db.getUserById(payload.userId);
      return user;
    } catch (error) {
      return null;
    }
  }
}

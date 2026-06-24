import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { config } from '../config/env';
import { IUser, UserRole } from '../types';
import { AuthError, ValidationError, AppError } from '../utils/errors';
import { RegisterInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findUserByEmail(email: string): Promise<IUser | undefined> {
  return db<IUser>('Users').where({ Email: email }).first();
}

function generateToken(userId: number, role: UserRole): string {
  const options: jwt.SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };
  return jwt.sign({ userId, role }, config.jwt.secret as string, options);
}

// ─── Register ───────────────────────────────────────────────────────────────

export async function registerUser(data: RegisterInput) {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new ValidationError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Insert user inside a transaction so Student row is atomic
  const result = await db.transaction(async (trx) => {
    const [inserted] = await trx('Users')
      .insert({
        FullName: data.fullName,
        Email: data.email,
        Phone: data.phone || null,
        PasswordHash: passwordHash,
        Role: data.role,
        IsActive: true,
      })
      .returning('*');

    const user = inserted as IUser;

    // If registering as a Student, create a placeholder Students row
    if (data.role === 'Student') {
      await trx('Students').insert({ UserID: user.UserID });
    }

    return user;
  });

  const token = generateToken(result.UserID, result.Role);

  return {
    token,
    user: {
      id: result.UserID,
      fullName: result.FullName,
      email: result.Email,
      role: result.Role,
    },
  };
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthError('Invalid email or password.');
  }

  if (!user.IsActive) {
    throw new AuthError('Account is deactivated. Please contact admin.');
  }

  const isMatch = await bcrypt.compare(password, user.PasswordHash);
  if (!isMatch) {
    throw new AuthError('Invalid email or password.');
  }

  const token = generateToken(user.UserID, user.Role);

  return {
    token,
    user: {
      id: user.UserID,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
    },
  };
}

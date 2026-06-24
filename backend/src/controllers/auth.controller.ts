import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput,
} from '../validators/auth.validator';
import { ValidationError } from '../utils/errors';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new ValidationError(messages);
    }

    const data: RegisterInput = parsed.data;
    const result = await registerUser(data);

    sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new ValidationError(messages);
    }

    const data: LoginInput = parsed.data;
    const result = await loginUser(data.email, data.password);

    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

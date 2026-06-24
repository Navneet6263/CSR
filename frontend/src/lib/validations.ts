import { LoginCredentials, RegisterData } from '@/types';

export type ValidationErrors = Record<string, string>;

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'Phone number is required';
  const re = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
  if (!re.test(phone.replace(/\s/g, ''))) return 'Enter a valid Indian phone number';
  return null;
}

export function validateLoginForm(data: LoginCredentials): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  if (!data.password) errors.password = 'Password is required';
  return errors;
}

export function validateRegisterForm(data: RegisterData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.fullName?.trim()) errors.fullName = 'Full name is required';
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;
  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!data.role) errors.role = 'Please select a role';
  return errors;
}

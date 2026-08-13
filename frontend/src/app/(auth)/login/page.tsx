import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login | Shikshavritti',
  description: 'Sign in to the Shikshavritti Scholarship Management System',
};

export default function LoginPage() {
  return <LoginForm />;
}

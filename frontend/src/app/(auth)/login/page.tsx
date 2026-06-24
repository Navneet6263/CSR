import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login | TalentBridge',
  description: 'Sign in to TalentBridge Scholarship Management System',
};

export default function LoginPage() {
  return <LoginForm />;
}

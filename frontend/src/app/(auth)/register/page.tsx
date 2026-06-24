import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | TalentBridge',
  description: 'Create an account on TalentBridge Scholarship Management System',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

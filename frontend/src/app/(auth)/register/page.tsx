import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | Shikshavritti',
  description: 'Create an account on the Shikshavritti Scholarship Management System',
};

export default function RegisterPage() {
  return <RegisterForm />;
}

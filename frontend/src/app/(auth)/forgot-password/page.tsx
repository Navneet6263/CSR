import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | TalentBridge',
  description: 'Reset your TalentBridge account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

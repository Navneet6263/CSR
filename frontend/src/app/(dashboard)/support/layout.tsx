import type { ReactNode } from 'react';
import { SupportShell } from '@/components/support/SupportShell';

export default function SupportLayout({ children }: { children: ReactNode }) {
  return <SupportShell>{children}</SupportShell>;
}

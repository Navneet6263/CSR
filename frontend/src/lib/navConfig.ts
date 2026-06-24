import type { NavItem } from '@/types';

export const navByRole: Record<string, NavItem[]> = {
  Student: [
    { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
    { label: 'Profile', href: '/student/profile', icon: 'User' },
  ],
  Agent: [
    { label: 'Dashboard', href: '/agent', icon: 'LayoutDashboard' },
    { label: 'My Students', href: '/agent/students', icon: 'Users' },
  ],
  DocReviewer: [
    { label: 'Audit Queue', href: '/reviewer', icon: 'FileText' },
  ],
  BGCheckOfficer: [
    { label: 'Background Checks', href: '/officer', icon: 'Shield' },
  ],
  ScreeningOfficer: [
    { label: 'Screening', href: '/screener', icon: 'ClipboardList' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Scholarships', href: '/admin/scholarships', icon: 'GraduationCap' },
    { label: 'Funnel Analysis', href: '/admin/funnel', icon: 'BarChart3' },
    { label: 'Reports', href: '/admin/reports', icon: 'FileText' },
  ],
  Finance: [
    { label: 'Dashboard', href: '/finance', icon: 'LayoutDashboard' },
  ],
  CSRPartner: [
    { label: 'Dashboard', href: '/csr', icon: 'LayoutDashboard' },
  ],
};

export const roleHomePath: Record<string, string> = {
  Student: '/student',
  Agent: '/agent',
  DocReviewer: '/reviewer',
  BGCheckOfficer: '/officer',
  ScreeningOfficer: '/screener',
  Admin: '/admin',
  Finance: '/finance',
  CSRPartner: '/csr',
};

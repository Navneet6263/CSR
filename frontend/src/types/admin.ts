export type StaffRole = 'Finance' | 'CSRPartner' | 'DocReviewer' | 'BGCheckOfficer' | 'ScreeningOfficer' | 'SupportAgent';

export interface StaffUser {
  userId: number; fullName: string; email: string; role: StaffRole; isActive: boolean;
  financeFunction?: 'Maker' | 'Checker';
  mustChangePassword: boolean; createdAt: string; sponsorName?: string;
  totalFund?: number; fundAllocated?: number; fundUtilized?: number;
}

export interface IssuedCredentials { email: string; temporaryPassword: string }

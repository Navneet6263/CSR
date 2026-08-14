export type ScholarshipCategory = 'General' | 'Merit' | 'STEM' | 'Women' | 'Rural'
  | 'Arts' | 'Need-based' | 'Minority';

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  category: ScholarshipCategory;
  tags: string[];
  description: string;
  logoUrl?: string;
  status: string;
  pauseReason?: string;
  resumeAt?: string;
  publishPauseNotice?: boolean;
}

export interface MatchResult {
  matched: boolean;
  score: number;
  reasons: string[];
  blockers: string[];
}

export const scholarshipCategories: ScholarshipCategory[] = [
  'General', 'Merit', 'STEM', 'Women', 'Rural', 'Arts', 'Need-based', 'Minority',
];

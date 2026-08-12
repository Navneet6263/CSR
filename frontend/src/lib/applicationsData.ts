export interface TimelineEvent {
  key: string;
  label: string;
  status: 'complete' | 'current' | 'pending' | 'rejected';
  date?: string;
  note?: string;
}

export interface AppDocument {
  name: string;
  status: 'verified' | 'pending' | 'rejected';
  reason?: string;
}

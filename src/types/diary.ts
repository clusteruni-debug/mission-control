export interface DiarySession {
  index: string;
  tool?: string;
  model?: string;
  task: string;
  project: string;
  resultLines: string[];
  next?: string;
  status: 'Complete' | 'Monitoring';
}

export interface DiaryDay {
  date: string;
  sessionCount: number;
  sessions: DiarySession[];
  projectSummary: Record<string, number>;
}

export interface DiaryResult {
  days: DiaryDay[];
  scannedAt: string;
}

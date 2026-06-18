export type ClueCategory = 'queue' | 'parking' | 'fraud' | 'service' | 'weather';

export type ClueStatus = 'verifying' | 'contacted' | 'attention' | 'unhandled';

export interface ScenicSpot {
  id: string;
  name: string;
  todayVisitors: number;
  todayClues: number;
  unhandledCount: number;
}

export interface VideoClue {
  id: string;
  scenicId: string;
  scenicName: string;
  title: string;
  category: ClueCategory;
  publishTime: string;
  publishLocation: string;
  likes: number;
  comments: number;
  shares: number;
  complains: string[];
  status: ClueStatus;
  photos: string[];
  createdAt: string;
  operator: string;
  description: string;
}

export interface ReplyTemplate {
  id: string;
  category: 'explain' | 'apologize' | 'guide';
  title: string;
  content: string;
}

export interface StatusUpdateLog {
  status: ClueStatus;
  operator: string;
  updatedAt: string;
  note: string;
}

export interface PatrolRecord {
  id: string;
  clueId: string;
  clueTitle: string;
  scenicName: string;
  category: ClueCategory;
  status: ClueStatus;
  operator: string;
  createdAt: string;
  note: string;
  lastUpdatedAt: string;
  updateHistory: StatusUpdateLog[];
}

export interface DailyReport {
  date: string;
  totalClues: number;
  handledClues: number;
  unhandledClues: number;
  hotVideos: VideoClue[];
  repeatedProblems: { category: ClueCategory; count: number; keywords: string[] }[];
  scenicStats: { scenicName: string; clueCount: number }[];
}

export interface UpsertRecordParams {
  clueId: string;
  clueTitle: string;
  scenicName: string;
  category: ClueCategory;
  status: ClueStatus;
  operator: string;
  note: string;
}

export interface AppState {
  currentScenicId: string;
  clues: VideoClue[];
  records: PatrolRecord[];
  setCurrentScenicId: (id: string) => void;
  updateClueStatus: (id: string, status: ClueStatus, operator?: string) => void;
  addPhotoToClue: (id: string, photoUrl: string) => void;
  addRecord: (record: PatrolRecord) => void;
  upsertRecord: (params: UpsertRecordParams) => void;
  resetAllData: () => void;
}

export const CATEGORY_LABELS: Record<ClueCategory, string> = {
  queue: '排队',
  parking: '停车',
  fraud: '宰客',
  service: '服务态度',
  weather: '突发天气'
};

export const CATEGORY_COLORS: Record<ClueCategory, string> = {
  queue: '#8B5CF6',
  parking: '#06B6D4',
  fraud: '#F97316',
  service: '#EC4899',
  weather: '#14B8A6'
};

export const STATUS_LABELS: Record<ClueStatus, string> = {
  verifying: '核实中',
  contacted: '已联系景区',
  attention: '需领导关注',
  unhandled: '待处理'
};

export const STATUS_COLORS: Record<ClueStatus, string> = {
  verifying: '#F59E0B',
  contacted: '#10B981',
  attention: '#EF4444',
  unhandled: '#9CA3AF'
};

export const REPLY_CATEGORY_LABELS: Record<'explain' | 'apologize' | 'guide', string> = {
  explain: '解释说明',
  apologize: '道歉安抚',
  guide: '引导投诉渠道'
};

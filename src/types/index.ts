export type FindingCategory = 
  | 'CRITICAL'
  | 'ACTION_REQUIRED'
  | 'DECISION_CHANGED'
  | 'UNANSWERED_QUESTION'
  | 'IMPORTANT_INFO'
  | 'POTENTIAL_RISK';

export type PriorityLevel = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ConfidenceType = 'CONFIRMED' | 'INFERRED' | 'SUGGESTED';

export interface ParsedMessage {
  id: string;
  speaker: string;
  timestamp?: string;
  content: string;
  rawText: string;
  lineIndex: number;
}

export interface Finding {
  id: string;
  analysisId?: string;
  category: FindingCategory;
  title: string;
  description: string;
  priority: PriorityLevel;
  confidence: ConfidenceType;
  relevantPerson?: string;
  deadline?: string;
  sourceMessage: string;
  sourceMessageId?: string;
  sourceTimestamp?: string;
  sourceLineIndex?: number;
  suggestedNextStep?: string;
  resolved?: boolean;
}

export interface DecisionChange {
  id: string;
  topic: string;
  previousDecision: string;
  latestDecision: string;
  changeSummary: string;
  previousMessage: string;
  latestMessage: string;
  previousMessageId?: string;
  latestMessageId?: string;
  confidence: ConfidenceType;
}

export interface TaskItem {
  id: string;
  analysisId?: string;
  title: string;
  assignedTo: string;
  isUserObligation: boolean;
  deadline?: string;
  priority: PriorityLevel;
  completed: boolean;
  sourceMessage: string;
  sourceMessageId?: string;
  createdAt: string;
}

export interface RiskConsequence {
  id: string;
  title: string;
  explanation: string;
  riskLevel: PriorityLevel;
  connectedFindings: string[];
  supportingMessages: string[];
  recommendedAction: string;
  isPossibility: true; // All inferred risks are labeled as possibilities
}

export interface ReminderItem {
  id: string;
  userId?: string;
  taskId?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  priority: PriorityLevel;
  relatedConversation?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'SNOOZED';
  createdAt: string;
}

export interface VaultItem {
  id: string;
  userId?: string;
  title: string;
  category: 'NOTE' | 'FINDING' | 'SUMMARY';
  content: string;
  encryptedContent?: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  title: string;
  userName?: string;
  summary: string;
  date: string;
  processingMode: 'LOCAL' | 'CLOUD_AI';
  totalMessages: number;
  findings: Finding[];
  decisionChanges: DecisionChange[];
  tasks: TaskItem[];
  consequences: RiskConsequence[];
  rawText: string;
  createdAt: string;
}

export interface PosterAnalysis {
  id: string;
  title: string;
  summary: string;
  mainPurpose: string;
  highlights: string[];
  dateTimes: string[];
  location?: string;
  audience?: string;
  requiredAction?: string;
  eligibility?: string;
  contactRegistration?: string;
  missingDetails?: string[];
  simpleExplanation: string;
  nextSteps: string[];
  extractedText: string;
  imageUri?: string;
  createdAt: string;
}

export type AppTheme = 
  | 'midnight'
  | 'lavender'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'minimal';

export interface UserPreferences {
  theme: AppTheme;
  userName: string;
  reducedMotion: boolean;
  defaultProcessingMode: 'LOCAL' | 'CLOUD_AI';
  enableBrowserNotifications: boolean;
  autoLockVaultMinutes: number;
}


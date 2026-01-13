// Owner types
export interface Owner {
  id: number;
  name: string;
  color?: string;
  isActive: boolean;
}

// Bucket types
export interface Bucket {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

// Category types
export interface Category {
  id: number;
  bucketId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

// Subcategory types
export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

// Account types
export type AccountType =
  | "EVERYDAY"
  | "SAVINGS"
  | "TRANSIT"
  | "SECURITIES"
  | "INVESTMENTS"
  | "PROJECTS";

export interface Account {
  id: number;
  name: string;
  accountNumber?: string;
  type: AccountType;
  currency: string;
  balance: number;
  initialBalance: number;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
  ownerIds: number[];
  openAt: string;
  closedAt?: string;
}

// Transaction types
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type TransactionStatus = "PENDING" | "CLEARED" | "RECONCILED";

export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  type: TransactionType;
  subcategoryId?: number;
  date: string;
  description?: string;
  notes?: string;
  tags: string[];
  linkedTransactionId?: number;
  targetAccountId?: number;
  status: TransactionStatus;
  isReconciled: boolean;
}

// Staging Transaction types
export type StagingStatus = "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "IMPORTED";

export interface StagingTransaction {
  id: number;
  transactionId?: string;
  description?: string;
  amount: number;
  transactionDate: string;
  postedDate?: string;
  accountNumber?: string;
  subcategoryName?: string;
  mappedSubcategoryId?: number;
  mappedAccountId?: number;
  linkedStagingTxId?: number;
  transferGroupId?: string;
  status: StagingStatus;
  reviewNotes?: string;
  categorized: boolean;
  importedTransactionId?: number;
  importedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StagingStats {
  total: number;
  byStatus: Record<string, number>;
  unmappedAccounts: number;
  unmappedSubcategories: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  totalRows: number;
  saved: number;
  duplicates: number;
  errors: string[];
  parseErrors: number;
  saveErrors: number;
}

// Pairing types
export type PairingDecision = "ACCEPTED" | "REJECTED";

export interface PairingCandidate {
  id: number;
  leftId: number;
  rightId: number;
  score: number;
  reasons: string; // JSON string
  preselected: boolean;
  decision?: PairingDecision;
  decidedAt?: string;
  createdAt: string;
}

export interface PairingReasons {
  amountScore: number;
  dateScore: number;
  descScore: number;
  accountRelation: number;
  keywordBonus: number;
  amtDiffCents: number;
  days: number;
  ruleBonus?: number;
  ruleMatched?: boolean;
  ruleId?: string;
  ruleSubcategory?: string;
  ruleConfidence?: number;
}

export interface PairingSuggestRequest {
  dateWindowDays?: number;
  amountToleranceCents?: number;
  minScore?: number;
  topK?: number;
}

export interface PairingSuggestResult {
  success: boolean;
  message: string;
  debits: number;
  credits: number;
  pairsGenerated: number;
}

export interface PairingConfirmRequest {
  leftId: number;
  rightId: number;
}

export interface PairingConfirmResult {
  success: boolean;
  message: string;
  leftId: number;
  rightId: number;
  transferId: string;
}

// Categorization types
export type CategorizationDecision = "ACCEPTED" | "REJECTED";

export interface CategorizationCandidate {
  id: number;
  stagingTxId: number;
  suggestedSubcategoryName: string;
  score: number;
  confidence: number;
  reasons: string; // JSON string
  ruleTags?: string;
  preselected: boolean;
  decision?: CategorizationDecision;
  decidedAt?: string;
  createdAt: string;
}

export interface SimilarTransaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  subcategoryId: number;
  subcategoryName: string;
}

export interface CategorizationReasons {
  reasoning?: string;
  source?: string;
  ruleHintsUsed?: number;
  similarTransactions?: number;
  similarTransactionsList?: SimilarTransaction[];
  reasonList?: Array<{ name: string; score: number }>;
  mandatoryHits?: number;
  optionalHits?: number;
  totalMandatory?: number;
  totalOptional?: number;
  accountMatched?: boolean;
  accountPairMatched?: boolean;
  flowDirection?: string;
  ruleNames?: string[]; // V2 rule names when multiple rules match
  mergedFrom?: number; // Number of rules merged for this suggestion
  allMatches?: any[]; // All rule match details
  tieBreakerWinner?: boolean;
  tieBreakerReasoning?: string;
}

// V3 Categorization Rules
export type RuleSource = "USER_CREATED" | "LLM_GENERATED" | "LLM_AUTO_APPROVED" | "MIGRATED_FROM_V2";
export type RuleStatus = "SUGGESTED" | "APPROVED" | "ACTIVE" | "DISABLED" | "ARCHIVED";

export interface RuleMetadata {
  trainingSize: number;
  trainingDateRange?: {
    start: string;
    end: string;
  };
  exampleTransactionIds: number[];
  matchCount: number;
  correctCount: number;
  incorrectCount: number;
  precision?: number;
  conflictsWith: string[];
  llmModel?: string;
  llmReasoning?: string;
  llmConfidence?: number;
  notes?: string;
  tags: string[];
}

export interface CategorizationRuleV3 {
  id: string;
  name: string;
  subcategory: string;
  priority: number;
  confidence: number;
  type: string;
  conditions: any; // CompositeCondition - can be complex, keep as any for now
  description?: string;
  source: RuleSource;
  status: RuleStatus;
  metadata: RuleMetadata;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface RulePerformanceAnalysis {
  ruleId: string;
  ruleName: string;
  precision?: number;
  matchCount: number;
  correctCount: number;
  incorrectCount: number;
  status: RuleStatus;
  recommendation: string;
}

// API Response types
export interface ListResponse<T> {
  [key: string]: T[] | number;
  count: number;
}

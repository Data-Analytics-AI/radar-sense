// Core Entity Types for SnapFort

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'under_investigation' | 'escalated' | 'closed';
export type AlertResolution = 'fraud_confirmed' | 'false_positive' | 'legitimate' | 'pending';
export type CaseStatus = 'open' | 'in_review' | 'escalated' | 'closed';
export type CaseType = 'fraud' | 'aml' | 'mixed';
export type CasePriority = 'low' | 'medium' | 'high' | 'critical';
export type TransactionStatus = 'pending' | 'completed' | 'declined' | 'reversed';
export type TransactionType = 'credit_card' | 'wire_transfer' | 'ach' | 'mobile' | 'atm';
export type Channel = 'pos' | 'mobile' | 'web' | 'atm' | 'branch';
export type UserRole = 'admin' | 'risk_analyst' | 'compliance_officer' | 'aml_analyst' | 'auditor' | 'viewer';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  accountId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  merchantId: string;
  merchantName: string;
  merchantCategoryCode: string;
  channel: Channel;
  deviceId: string;
  ipAddress: string;
  geoLocation: GeoLocation;
  timestamp: string;
  cardNumberMasked: string;
  status: TransactionStatus;
  beneficiaryId?: string;
  beneficiaryAccount?: string;
  description: string;
  riskScore: number;
  riskLevel: RiskLevel;
  mlProbability: number;
  anomalyScore: number;
  rulesTriggered: string[];
}

export interface Alert {
  id: string;
  type: 'fraud' | 'aml' | 'graph' | 'rule' | 'model';
  transactionId: string;
  customerId: string;
  riskScore: number;
  severity: RiskLevel;
  status: AlertStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolution: AlertResolution;
  contributingFactors: string[];
  modelVersion: string;
  ruleIds: string[];
  description: string;
}

export interface Case {
  id: string;
  type: 'fraud' | 'aml' | 'mixed';
  alertIds: string[];
  transactionIds: string[];
  customerId: string;
  assignedTo?: string;
  priority: RiskLevel;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolution?: CaseResolution;
  tags: string[];
  notes: CaseNote[];
  timeline: CaseTimelineEvent[];
  linkedEntities: LinkedEntity[];
  evidence: Evidence[];
  description?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'evidence' | 'action_taken';
  mentions?: string[];
}

export type TimelineEventType = 'alert_triggered' | 'case_created' | 'assigned' | 'status_change' | 'evidence_added' | 'note_added' | 'entity_linked' | 'escalated' | 'resolution';

export interface CaseTimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export type LinkedEntityType = 'vendor' | 'employee' | 'contract' | 'invoice' | 'account' | 'customer';

export interface LinkedEntity {
  id: string;
  type: LinkedEntityType;
  name: string;
  reference: string;
  relationship: string;
  riskIndicator?: RiskLevel;
  addedBy: string;
  addedAt: string;
  notes?: string;
}

export type EvidenceSourceType = 'system_generated' | 'manual_upload' | 'external_feed';
export type EvidenceFileType = 'document' | 'screenshot' | 'transaction_log' | 'email' | 'report' | 'other';

export interface EvidenceCustodyEntry {
  action: 'uploaded' | 'viewed' | 'downloaded' | 'tagged' | 'exported';
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  fileName: string;
  fileType: EvidenceFileType;
  fileSize: number;
  mimeType: string;
  source: EvidenceSourceType;
  sourceAttribution: string;
  tags: string[];
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  custodyChain: EvidenceCustodyEntry[];
}

export interface CaseResolution {
  outcome: 'fraud_confirmed' | 'false_positive' | 'suspicious_activity_reported' | 'no_action_required' | 'referred_to_law_enforcement';
  summary: string;
  resolvedBy: string;
  resolvedAt: string;
  sarFiled?: boolean;
  sarReference?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountAge: number;
  totalTransactions: number;
  avgTransactionAmount: number;
  riskProfile: RiskLevel;
  country: string;
  occupation: string;
  isPep: boolean;
  lastActivity: string;
}

export type RuleType = 'velocity' | 'amount' | 'geographic' | 'time' | 'device' | 'blacklist' | 'entity_relationship' | 'pattern';
export type RuleCategory = 'fraud' | 'aml';
export type ConditionOperator = 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'greater_equal' | 'less_equal' | 'contains' | 'in' | 'not_in' | 'between';
export type ConditionField = 'amount' | 'risk_score' | 'velocity_count' | 'country' | 'channel' | 'merchant_category' | 'device_id' | 'ip_address' | 'transaction_type' | 'time_hour' | 'customer_age' | 'anomaly_score';
export type LogicOperator = 'AND' | 'OR';
export type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RuleActionType = 'flag' | 'block' | 'alert' | 'escalate' | 'require_review' | 'notify';

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number;
  secondaryValue?: string | number;
  timeWindow?: { value: number; unit: 'minutes' | 'hours' | 'days' };
  entityScope?: 'customer' | 'merchant' | 'device' | 'ip' | 'account';
}

export interface RuleConditionGroup {
  id: string;
  logic: LogicOperator;
  conditions: (RuleCondition | RuleConditionGroup)[];
}

export interface RuleAction {
  type: RuleActionType;
  config?: Record<string, string>;
}

export interface RuleVersion {
  version: number;
  conditionGroup: RuleConditionGroup;
  actions: RuleAction[];
  severity: SeverityLevel;
  changedBy: string;
  changedAt: string;
  changeNote: string;
}

export interface RuleAuditEntry {
  id: string;
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'simulated' | 'version_restored';
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  category: RuleCategory;
  conditionGroup: RuleConditionGroup;
  actions: RuleAction[];
  severity: SeverityLevel;
  condition: string;
  threshold: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  triggeredCount: number;
  versions: RuleVersion[];
  auditLog: RuleAuditEntry[];
  currentVersion: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  falsePositiveRate: number;
  truePositiveRate: number;
}

export interface MLModel {
  id: string;
  name: string;
  type: 'logistic_regression' | 'random_forest' | 'xgboost' | 'isolation_forest' | 'autoencoder';
  version: string;
  trainedAt: string;
  trainingDataSize: number;
  featuresUsed: string[];
  metrics: ModelMetrics;
  isActive: boolean;
}

export interface DashboardStats {
  totalTransactions: number;
  transactionsToday: number;
  totalVolume: number;
  volumeToday: number;
  fraudDetectionRate: number;
  falsePositiveRate: number;
  openAlerts: number;
  openCases: number;
  amountSaved: number;
  avgResolutionTime: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  lastLogin: string;
  isActive: boolean;
}

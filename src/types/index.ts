// Core Entity Types for SentinelAI

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'under_investigation' | 'escalated' | 'closed';
export type AlertResolution = 'fraud_confirmed' | 'false_positive' | 'legitimate' | 'pending';
export type CaseStatus = 'open' | 'in_review' | 'resolved' | 'escalated';
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
  resolution?: string;
  tags: string[];
  notes: CaseNote[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'evidence' | 'action_taken';
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

export interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'velocity' | 'amount' | 'geographic' | 'time' | 'device' | 'blacklist';
  category: 'fraud' | 'aml';
  condition: string;
  threshold: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  triggeredCount: number;
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

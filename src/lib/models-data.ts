import type { MLModel } from '@/types';

export type ModelStage = 'production' | 'staging' | 'candidate' | 'archived' | 'retired';
export type HealthStatus = 'healthy' | 'degraded' | 'investigate';
export type ModelPurpose = 'fraud' | 'aml' | 'both';
export type ModelCategory = 'supervised' | 'anomaly';

export interface EnhancedMLModel extends MLModel {
  stage: ModelStage;
  healthStatus: HealthStatus;
  purpose: ModelPurpose;
  category: ModelCategory;
  owner: string;
  lastDeployed: string;
  dataWindow: string;
  description: string;
  limitations: string[];
  knownFailureModes: string[];
  objective: string;
  threshold: number;
  riskBandMapping: { low: [number, number]; medium: [number, number]; high: [number, number]; critical: [number, number] };
  latencyP50: number;
  latencyP95: number;
  errorRate: number;
  uptime: number;
  throughput: number;
  driftScore: number;
  alertYield: number;
  inferenceVolume: number;
  alertsGenerated: number;
  escalationRate: number;
  confirmedFraudRate: number;
  featureGroups: string[];
  primarySegments: { channels: string[]; countries: string[] };
  labelRate: number;
  approvalChain: ApprovalEntry[];
  auditLog: ModelAuditEntry[];
  versions: ModelVersionEntry[];
}

export interface ApprovalEntry {
  role: string;
  name: string;
  action: string;
  date: string;
}

export interface ModelAuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface ModelVersionEntry {
  version: string;
  stage: ModelStage;
  trainedAt: string;
  metrics: { precision: number; recall: number; f1Score: number; aucRoc: number };
}

export interface FeatureDrift {
  feature: string;
  psi: number;
  ksStatistic: number;
  status: 'stable' | 'warning' | 'critical';
}

export interface DataQualityCheck {
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface SegmentMetric {
  segment: string;
  precision: number;
  recall: number;
  f1Score: number;
  volume: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
}

export const generateEnhancedModels = (): EnhancedMLModel[] => [
  {
    id: 'MODEL-001',
    name: 'Logistic Regression Baseline',
    type: 'logistic_regression',
    version: 'v1.2.0',
    stage: 'archived',
    healthStatus: 'healthy',
    purpose: 'fraud',
    category: 'supervised',
    owner: 'Sarah Chen',
    lastDeployed: '2024-08-15T10:00:00Z',
    trainedAt: '2024-01-10T00:00:00Z',
    dataWindow: 'Oct 2023 - Dec 2023',
    trainingDataSize: 50000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_24h', 'geo_distance', 'time_of_day', 'is_new_device'],
    featureGroups: ['Transaction', 'Velocity', 'Device'],
    primarySegments: { channels: ['POS', 'Web'], countries: ['US', 'UK'] },
    labelRate: 0.032,
    description: 'Baseline logistic regression model for fraud detection. Provides interpretable coefficients for regulatory review.',
    objective: 'Establish interpretable baseline for fraud scoring with regulatory-compliant feature set.',
    limitations: ['Cannot capture non-linear feature interactions', 'Underperforms on new fraud patterns', 'Limited to tabular features only'],
    knownFailureModes: ['High FPR on international wire transfers', 'Misses velocity-based fraud rings'],
    threshold: 0.65,
    riskBandMapping: { low: [0, 0.3], medium: [0.3, 0.6], high: [0.6, 0.85], critical: [0.85, 1.0] },
    metrics: { accuracy: 0.92, precision: 0.85, recall: 0.78, f1Score: 0.81, aucRoc: 0.89, falsePositiveRate: 0.05, truePositiveRate: 0.78 },
    latencyP50: 8, latencyP95: 22, errorRate: 0.001, uptime: 99.95, throughput: 1200, driftScore: 0.08, alertYield: 0.42,
    inferenceVolume: 245000, alertsGenerated: 1890, escalationRate: 0.23, confirmedFraudRate: 0.41,
    isActive: false,
    approvalChain: [
      { role: 'ML Engineer', name: 'Sarah Chen', action: 'Trained & validated', date: '2024-01-10' },
      { role: 'Risk Lead', name: 'Michael Torres', action: 'Approved for staging', date: '2024-01-12' },
    ],
    auditLog: [
      { id: 'AUD-001', action: 'Model trained', actor: 'Sarah Chen', timestamp: '2024-01-10T09:00:00Z', details: 'Initial training with 50K samples' },
      { id: 'AUD-002', action: 'Deployed to staging', actor: 'Sarah Chen', timestamp: '2024-01-12T14:00:00Z', details: 'Passed all evaluation gates' },
      { id: 'AUD-003', action: 'Promoted to production', actor: 'Michael Torres', timestamp: '2024-01-15T10:00:00Z', details: 'Approved after 3-day staging period' },
      { id: 'AUD-004', action: 'Archived', actor: 'David Kim', timestamp: '2024-08-20T09:00:00Z', details: 'Replaced by XGBoost v2.3.1' },
    ],
    versions: [
      { version: 'v1.0.0', stage: 'retired', trainedAt: '2023-10-01', metrics: { precision: 0.80, recall: 0.72, f1Score: 0.76, aucRoc: 0.85 } },
      { version: 'v1.1.0', stage: 'retired', trainedAt: '2023-12-15', metrics: { precision: 0.83, recall: 0.75, f1Score: 0.79, aucRoc: 0.87 } },
      { version: 'v1.2.0', stage: 'archived', trainedAt: '2024-01-10', metrics: { precision: 0.85, recall: 0.78, f1Score: 0.81, aucRoc: 0.89 } },
    ],
  },
  {
    id: 'MODEL-002',
    name: 'Random Forest Classifier',
    type: 'random_forest',
    version: 'v2.1.0',
    stage: 'staging',
    healthStatus: 'healthy',
    purpose: 'fraud',
    category: 'supervised',
    owner: 'David Kim',
    lastDeployed: '2024-12-01T10:00:00Z',
    trainedAt: '2024-11-15T00:00:00Z',
    dataWindow: 'Jun 2024 - Oct 2024',
    trainingDataSize: 75000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_24h', 'geo_distance', 'time_of_day', 'is_new_device', 'merchant_risk', 'device_age', 'customer_tenure'],
    featureGroups: ['Transaction', 'Velocity', 'Device', 'Merchant', 'Customer'],
    primarySegments: { channels: ['POS', 'Web', 'Mobile'], countries: ['US', 'UK', 'DE'] },
    labelRate: 0.028,
    description: 'Ensemble random forest for fraud detection. Currently in staging for A/B comparison against production XGBoost.',
    objective: 'Improve recall on mobile channel while maintaining precision above 85%.',
    limitations: ['Higher latency than linear models', 'Requires feature engineering pipeline v2'],
    knownFailureModes: ['Elevated FPR during holiday shopping seasons', 'Reduced recall on low-value transactions (<$50)'],
    threshold: 0.60,
    riskBandMapping: { low: [0, 0.25], medium: [0.25, 0.55], high: [0.55, 0.80], critical: [0.80, 1.0] },
    metrics: { accuracy: 0.94, precision: 0.88, recall: 0.82, f1Score: 0.85, aucRoc: 0.93, falsePositiveRate: 0.04, truePositiveRate: 0.82 },
    latencyP50: 15, latencyP95: 45, errorRate: 0.002, uptime: 99.90, throughput: 850, driftScore: 0.04, alertYield: 0.51,
    inferenceVolume: 180000, alertsGenerated: 2100, escalationRate: 0.28, confirmedFraudRate: 0.48,
    isActive: false,
    approvalChain: [
      { role: 'ML Engineer', name: 'David Kim', action: 'Trained & validated', date: '2024-11-15' },
      { role: 'Risk Lead', name: 'Michael Torres', action: 'Approved for staging', date: '2024-11-18' },
    ],
    auditLog: [
      { id: 'AUD-010', action: 'Model trained', actor: 'David Kim', timestamp: '2024-11-15T11:00:00Z', details: 'Trained with expanded feature set (9 features)' },
      { id: 'AUD-011', action: 'Evaluation passed', actor: 'David Kim', timestamp: '2024-11-16T14:00:00Z', details: 'All gates passed: precision=0.88, latency_p95=45ms' },
      { id: 'AUD-012', action: 'Deployed to staging', actor: 'Michael Torres', timestamp: '2024-12-01T10:00:00Z', details: 'A/B test against XGBoost production model' },
    ],
    versions: [
      { version: 'v1.0.0', stage: 'retired', trainedAt: '2024-06-01', metrics: { precision: 0.82, recall: 0.76, f1Score: 0.79, aucRoc: 0.88 } },
      { version: 'v2.0.0', stage: 'retired', trainedAt: '2024-09-10', metrics: { precision: 0.86, recall: 0.80, f1Score: 0.83, aucRoc: 0.91 } },
      { version: 'v2.1.0', stage: 'staging', trainedAt: '2024-11-15', metrics: { precision: 0.88, recall: 0.82, f1Score: 0.85, aucRoc: 0.93 } },
    ],
  },
  {
    id: 'MODEL-003',
    name: 'XGBoost Production Model',
    type: 'xgboost',
    version: 'v2.3.1',
    stage: 'production',
    healthStatus: 'healthy',
    purpose: 'both',
    category: 'supervised',
    owner: 'David Kim',
    lastDeployed: '2024-10-05T08:00:00Z',
    trainedAt: '2024-09-20T00:00:00Z',
    dataWindow: 'Mar 2024 - Aug 2024',
    trainingDataSize: 100000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_6h', 'velocity_24h', 'geo_distance', 'time_of_day', 'day_of_week', 'is_new_device', 'is_new_ip', 'merchant_risk', 'device_age', 'customer_tenure', 'avg_amount_30d', 'stddev_amount_30d', 'channel_frequency'],
    featureGroups: ['Transaction', 'Velocity', 'Device', 'Merchant', 'Customer', 'Behavioral'],
    primarySegments: { channels: ['POS', 'Web', 'Mobile', 'ATM'], countries: ['US', 'UK', 'DE', 'FR', 'SG'] },
    labelRate: 0.025,
    description: 'Primary production model for fraud and AML scoring. Gradient-boosted trees with 15-feature pipeline.',
    objective: 'Maximize fraud detection across all channels while maintaining FPR below 4% and latency under 50ms.',
    limitations: ['Requires retraining quarterly for drift mitigation', 'Feature pipeline has 2-minute data freshness lag', 'Cannot process image-based evidence'],
    knownFailureModes: ['Elevated FPR on new merchant onboarding (first 30 days)', 'Reduced precision on cross-border mobile transactions during Asian trading hours'],
    threshold: 0.55,
    riskBandMapping: { low: [0, 0.25], medium: [0.25, 0.50], high: [0.50, 0.80], critical: [0.80, 1.0] },
    metrics: { accuracy: 0.96, precision: 0.91, recall: 0.87, f1Score: 0.89, aucRoc: 0.95, falsePositiveRate: 0.03, truePositiveRate: 0.87 },
    latencyP50: 12, latencyP95: 35, errorRate: 0.0005, uptime: 99.99, throughput: 2400, driftScore: 0.06, alertYield: 0.58,
    inferenceVolume: 520000, alertsGenerated: 4200, escalationRate: 0.31, confirmedFraudRate: 0.54,
    isActive: true,
    approvalChain: [
      { role: 'ML Engineer', name: 'David Kim', action: 'Trained & validated', date: '2024-09-20' },
      { role: 'Risk Lead', name: 'Michael Torres', action: 'Approved for staging', date: '2024-09-25' },
      { role: 'Head of Compliance', name: 'Elena Rodriguez', action: 'Production sign-off', date: '2024-10-03' },
      { role: 'CTO', name: 'James Walker', action: 'Final approval', date: '2024-10-05' },
    ],
    auditLog: [
      { id: 'AUD-020', action: 'Model trained', actor: 'David Kim', timestamp: '2024-09-20T09:00:00Z', details: 'Retrained with 6-month window, 100K samples, label rate 2.5%' },
      { id: 'AUD-021', action: 'Evaluation passed', actor: 'David Kim', timestamp: '2024-09-22T14:00:00Z', details: 'All gates passed: precision=0.91, FPR=0.03, latency_p95=35ms' },
      { id: 'AUD-022', action: 'Deployed to staging', actor: 'Michael Torres', timestamp: '2024-09-25T10:00:00Z', details: '7-day shadow mode evaluation' },
      { id: 'AUD-023', action: 'Promoted to production', actor: 'Elena Rodriguez', timestamp: '2024-10-05T08:00:00Z', details: 'Passed compliance review, replacing v2.2.0' },
      { id: 'AUD-024', action: 'Threshold adjusted', actor: 'Michael Torres', timestamp: '2024-11-12T15:00:00Z', details: 'Threshold lowered from 0.60 to 0.55 to improve recall. Reason: Missed fraud ring in APAC region.' },
      { id: 'AUD-025', action: 'Monitoring alert', actor: 'System', timestamp: '2025-01-08T03:00:00Z', details: 'Feature drift detected on velocity_6h (PSI=0.12). Within acceptable range.' },
    ],
    versions: [
      { version: 'v2.0.0', stage: 'retired', trainedAt: '2024-03-01', metrics: { precision: 0.87, recall: 0.83, f1Score: 0.85, aucRoc: 0.92 } },
      { version: 'v2.1.0', stage: 'retired', trainedAt: '2024-05-15', metrics: { precision: 0.89, recall: 0.84, f1Score: 0.86, aucRoc: 0.93 } },
      { version: 'v2.2.0', stage: 'retired', trainedAt: '2024-07-20', metrics: { precision: 0.90, recall: 0.85, f1Score: 0.87, aucRoc: 0.94 } },
      { version: 'v2.3.1', stage: 'production', trainedAt: '2024-09-20', metrics: { precision: 0.91, recall: 0.87, f1Score: 0.89, aucRoc: 0.95 } },
    ],
  },
  {
    id: 'MODEL-004',
    name: 'Isolation Forest Anomaly',
    type: 'isolation_forest',
    version: 'v1.5.0',
    stage: 'production',
    healthStatus: 'degraded',
    purpose: 'aml',
    category: 'anomaly',
    owner: 'Priya Patel',
    lastDeployed: '2024-09-01T08:00:00Z',
    trainedAt: '2024-08-18T00:00:00Z',
    dataWindow: 'Feb 2024 - Jul 2024',
    trainingDataSize: 100000,
    featuresUsed: ['amount', 'velocity_1h', 'geo_distance', 'time_of_day', 'transaction_frequency'],
    featureGroups: ['Transaction', 'Velocity', 'Temporal'],
    primarySegments: { channels: ['Web', 'Mobile'], countries: ['US', 'UK', 'SG', 'HK'] },
    labelRate: 0.015,
    description: 'Unsupervised anomaly detection for AML transaction monitoring. Flags unusual patterns without labeled training data.',
    objective: 'Detect structuring, layering, and unusual transaction patterns for AML compliance.',
    limitations: ['Higher false positive rate by design (anomaly model)', 'Cannot distinguish fraud types', 'Sensitive to seasonal volume changes'],
    knownFailureModes: ['Spikes in FPR during month-end payroll processing', 'Misses low-value structuring below $500'],
    threshold: 0.70,
    riskBandMapping: { low: [0, 0.35], medium: [0.35, 0.65], high: [0.65, 0.85], critical: [0.85, 1.0] },
    metrics: { accuracy: 0.88, precision: 0.75, recall: 0.92, f1Score: 0.83, aucRoc: 0.90, falsePositiveRate: 0.08, truePositiveRate: 0.92 },
    latencyP50: 18, latencyP95: 55, errorRate: 0.003, uptime: 99.85, throughput: 600, driftScore: 0.15, alertYield: 0.35,
    inferenceVolume: 310000, alertsGenerated: 5800, escalationRate: 0.18, confirmedFraudRate: 0.31,
    isActive: true,
    approvalChain: [
      { role: 'ML Engineer', name: 'Priya Patel', action: 'Trained & validated', date: '2024-08-18' },
      { role: 'AML Lead', name: 'Robert Chang', action: 'Approved for staging', date: '2024-08-22' },
      { role: 'Head of Compliance', name: 'Elena Rodriguez', action: 'Production sign-off', date: '2024-09-01' },
    ],
    auditLog: [
      { id: 'AUD-030', action: 'Model trained', actor: 'Priya Patel', timestamp: '2024-08-18T11:00:00Z', details: 'Retrained with 6-month unsupervised window' },
      { id: 'AUD-031', action: 'Deployed to production', actor: 'Elena Rodriguez', timestamp: '2024-09-01T08:00:00Z', details: 'Replacing v1.4.0' },
      { id: 'AUD-032', action: 'Health degraded', actor: 'System', timestamp: '2025-01-15T06:00:00Z', details: 'Feature drift PSI=0.15 on velocity_1h. FPR increased to 8%. Investigation recommended.' },
    ],
    versions: [
      { version: 'v1.3.0', stage: 'retired', trainedAt: '2024-04-01', metrics: { precision: 0.71, recall: 0.88, f1Score: 0.79, aucRoc: 0.87 } },
      { version: 'v1.4.0', stage: 'retired', trainedAt: '2024-06-15', metrics: { precision: 0.73, recall: 0.90, f1Score: 0.81, aucRoc: 0.89 } },
      { version: 'v1.5.0', stage: 'production', trainedAt: '2024-08-18', metrics: { precision: 0.75, recall: 0.92, f1Score: 0.83, aucRoc: 0.90 } },
    ],
  },
  {
    id: 'MODEL-005',
    name: 'Neural Network Ensemble',
    type: 'autoencoder',
    version: 'v1.0.0-rc1',
    stage: 'candidate',
    healthStatus: 'healthy',
    purpose: 'both',
    category: 'supervised',
    owner: 'Sarah Chen',
    lastDeployed: '',
    trainedAt: '2025-01-05T00:00:00Z',
    dataWindow: 'Jul 2024 - Dec 2024',
    trainingDataSize: 150000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_6h', 'velocity_24h', 'geo_distance', 'time_of_day', 'day_of_week', 'is_new_device', 'is_new_ip', 'merchant_risk', 'device_age', 'customer_tenure', 'avg_amount_30d', 'stddev_amount_30d', 'channel_frequency', 'embedding_merchant', 'embedding_device', 'behavioral_sequence'],
    featureGroups: ['Transaction', 'Velocity', 'Device', 'Merchant', 'Customer', 'Behavioral', 'Embeddings'],
    primarySegments: { channels: ['POS', 'Web', 'Mobile', 'ATM'], countries: ['US', 'UK', 'DE', 'FR', 'SG', 'JP'] },
    labelRate: 0.022,
    description: 'Next-generation autoencoder ensemble combining supervised and unsupervised signals. Candidate for production evaluation.',
    objective: 'Achieve best-in-class detection across all channels with sub-30ms latency using neural embeddings.',
    limitations: ['Requires GPU inference infrastructure', 'Less interpretable than tree-based models', 'Higher compute cost per inference'],
    knownFailureModes: ['Under evaluation - failure modes not yet characterized'],
    threshold: 0.50,
    riskBandMapping: { low: [0, 0.20], medium: [0.20, 0.45], high: [0.45, 0.75], critical: [0.75, 1.0] },
    metrics: { accuracy: 0.97, precision: 0.93, recall: 0.90, f1Score: 0.91, aucRoc: 0.97, falsePositiveRate: 0.025, truePositiveRate: 0.90 },
    latencyP50: 20, latencyP95: 48, errorRate: 0.004, uptime: 99.70, throughput: 1800, driftScore: 0.02, alertYield: 0.62,
    inferenceVolume: 0, alertsGenerated: 0, escalationRate: 0, confirmedFraudRate: 0,
    isActive: false,
    approvalChain: [
      { role: 'ML Engineer', name: 'Sarah Chen', action: 'Trained & validated', date: '2025-01-05' },
    ],
    auditLog: [
      { id: 'AUD-040', action: 'Model trained', actor: 'Sarah Chen', timestamp: '2025-01-05T09:00:00Z', details: 'Trained with 150K samples, 18 features including neural embeddings' },
      { id: 'AUD-041', action: 'Candidate registered', actor: 'Sarah Chen', timestamp: '2025-01-06T14:00:00Z', details: 'Registered as candidate for staging evaluation' },
    ],
    versions: [
      { version: 'v1.0.0-rc1', stage: 'candidate', trainedAt: '2025-01-05', metrics: { precision: 0.93, recall: 0.90, f1Score: 0.91, aucRoc: 0.97 } },
    ],
  },
];

export const generateFeatureDrift = (): FeatureDrift[] => [
  { feature: 'velocity_1h', psi: 0.15, ksStatistic: 0.12, status: 'warning' },
  { feature: 'amount', psi: 0.04, ksStatistic: 0.03, status: 'stable' },
  { feature: 'geo_distance', psi: 0.08, ksStatistic: 0.06, status: 'stable' },
  { feature: 'merchant_risk', psi: 0.22, ksStatistic: 0.18, status: 'critical' },
  { feature: 'device_age', psi: 0.06, ksStatistic: 0.05, status: 'stable' },
  { feature: 'is_new_device', psi: 0.03, ksStatistic: 0.02, status: 'stable' },
  { feature: 'velocity_24h', psi: 0.11, ksStatistic: 0.09, status: 'warning' },
  { feature: 'customer_tenure', psi: 0.02, ksStatistic: 0.01, status: 'stable' },
  { feature: 'channel_frequency', psi: 0.09, ksStatistic: 0.07, status: 'stable' },
  { feature: 'time_of_day', psi: 0.05, ksStatistic: 0.04, status: 'stable' },
];

export const generateDataQualityChecks = (): DataQualityCheck[] => [
  { metric: 'Missingness %', value: 0.8, threshold: 2.0, status: 'pass' },
  { metric: 'Schema violations', value: 3, threshold: 10, status: 'pass' },
  { metric: 'Out-of-range values', value: 12, threshold: 50, status: 'pass' },
  { metric: 'Delayed events (>5min)', value: 45, threshold: 100, status: 'warning' },
  { metric: 'Ingestion lag (sec)', value: 8.2, threshold: 30, status: 'pass' },
  { metric: 'Duplicate records', value: 0.01, threshold: 0.1, status: 'pass' },
];

export const generateConfusionMatrix = (): ConfusionMatrix => ({
  truePositive: 4350,
  falsePositive: 430,
  trueNegative: 94120,
  falseNegative: 600,
});

export const generateDetectionTrend = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      detections: Math.floor(120 + Math.random() * 60 + (i < 7 ? 20 : 0)),
      falsePositives: Math.floor(15 + Math.random() * 15 + (i < 3 ? 8 : 0)),
    });
  }
  return data;
};

export const generateLossTrend = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  return months.map((m) => ({
    month: m,
    prevented: Math.floor(180000 + Math.random() * 120000),
    actual: Math.floor(12000 + Math.random() * 18000),
  }));
};

export const generateScoreDistribution = () => {
  return [
    { band: 'Low (0-0.25)', count: 62400, pct: 62.4 },
    { band: 'Medium (0.25-0.50)', count: 22300, pct: 22.3 },
    { band: 'High (0.50-0.80)', count: 11800, pct: 11.8 },
    { band: 'Critical (0.80-1.0)', count: 3500, pct: 3.5 },
  ];
};

export const generatePrecisionRecallCurve = () => {
  const points = [];
  for (let t = 0; t <= 100; t += 5) {
    const threshold = t / 100;
    const precision = 0.5 + 0.45 * (1 - Math.exp(-3 * threshold));
    const recall = 0.98 * Math.exp(-1.5 * threshold);
    points.push({ threshold: threshold.toFixed(2), precision: +precision.toFixed(3), recall: +recall.toFixed(3) });
  }
  return points;
};

export const generateFeatureImportance = (modelId: string): FeatureImportance[] => {
  const importances: Record<string, FeatureImportance[]> = {
    'MODEL-003': [
      { feature: 'velocity_6h', importance: 0.18, direction: 'positive' },
      { feature: 'amount', importance: 0.15, direction: 'positive' },
      { feature: 'geo_distance', importance: 0.13, direction: 'positive' },
      { feature: 'merchant_risk', importance: 0.11, direction: 'positive' },
      { feature: 'is_new_device', importance: 0.09, direction: 'positive' },
      { feature: 'velocity_24h', importance: 0.08, direction: 'positive' },
      { feature: 'is_new_ip', importance: 0.07, direction: 'positive' },
      { feature: 'customer_tenure', importance: 0.06, direction: 'negative' },
      { feature: 'device_age', importance: 0.05, direction: 'negative' },
      { feature: 'channel_frequency', importance: 0.04, direction: 'positive' },
    ],
    default: [
      { feature: 'amount', importance: 0.22, direction: 'positive' },
      { feature: 'velocity_1h', importance: 0.18, direction: 'positive' },
      { feature: 'geo_distance', importance: 0.15, direction: 'positive' },
      { feature: 'time_of_day', importance: 0.12, direction: 'positive' },
      { feature: 'is_new_device', importance: 0.10, direction: 'positive' },
      { feature: 'velocity_24h', importance: 0.08, direction: 'positive' },
      { feature: 'customer_tenure', importance: 0.07, direction: 'negative' },
      { feature: 'device_age', importance: 0.05, direction: 'negative' },
    ],
  };
  return importances[modelId] || importances.default;
};

export const generateSegmentMetrics = (): SegmentMetric[] => [
  { segment: 'POS - US', precision: 0.93, recall: 0.89, f1Score: 0.91, volume: 145000 },
  { segment: 'Web - US', precision: 0.90, recall: 0.86, f1Score: 0.88, volume: 98000 },
  { segment: 'Mobile - US', precision: 0.88, recall: 0.84, f1Score: 0.86, volume: 87000 },
  { segment: 'POS - UK', precision: 0.91, recall: 0.87, f1Score: 0.89, volume: 62000 },
  { segment: 'Web - UK', precision: 0.89, recall: 0.85, f1Score: 0.87, volume: 45000 },
  { segment: 'Mobile - Cross-border', precision: 0.82, recall: 0.78, f1Score: 0.80, volume: 34000 },
  { segment: 'ATM - All', precision: 0.92, recall: 0.88, f1Score: 0.90, volume: 28000 },
  { segment: 'Wire Transfer', precision: 0.85, recall: 0.81, f1Score: 0.83, volume: 21000 },
];

export const generateStabilityTrend = () => {
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    weeks.push({
      week: `W${12 - i}`,
      confidence: +(0.88 + Math.random() * 0.08).toFixed(3),
      calibration: +(0.95 + Math.random() * 0.04 - 0.02).toFixed(3),
    });
  }
  return weeks;
};

export const generateInferenceByChannel = () => [
  { channel: 'POS', volume: 185000, pct: 35.6 },
  { channel: 'Web', volume: 143000, pct: 27.5 },
  { channel: 'Mobile', volume: 121000, pct: 23.3 },
  { channel: 'ATM', volume: 42000, pct: 8.1 },
  { channel: 'Wire', volume: 29000, pct: 5.5 },
];

export const getWhatChangedInsights = (): string[] => [
  'Merchant risk signal drift detected: PSI=0.22 (critical). Likely due to new merchant onboarding wave in APAC.',
  'Velocity-based features showing elevated drift on 1h window. Correlated with holiday transaction surge.',
  'Mobile cross-border segment FPR increased from 6.2% to 8.1% in last 48 hours.',
  'Isolation Forest model health degraded: ingestion lag spiked to 45 events above 5-min threshold.',
  'Neural Network Ensemble candidate shows 4% improvement in AUC over current production model.',
];

export type UserRoleForModels = 'admin' | 'ml_engineer' | 'risk_analyst' | 'auditor';

export const canPromote = (role: UserRoleForModels) => role === 'admin';
export const canRollback = (role: UserRoleForModels) => role === 'admin';
export const canRetrain = (role: UserRoleForModels) => role === 'admin' || role === 'ml_engineer';
export const canEditThreshold = (role: UserRoleForModels) => role === 'admin';
export const canViewMonitoring = (role: UserRoleForModels) => role !== 'auditor';
export const canViewGovernance = (_role: UserRoleForModels) => true;
export const canViewExplainability = (role: UserRoleForModels) => role !== 'auditor';
export const canCompareModels = (role: UserRoleForModels) => role !== 'auditor';

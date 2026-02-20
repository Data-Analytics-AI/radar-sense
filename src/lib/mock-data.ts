import { 
  Transaction, 
  Alert, 
  Case, 
  Customer, 
  Rule, 
  RuleConditionGroup,
  MLModel, 
  DashboardStats,
  TimeSeriesData,
  RiskLevel,
  TransactionType,
  Channel
} from '@/types';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate merchants
const merchants = [
  { id: 'M001', name: 'Amazon', mcc: '5411' },
  { id: 'M002', name: 'Walmart', mcc: '5411' },
  { id: 'M003', name: 'Shell Gas Station', mcc: '5541' },
  { id: 'M004', name: 'Starbucks', mcc: '5812' },
  { id: 'M005', name: 'Apple Store', mcc: '5732' },
  { id: 'M006', name: 'Netflix', mcc: '4899' },
  { id: 'M007', name: 'Uber', mcc: '4121' },
  { id: 'M008', name: 'Hotel Grand Hyatt', mcc: '7011' },
  { id: 'M009', name: 'Casino Royale', mcc: '7995' },
  { id: 'M010', name: 'Western Union', mcc: '6051' },
];

const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Nigeria', 'Russia', 'China', 'Brazil'];
const cities = ['New York', 'Los Angeles', 'London', 'Berlin', 'Paris', 'Tokyo', 'Lagos', 'Moscow', 'Beijing', 'São Paulo'];

const transactionTypes: TransactionType[] = ['credit_card', 'wire_transfer', 'ach', 'mobile', 'atm'];
const channels: Channel[] = ['pos', 'mobile', 'web', 'atm', 'branch'];

const riskReasons = [
  'Transaction amount 5.2x higher than customer average',
  'New device detected (never seen before)',
  'Geographic location unusual for this customer',
  'Transaction occurred at 3:15 AM, outside normal hours',
  'Velocity: 8 transactions in last 2 hours (vs. avg 2/day)',
  'Merchant on high-risk watchlist',
  'Rapid fund movement pattern detected',
  'Transaction just below reporting threshold',
  'IP address from VPN/proxy service',
  'Card testing pattern detected',
  'Beneficiary in high-risk jurisdiction',
  'Dormant account sudden reactivation'
];

// Generate random risk score
const generateRiskScore = (): { score: number; level: RiskLevel; mlProbability: number; anomalyScore: number } => {
  const rand = Math.random();
  let score: number;
  let level: RiskLevel;
  
  if (rand < 0.6) {
    score = randomRange(0, 25);
    level = 'low';
  } else if (rand < 0.8) {
    score = randomRange(26, 50);
    level = 'medium';
  } else if (rand < 0.95) {
    score = randomRange(51, 75);
    level = 'high';
  } else {
    score = randomRange(76, 100);
    level = 'critical';
  }
  
  return {
    score,
    level,
    mlProbability: Math.min(0.99, score / 100 + (Math.random() * 0.1 - 0.05)),
    anomalyScore: Math.min(1, score / 100 + (Math.random() * 0.2 - 0.1))
  };
};

// Generate transactions
export const generateTransactions = (count: number = 100): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const merchant = randomItem(merchants);
    const risk = generateRiskScore();
    const countryIndex = randomRange(0, countries.length - 1);
    const timestamp = new Date(now.getTime() - randomRange(0, 7 * 24 * 60 * 60 * 1000));
    
    const rulesTriggered: string[] = [];
    if (risk.level !== 'low') {
      const numRules = randomRange(1, 4);
      for (let j = 0; j < numRules; j++) {
        rulesTriggered.push(randomItem(riskReasons));
      }
    }
    
    transactions.push({
      id: `TXN-${generateId().toUpperCase()}`,
      customerId: `CUST-${randomRange(1000, 9999)}`,
      accountId: `ACC-${randomRange(100000, 999999)}`,
      amount: parseFloat((Math.random() * 10000 + 10).toFixed(2)),
      currency: 'USD',
      type: randomItem(transactionTypes),
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantCategoryCode: merchant.mcc,
      channel: randomItem(channels),
      deviceId: `DEV-${generateId()}`,
      ipAddress: `${randomRange(1, 255)}.${randomRange(1, 255)}.${randomRange(1, 255)}.${randomRange(1, 255)}`,
      geoLocation: {
        latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
        longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
        country: countries[countryIndex],
        city: cities[countryIndex]
      },
      timestamp: timestamp.toISOString(),
      cardNumberMasked: `****${randomRange(1000, 9999)}`,
      status: randomItem(['completed', 'completed', 'completed', 'pending', 'declined']),
      description: `Payment to ${merchant.name}`,
      riskScore: risk.score,
      riskLevel: risk.level,
      mlProbability: risk.mlProbability,
      anomalyScore: risk.anomalyScore,
      rulesTriggered
    });
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate alerts
export const generateAlerts = (transactions: Transaction[]): Alert[] => {
  const alerts: Alert[] = [];
  const alertableTransactions = transactions.filter(t => t.riskLevel !== 'low');
  
  alertableTransactions.slice(0, 50).forEach(t => {
    alerts.push({
      id: `ALT-${generateId().toUpperCase()}`,
      type: randomItem(['fraud', 'aml', 'rule', 'model']),
      transactionId: t.id,
      customerId: t.customerId,
      riskScore: t.riskScore,
      severity: t.riskLevel,
      status: randomItem(['open', 'open', 'open', 'under_investigation', 'escalated', 'closed']),
      assignedTo: Math.random() > 0.3 ? `analyst-${randomRange(1, 5)}` : undefined,
      createdAt: t.timestamp,
      updatedAt: new Date().toISOString(),
      resolution: 'pending',
      contributingFactors: t.rulesTriggered,
      modelVersion: 'v2.3.1',
      ruleIds: [`RULE-${randomRange(1, 20)}`],
      description: `${t.riskLevel.toUpperCase()} risk transaction detected: ${t.description}`
    });
  });
  
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Generate cases
export const generateCases = (alerts: Alert[]): Case[] => {
  const cases: Case[] = [];
  const groupedAlerts = new Map<string, Alert[]>();
  
  alerts.forEach(a => {
    const existing = groupedAlerts.get(a.customerId) || [];
    existing.push(a);
    groupedAlerts.set(a.customerId, existing);
  });
  
  let caseCount = 0;
  groupedAlerts.forEach((customerAlerts, customerId) => {
    if (customerAlerts.length >= 2 && caseCount < 20) {
      cases.push({
        id: `CASE-${generateId().toUpperCase()}`,
        type: randomItem(['fraud', 'aml', 'mixed']),
        alertIds: customerAlerts.slice(0, 5).map(a => a.id),
        transactionIds: customerAlerts.slice(0, 5).map(a => a.transactionId),
        customerId,
        assignedTo: `analyst-${randomRange(1, 5)}`,
        priority: randomItem(['medium', 'high', 'critical']),
        status: randomItem(['open', 'in_review', 'resolved']),
        createdAt: customerAlerts[0].createdAt,
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + randomRange(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        tags: randomItem([['velocity', 'high-amount'], ['geographic', 'new-device'], ['structuring', 'aml']]),
        notes: []
      });
      caseCount++;
    }
  });

  if (cases.length === 0) {
    const fallbackAlerts = alerts.slice(0, Math.min(alerts.length, 10));
    const statuses: Array<'open' | 'in_review' | 'resolved' | 'escalated'> = ['open', 'in_review', 'escalated', 'resolved', 'open'];
    const types: Array<'fraud' | 'aml' | 'mixed'> = ['fraud', 'aml', 'mixed', 'fraud', 'aml'];
    const priorities: RiskLevel[] = ['critical', 'high', 'medium', 'high', 'critical'];
    const tagSets = [
      ['velocity', 'high-amount'],
      ['geographic', 'new-device'],
      ['structuring', 'aml'],
      ['card-testing', 'bot-detected'],
      ['cross-border', 'pep-linked']
    ];

    for (let i = 0; i < 5; i++) {
      const alert = fallbackAlerts[i % fallbackAlerts.length];
      cases.push({
        id: `CASE-${(1001 + i).toString()}`,
        type: types[i],
        alertIds: alert ? [alert.id] : [`ALR-FALLBACK-${i}`],
        transactionIds: alert ? [alert.transactionId] : [`TXN-FALLBACK-${i}`],
        customerId: alert?.customerId || `CUST-${randomRange(1000, 9999)}`,
        assignedTo: `analyst-${i + 1}`,
        priority: priorities[i],
        status: statuses[i],
        createdAt: new Date(Date.now() - randomRange(1, 14) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + randomRange(1, 7) * 24 * 60 * 60 * 1000).toISOString(),
        tags: tagSets[i],
        notes: []
      });
    }
  }
  
  return cases;
};

// Generate customers
export const generateCustomers = (count: number = 50): Customer[] => {
  const customers: Customer[] = [];
  const occupations = ['Software Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Student', 'Retired', 'Lawyer', 'Accountant'];
  
  for (let i = 0; i < count; i++) {
    const countryIndex = randomRange(0, countries.length - 1);
    customers.push({
      id: `CUST-${randomRange(1000, 9999)}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+1-${randomRange(100, 999)}-${randomRange(100, 999)}-${randomRange(1000, 9999)}`,
      accountAge: randomRange(1, 120),
      totalTransactions: randomRange(10, 500),
      avgTransactionAmount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
      riskProfile: randomItem(['low', 'low', 'low', 'medium', 'high']),
      country: countries[countryIndex],
      occupation: randomItem(occupations),
      isPep: Math.random() < 0.05,
      lastActivity: new Date(Date.now() - randomRange(0, 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return customers;
};

export const generateRules = (): Rule[] => [
  {
    id: 'RULE-001',
    name: 'High Amount Single Transaction',
    description: 'Flag transactions exceeding $10,000 from any channel',
    type: 'amount',
    category: 'fraud',
    condition: 'amount > 10000',
    threshold: 10000,
    priority: 1,
    isActive: true,
    severity: 'high',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-11-20T00:00:00Z',
    triggeredCount: 245,
    currentVersion: 2,
    conditionGroup: {
      id: 'cg-001',
      logic: 'AND',
      conditions: [
        { id: 'c-001-1', field: 'amount', operator: 'greater_than', value: 10000 },
        { id: 'c-001-2', field: 'risk_score', operator: 'greater_equal', value: 30 }
      ]
    },
    actions: [
      { type: 'flag' },
      { type: 'alert', config: { team: 'fraud-ops' } }
    ],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-001-v1', logic: 'AND', conditions: [{ id: 'c-v1-1', field: 'amount', operator: 'greater_than', value: 10000 }] }, actions: [{ type: 'flag' }], severity: 'medium', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial rule creation' },
      { version: 2, conditionGroup: { id: 'cg-001', logic: 'AND', conditions: [{ id: 'c-001-1', field: 'amount', operator: 'greater_than', value: 10000 }, { id: 'c-001-2', field: 'risk_score', operator: 'greater_equal', value: 30 }] }, actions: [{ type: 'flag' }, { type: 'alert', config: { team: 'fraud-ops' } }], severity: 'high', changedBy: 'analyst-1', changedAt: '2025-11-20T00:00:00Z', changeNote: 'Added risk score threshold and alert action' }
    ],
    auditLog: [
      { id: 'a-001-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'Rule created with amount > $10,000 condition' },
      { id: 'a-001-2', action: 'updated', performedBy: 'analyst-1', timestamp: '2025-11-20T00:00:00Z', details: 'Added risk score condition and alert action' }
    ]
  },
  {
    id: 'RULE-002',
    name: 'Velocity Check - Hourly',
    description: 'More than 5 transactions from same customer in 1 hour',
    type: 'velocity',
    category: 'fraud',
    condition: 'velocity_count > 5 within 1h',
    threshold: 5,
    priority: 2,
    isActive: true,
    severity: 'medium',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    triggeredCount: 156,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-002',
      logic: 'AND',
      conditions: [
        { id: 'c-002-1', field: 'velocity_count', operator: 'greater_than', value: 5, timeWindow: { value: 1, unit: 'hours' }, entityScope: 'customer' }
      ]
    },
    actions: [{ type: 'flag' }, { type: 'require_review' }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-002', logic: 'AND', conditions: [{ id: 'c-002-1', field: 'velocity_count', operator: 'greater_than', value: 5, timeWindow: { value: 1, unit: 'hours' }, entityScope: 'customer' }] }, actions: [{ type: 'flag' }, { type: 'require_review' }], severity: 'medium', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial creation' }
    ],
    auditLog: [
      { id: 'a-002-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'Velocity check rule created' }
    ]
  },
  {
    id: 'RULE-003',
    name: 'Impossible Travel',
    description: 'Transactions from distant locations within short time window',
    type: 'geographic',
    category: 'fraud',
    condition: 'country != last_country AND time_diff < 1h',
    threshold: 500,
    priority: 1,
    isActive: true,
    severity: 'critical',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
    triggeredCount: 34,
    currentVersion: 2,
    conditionGroup: {
      id: 'cg-003',
      logic: 'AND',
      conditions: [
        { id: 'cg-003-nested', logic: 'OR', conditions: [
          { id: 'c-003-1', field: 'country', operator: 'not_equals', value: 'last_country' },
          { id: 'c-003-2', field: 'ip_address', operator: 'not_equals', value: 'last_ip' }
        ] } satisfies RuleConditionGroup,
        { id: 'c-003-3', field: 'amount', operator: 'greater_than', value: 500 }
      ]
    },
    actions: [{ type: 'block' }, { type: 'alert', config: { team: 'fraud-ops' } }, { type: 'escalate' }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-003-v1', logic: 'AND', conditions: [{ id: 'c-003-v1-1', field: 'country', operator: 'not_equals', value: 'last_country' }] }, actions: [{ type: 'flag' }], severity: 'high', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial rule' },
      { version: 2, conditionGroup: { id: 'cg-003', logic: 'AND', conditions: [{ id: 'cg-003-nested', logic: 'OR' as const, conditions: [{ id: 'c-003-1', field: 'country', operator: 'not_equals', value: 'last_country' }, { id: 'c-003-2', field: 'ip_address', operator: 'not_equals', value: 'last_ip' }] }, { id: 'c-003-3', field: 'amount', operator: 'greater_than', value: 500 }] }, actions: [{ type: 'block' }, { type: 'alert', config: { team: 'fraud-ops' } }, { type: 'escalate' }], severity: 'critical', changedBy: 'analyst-2', changedAt: '2024-06-10T00:00:00Z', changeNote: 'Added IP check and block action' }
    ],
    auditLog: [
      { id: 'a-003-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'Impossible travel rule created' },
      { id: 'a-003-2', action: 'updated', performedBy: 'analyst-2', timestamp: '2024-06-10T00:00:00Z', details: 'Enhanced with IP address check and block action' },
      { id: 'a-003-3', action: 'simulated', performedBy: 'analyst-2', timestamp: '2024-06-09T00:00:00Z', details: 'Simulation run: 34 hits in 10,000 transactions (0.34% hit rate)' }
    ]
  },
  {
    id: 'RULE-004',
    name: 'Structuring Detection',
    description: 'Multiple transactions just below $10,000 reporting threshold',
    type: 'amount',
    category: 'aml',
    condition: 'amount BETWEEN 9000 AND 10000 AND count > 3 in 24h',
    threshold: 3,
    priority: 1,
    isActive: true,
    severity: 'critical',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    triggeredCount: 89,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-004',
      logic: 'AND',
      conditions: [
        { id: 'c-004-1', field: 'amount', operator: 'between', value: 9000, secondaryValue: 10000 },
        { id: 'c-004-2', field: 'velocity_count', operator: 'greater_than', value: 3, timeWindow: { value: 24, unit: 'hours' }, entityScope: 'customer' }
      ]
    },
    actions: [{ type: 'flag' }, { type: 'escalate' }, { type: 'notify', config: { team: 'aml-compliance' } }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-004', logic: 'AND', conditions: [{ id: 'c-004-1', field: 'amount', operator: 'between', value: 9000, secondaryValue: 10000 }, { id: 'c-004-2', field: 'velocity_count', operator: 'greater_than', value: 3, timeWindow: { value: 24, unit: 'hours' }, entityScope: 'customer' }] }, actions: [{ type: 'flag' }, { type: 'escalate' }, { type: 'notify', config: { team: 'aml-compliance' } }], severity: 'critical', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial structuring detection rule' }
    ],
    auditLog: [
      { id: 'a-004-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'AML structuring detection rule created' }
    ]
  },
  {
    id: 'RULE-005',
    name: 'High-Risk Country',
    description: 'Transaction originating from FATF high-risk jurisdiction',
    type: 'geographic',
    category: 'aml',
    condition: 'country IN high_risk_countries',
    threshold: 0,
    priority: 2,
    isActive: true,
    severity: 'medium',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    triggeredCount: 178,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-005',
      logic: 'AND',
      conditions: [
        { id: 'c-005-1', field: 'country', operator: 'in', value: 'Iran,North Korea,Myanmar,Syria' }
      ]
    },
    actions: [{ type: 'flag' }, { type: 'require_review' }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-005', logic: 'AND', conditions: [{ id: 'c-005-1', field: 'country', operator: 'in', value: 'Iran,North Korea,Myanmar,Syria' }] }, actions: [{ type: 'flag' }, { type: 'require_review' }], severity: 'medium', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial creation' }
    ],
    auditLog: [
      { id: 'a-005-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'High-risk country rule created' }
    ]
  },
  {
    id: 'RULE-006',
    name: 'New Device + High Amount',
    description: 'Transaction from unrecognized device exceeding $5,000',
    type: 'device',
    category: 'fraud',
    condition: 'is_new_device AND amount > 5000',
    threshold: 5000,
    priority: 1,
    isActive: true,
    severity: 'high',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    triggeredCount: 67,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-006',
      logic: 'AND',
      conditions: [
        { id: 'c-006-1', field: 'device_id', operator: 'equals', value: 'new_device' },
        { id: 'c-006-2', field: 'amount', operator: 'greater_than', value: 5000 }
      ]
    },
    actions: [{ type: 'flag' }, { type: 'alert', config: { team: 'fraud-ops' } }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-006', logic: 'AND', conditions: [{ id: 'c-006-1', field: 'device_id', operator: 'equals', value: 'new_device' }, { id: 'c-006-2', field: 'amount', operator: 'greater_than', value: 5000 }] }, actions: [{ type: 'flag' }, { type: 'alert', config: { team: 'fraud-ops' } }], severity: 'high', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial creation' }
    ],
    auditLog: [
      { id: 'a-006-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'New device high amount rule created' }
    ]
  },
  {
    id: 'RULE-007',
    name: 'After Hours High-Value',
    description: 'High-value transaction between 2 AM and 5 AM local time',
    type: 'time',
    category: 'fraud',
    condition: 'time_hour BETWEEN 2 AND 5 AND amount > 1000',
    threshold: 1000,
    priority: 3,
    isActive: false,
    severity: 'low',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    triggeredCount: 123,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-007',
      logic: 'AND',
      conditions: [
        { id: 'c-007-1', field: 'time_hour', operator: 'between', value: 2, secondaryValue: 5 },
        { id: 'c-007-2', field: 'amount', operator: 'greater_than', value: 1000 }
      ]
    },
    actions: [{ type: 'flag' }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-007', logic: 'AND', conditions: [{ id: 'c-007-1', field: 'time_hour', operator: 'between', value: 2, secondaryValue: 5 }, { id: 'c-007-2', field: 'amount', operator: 'greater_than', value: 1000 }] }, actions: [{ type: 'flag' }], severity: 'low', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial creation' }
    ],
    auditLog: [
      { id: 'a-007-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'After hours rule created' },
      { id: 'a-007-2', action: 'deactivated', performedBy: 'analyst-3', timestamp: '2025-08-01T00:00:00Z', details: 'Disabled due to high false positive rate' }
    ]
  },
  {
    id: 'RULE-008',
    name: 'Rapid Fund Movement',
    description: 'Large inbound followed by rapid outbound within 30 minutes',
    type: 'velocity',
    category: 'aml',
    condition: 'velocity_count > 2 within 30m AND amount > 5000',
    threshold: 0.9,
    priority: 1,
    isActive: true,
    severity: 'critical',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    triggeredCount: 45,
    currentVersion: 1,
    conditionGroup: {
      id: 'cg-008',
      logic: 'AND',
      conditions: [
        { id: 'c-008-1', field: 'velocity_count', operator: 'greater_than', value: 2, timeWindow: { value: 30, unit: 'minutes' }, entityScope: 'account' },
        { id: 'c-008-2', field: 'amount', operator: 'greater_than', value: 5000 }
      ]
    },
    actions: [{ type: 'block' }, { type: 'escalate' }, { type: 'notify', config: { team: 'aml-compliance' } }],
    versions: [
      { version: 1, conditionGroup: { id: 'cg-008', logic: 'AND', conditions: [{ id: 'c-008-1', field: 'velocity_count', operator: 'greater_than', value: 2, timeWindow: { value: 30, unit: 'minutes' }, entityScope: 'account' }, { id: 'c-008-2', field: 'amount', operator: 'greater_than', value: 5000 }] }, actions: [{ type: 'block' }, { type: 'escalate' }, { type: 'notify', config: { team: 'aml-compliance' } }], severity: 'critical', changedBy: 'admin', changedAt: '2024-01-15T00:00:00Z', changeNote: 'Initial rapid fund movement rule' }
    ],
    auditLog: [
      { id: 'a-008-1', action: 'created', performedBy: 'admin', timestamp: '2024-01-15T00:00:00Z', details: 'Rapid fund movement rule created' }
    ]
  }
];

// Generate ML models
export const generateModels = (): MLModel[] => [
  {
    id: 'MODEL-001',
    name: 'Logistic Regression Baseline',
    type: 'logistic_regression',
    version: 'v1.2.0',
    trainedAt: '2024-01-10T00:00:00Z',
    trainingDataSize: 50000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_24h', 'geo_distance', 'time_of_day', 'is_new_device'],
    metrics: {
      accuracy: 0.92,
      precision: 0.85,
      recall: 0.78,
      f1Score: 0.81,
      aucRoc: 0.89,
      falsePositiveRate: 0.05,
      truePositiveRate: 0.78
    },
    isActive: false
  },
  {
    id: 'MODEL-002',
    name: 'Random Forest Classifier',
    type: 'random_forest',
    version: 'v2.1.0',
    trainedAt: '2024-01-15T00:00:00Z',
    trainingDataSize: 75000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_24h', 'geo_distance', 'time_of_day', 'is_new_device', 'merchant_risk', 'device_age', 'customer_tenure'],
    metrics: {
      accuracy: 0.94,
      precision: 0.88,
      recall: 0.82,
      f1Score: 0.85,
      aucRoc: 0.93,
      falsePositiveRate: 0.04,
      truePositiveRate: 0.82
    },
    isActive: false
  },
  {
    id: 'MODEL-003',
    name: 'XGBoost Production Model',
    type: 'xgboost',
    version: 'v2.3.1',
    trainedAt: '2024-01-20T00:00:00Z',
    trainingDataSize: 100000,
    featuresUsed: ['amount', 'velocity_1h', 'velocity_6h', 'velocity_24h', 'geo_distance', 'time_of_day', 'day_of_week', 'is_new_device', 'is_new_ip', 'merchant_risk', 'device_age', 'customer_tenure', 'avg_amount_30d', 'stddev_amount_30d', 'channel_frequency'],
    metrics: {
      accuracy: 0.96,
      precision: 0.91,
      recall: 0.87,
      f1Score: 0.89,
      aucRoc: 0.95,
      falsePositiveRate: 0.03,
      truePositiveRate: 0.87
    },
    isActive: true
  },
  {
    id: 'MODEL-004',
    name: 'Isolation Forest Anomaly',
    type: 'isolation_forest',
    version: 'v1.5.0',
    trainedAt: '2024-01-18T00:00:00Z',
    trainingDataSize: 100000,
    featuresUsed: ['amount', 'velocity_1h', 'geo_distance', 'time_of_day', 'transaction_frequency'],
    metrics: {
      accuracy: 0.88,
      precision: 0.75,
      recall: 0.92,
      f1Score: 0.83,
      aucRoc: 0.90,
      falsePositiveRate: 0.08,
      truePositiveRate: 0.92
    },
    isActive: true
  }
];

// Generate dashboard stats
export const generateDashboardStats = (): DashboardStats => ({
  totalTransactions: 1247893,
  transactionsToday: 3456,
  totalVolume: 45678901234,
  volumeToday: 12567890,
  fraudDetectionRate: 94.5,
  falsePositiveRate: 3.2,
  openAlerts: 47,
  openCases: 12,
  amountSaved: 2345678,
  avgResolutionTime: 4.5
});

// Generate time series data for charts
export const generateTimeSeriesData = (days: number = 7, metric: 'transactions' | 'volume' | 'fraud_rate' | 'alerts'): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    let value: number;
    
    switch (metric) {
      case 'transactions':
        value = randomRange(2500, 4000);
        break;
      case 'volume':
        value = randomRange(8000000, 15000000);
        break;
      case 'fraud_rate':
        value = parseFloat((Math.random() * 2 + 2).toFixed(2));
        break;
      case 'alerts':
        value = randomRange(30, 80);
        break;
      default:
        value = randomRange(100, 500);
    }
    
    data.push({
      timestamp: date.toISOString(),
      value,
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  
  return data;
};

// Generate hourly data for intraday charts
export const generateHourlyData = (hours: number = 24): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: date.toISOString(),
      value: randomRange(100, 250),
      label: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  }
  
  return data;
};

// Distribution data
export const getRiskDistribution = (): { name: string; value: number; color: string }[] => [
  { name: 'Low', value: 60, color: 'hsl(var(--risk-low))' },
  { name: 'Medium', value: 25, color: 'hsl(var(--risk-medium))' },
  { name: 'High', value: 10, color: 'hsl(var(--risk-high))' },
  { name: 'Critical', value: 5, color: 'hsl(var(--risk-critical))' }
];

export const getChannelDistribution = (): { name: string; value: number }[] => [
  { name: 'POS', value: 35 },
  { name: 'Mobile', value: 28 },
  { name: 'Web', value: 22 },
  { name: 'ATM', value: 10 },
  { name: 'Branch', value: 5 }
];

// Initialize all mock data
export const initializeMockData = () => {
  const transactions = generateTransactions(200);
  const alerts = generateAlerts(transactions);
  const cases = generateCases(alerts);
  const customers = generateCustomers(50);
  const rules = generateRules();
  const models = generateModels();
  const stats = generateDashboardStats();
  
  return {
    transactions,
    alerts,
    cases,
    customers,
    rules,
    models,
    stats
  };
};

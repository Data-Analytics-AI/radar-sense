export interface AnalyticsFilters {
  timeRange: '24h' | '7d' | '30d' | '90d';
  channel: 'all' | 'pos' | 'web' | 'mobile' | 'atm' | 'branch';
  country: 'all' | string;
}

interface KPI { value: number | string; delta: number; definition: string }

export interface AnalyticsData {
  executive: {
    insights: { severity: 'info' | 'warning' | 'critical'; text: string; metric: string; evidence: string }[];
    recommendedActions: { text: string; linkTo: string; priority: 'high' | 'medium' | 'low' }[];
  };
  fraud: {
    detectionRate: KPI; preventedValue: KPI; confirmedLoss: KPI; falsePositiveRate: KPI; avgTimeToDetect: KPI; avgTimeToContain: KPI;
    fraudTrend: { month: string; detected: number; prevented: number; actualLoss: number }[];
    alertFunnel: { flagged: number; reviewed: number; escalated: number; confirmedFraud: number; sarFiled: number };
    topTypologies: { name: string; count: number; value: number; trend: number }[];
    topDriverRules: { name: string; confirmedFraud: number; triggers: number }[];
    riskyMerchants: { id: string; name: string; riskScore: number; volume: number; confirmedFraud: number; country: string }[];
    riskyCustomers: { id: string; name: string; riskScore: number; flags: string[]; linkedCases: number }[];
    riskyDevices: { id: string; type: string; trustLevel: number; geoMismatch: boolean; lastSeen: string }[];
  };
  aml: {
    alertCount: KPI; escalations: KPI; sarsFiled: KPI; avgEscalationTime: KPI; structuringCount: KPI; sanctionsHits: KPI;
    amlTrend: { month: string; alerts: number; escalations: number; sarsFiled: number }[];
    typologyDistribution: { name: string; count: number; percentage: number }[];
    sarPipeline: { drafted: number; reviewed: number; approved: number; filed: number };
    highRiskCustomers: { id: string; name: string; riskScore: number; typologyTags: string[]; exposure: number }[];
    counterpartyRisk: { id: string; name: string; exposure: number; country: string; riskLevel: string }[];
  };
  models: {
    precision: KPI; recall: KPI; f1: KPI; auc: KPI; featureDrift: KPI; predictionDrift: KPI; dataQuality: KPI; latencyP50: KPI; latencyP95: KPI; modelVersion: KPI;
    performanceComparison: { name: string; precision: number; recall: number; f1: number; auc: number }[];
    driftTrend: { month: string; featureDrift: number; predictionDrift: number }[];
    scoreDistribution: { bucket: string; count: number }[];
    confusionMatrix: { tp: number; fp: number; tn: number; fn: number };
  };
  rules: {
    totalTriggers: KPI; confirmedFraudRate: KPI; noiseRate: KPI; avgTimeToReview: KPI; lastTunedDate: KPI;
    rulesTable: { id: string; name: string; category: string; triggerCount: number; trueFraudPct: number; noisePct: number; netValuePrevented: number; lastUpdated: string; status: string; triggerTrend: number[] }[];
  };
  geography: {
    countries: { code: string; name: string; txnVolume: number; alertRate: number; fraudRate: number; amlRiskScore: number; topMerchant: string; topChannel: string }[];
    geoAnomalies: { ipMismatchRate: number; impossibleTravel: number; firstSeenCountry: number };
  };
  channels: {
    channelVolume: { name: string; volume: number; risk: number; alertsPer1k: number; falsePositiveRate: number }[];
    channelRiskTrend: { month: string; pos: number; web: number; mobile: number; atm: number; branch: number }[];
    channelFunnel: { name: string; flagged: number; reviewed: number; confirmed: number }[];
  };
  users: {
    totalUsers: KPI; activeUsers: KPI; privilegedUsers: KPI; mfaAdoption: KPI; ssoAdoption: KPI; failedLogins24h: KPI; lockedUsers: KPI;
    loginsTrend: { month: string; logins: number }[];
    failedLoginsTrend: { month: string; failed: number }[];
    analystProductivity: { name: string; casesHandled: number; avgReviewTime: number; slaBreaches: number }[];
    unusualAccess: { userId: string; name: string; pattern: string; exports: number; unusualTime: boolean; lastAction: string }[];
    roleDistribution: { role: string; count: number }[];
  };
  operations: {
    openAlerts: KPI; openCases: KPI; slaBreachRisk: KPI; avgTimeToTriage: KPI; avgTimeToResolution: KPI; backlogTrend: KPI;
    backlogTrendData: { month: string; alerts: number; cases: number }[];
    slaComplianceTrend: { month: string; compliance: number }[];
    caseAging: { bucket: string; count: number }[];
    oldestCases: { id: string; title: string; age: number; assignee: string; priority: string }[];
    teamQueues: { team: string; open: number; inReview: number; breached: number }[];
  };
  audit: {
    auditEvents: { id: string; timestamp: string; user: string; action: string; target: string; details: string; correlationId: string; immutable: boolean }[];
  };
}

const months12 = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

const timeMultiplier: Record<string, number> = { '24h': 0.035, '7d': 0.25, '30d': 1, '90d': 3 };

export function getAnalyticsData(filters: AnalyticsFilters): AnalyticsData {
  const tm = timeMultiplier[filters.timeRange] || 1;
  const s = (v: number) => Math.round(v * tm);

  return {
    executive: {
      insights: [
        { severity: 'critical', text: 'ATM fraud attempts surged 23% WoW, concentrated in Eastern Europe corridors.', metric: '+23% ATM fraud', evidence: '1,247 flagged ATM transactions across 6 countries in 7 days' },
        { severity: 'warning', text: 'XGBoost model prediction drift exceeded 3.2% threshold for cross-border web transactions.', metric: '3.2% drift', evidence: 'Feature importance shift detected in merchant_category and geo_velocity features' },
        { severity: 'info', text: 'SAR filing rate improved 12% after rule R-017 tuning last month.', metric: '-12% SAR backlog', evidence: 'Average SAR cycle time reduced from 4.2 to 3.7 days' },
        { severity: 'warning', text: 'False positive rate for mobile channel rose to 18.4%, impacting analyst throughput.', metric: '18.4% FP rate', evidence: '342 mobile alerts closed as false positives in the past 30 days' },
      ],
      recommendedActions: [
        { text: 'Retrain XGBoost model on latest ATM fraud patterns', linkTo: '/models', priority: 'high' },
        { text: 'Review and tune high-risk country rule thresholds (R-005)', linkTo: '/rules', priority: 'high' },
        { text: 'Investigate 3 merchants with >40% chargeback rate', linkTo: '/alerts', priority: 'medium' },
        { text: 'Schedule quarterly AML typology review with compliance team', linkTo: '/cases', priority: 'low' },
      ],
    },

    fraud: {
      detectionRate: { value: 94.7, delta: 2.3, definition: 'Percentage of confirmed fraud caught by the system before customer report' },
      preventedValue: { value: '$4.2M', delta: 18.5, definition: 'Total dollar value of transactions blocked or reversed before settlement' },
      confirmedLoss: { value: '$312K', delta: -8.1, definition: 'Net fraud losses after recovery efforts' },
      falsePositiveRate: { value: 14.2, delta: -3.4, definition: 'Percentage of alerts that were confirmed as legitimate transactions' },
      avgTimeToDetect: { value: '2.4 min', delta: -15.0, definition: 'Average time from transaction initiation to fraud alert generation' },
      avgTimeToContain: { value: '18 min', delta: -22.0, definition: 'Average time from alert to account freeze or transaction block' },
      fraudTrend: months12.map((month, i) => ({
        month,
        detected: [210, 228, 245, 267, 289, 312, 278, 298, 321, 335, 310, 342][i],
        prevented: [198, 218, 234, 256, 281, 305, 273, 294, 315, 329, 304, 337][i],
        actualLoss: [145000, 132000, 120000, 98000, 78000, 65000, 52000, 41000, 38000, 35000, 31000, 28000][i],
      })),
      alertFunnel: { flagged: s(4820), reviewed: s(3654), escalated: s(1287), confirmedFraud: s(892), sarFiled: s(156) },
      topTypologies: [
        { name: 'Card-Not-Present Fraud', count: s(1245), value: 2340000, trend: 12 },
        { name: 'Account Takeover', count: s(867), value: 1890000, trend: 8 },
        { name: 'Synthetic Identity', count: s(423), value: 1250000, trend: 24 },
        { name: 'Card Skimming', count: s(312), value: 780000, trend: -5 },
        { name: 'Friendly Fraud', count: s(198), value: 456000, trend: 3 },
      ],
      topDriverRules: [
        { name: 'R-001 High Amount Single Txn', confirmedFraud: 78, triggers: s(245) },
        { name: 'R-003 Impossible Travel', confirmedFraud: 91, triggers: s(34) },
        { name: 'R-006 New Device + High Amount', confirmedFraud: 82, triggers: s(67) },
        { name: 'R-008 Rapid Fund Movement', confirmedFraud: 88, triggers: s(45) },
        { name: 'R-002 Velocity Check', confirmedFraud: 65, triggers: s(156) },
      ],
      riskyMerchants: [
        { id: 'MERCH-4401', name: 'QuickCash Exchange', riskScore: 92, volume: s(12400), confirmedFraud: 47, country: 'Nigeria' },
        { id: 'MERCH-3287', name: 'GlobalPay Services', riskScore: 87, volume: s(8900), confirmedFraud: 34, country: 'Russia' },
        { id: 'MERCH-5512', name: 'FastTransfer Ltd', riskScore: 81, volume: s(15600), confirmedFraud: 28, country: 'China' },
        { id: 'MERCH-2198', name: 'CryptoMart Exchange', riskScore: 78, volume: s(6700), confirmedFraud: 22, country: 'Brazil' },
        { id: 'MERCH-6634', name: 'ElectroDeals Online', riskScore: 73, volume: s(21300), confirmedFraud: 19, country: 'United Kingdom' },
      ],
      riskyCustomers: [
        { id: 'CUST-8812', name: 'Alexei Volkov', riskScore: 95, flags: ['velocity_anomaly', 'geo_mismatch', 'new_device'], linkedCases: 3 },
        { id: 'CUST-7734', name: 'Chen Wei', riskScore: 89, flags: ['structuring', 'high_value_transfer'], linkedCases: 2 },
        { id: 'CUST-6621', name: 'Fatima Al-Rashid', riskScore: 84, flags: ['pep_linked', 'cross_border'], linkedCases: 2 },
        { id: 'CUST-5509', name: 'Roberto Santos', riskScore: 79, flags: ['dormant_reactivation', 'rapid_fund_movement'], linkedCases: 1 },
      ],
      riskyDevices: [
        { id: 'DEV-a3f8c1', type: 'Android (rooted)', trustLevel: 12, geoMismatch: true, lastSeen: '2026-02-19T14:23:00Z' },
        { id: 'DEV-b7d2e4', type: 'iOS (jailbroken)', trustLevel: 18, geoMismatch: true, lastSeen: '2026-02-20T08:45:00Z' },
        { id: 'DEV-c9a1f6', type: 'Windows (VM detected)', trustLevel: 25, geoMismatch: false, lastSeen: '2026-02-18T22:10:00Z' },
        { id: 'DEV-d4b3e8', type: 'Linux (TOR exit node)', trustLevel: 8, geoMismatch: true, lastSeen: '2026-02-20T03:12:00Z' },
      ],
    },

    aml: {
      alertCount: { value: s(1847), delta: 6.2, definition: 'Total AML alerts generated in the selected period' },
      escalations: { value: s(423), delta: 11.8, definition: 'Alerts escalated to compliance for further review' },
      sarsFiled: { value: s(89), delta: -4.3, definition: 'Suspicious Activity Reports filed with FinCEN' },
      avgEscalationTime: { value: '5.8h', delta: -15.2, definition: 'Average time from alert to escalation decision' },
      structuringCount: { value: s(234), delta: 18.7, definition: 'Transactions flagged for potential structuring activity' },
      sanctionsHits: { value: s(12), delta: -25.0, definition: 'Matches against OFAC, EU, and UN sanctions lists' },
      amlTrend: months12.map((month, i) => ({
        month,
        alerts: [145, 152, 167, 178, 189, 201, 187, 195, 212, 223, 198, 214][i],
        escalations: [32, 35, 41, 44, 48, 52, 45, 49, 55, 58, 51, 56][i],
        sarsFiled: [6, 7, 8, 9, 7, 11, 8, 9, 10, 12, 8, 11][i],
      })),
      typologyDistribution: [
        { name: 'Structuring / Smurfing', count: s(234), percentage: 28.4 },
        { name: 'Layering', count: s(187), percentage: 22.7 },
        { name: 'Trade-Based ML', count: s(145), percentage: 17.6 },
        { name: 'Shell Company Activity', count: s(98), percentage: 11.9 },
        { name: 'Sanctions Evasion', count: s(67), percentage: 8.1 },
        { name: 'Corruption / PEP', count: s(52), percentage: 6.3 },
        { name: 'Other', count: s(41), percentage: 5.0 },
      ],
      sarPipeline: { drafted: s(23), reviewed: s(18), approved: s(14), filed: s(89) },
      highRiskCustomers: [
        { id: 'CUST-9901', name: 'Meridian Holdings Ltd', riskScore: 96, typologyTags: ['shell_company', 'layering', 'sanctions_risk'], exposure: 4500000 },
        { id: 'CUST-9234', name: 'Oleg Petrov', riskScore: 93, typologyTags: ['structuring', 'pep_linked'], exposure: 2800000 },
        { id: 'CUST-8876', name: 'Pacific Rim Trading Co', riskScore: 89, typologyTags: ['trade_based_ml', 'over_invoicing'], exposure: 6200000 },
        { id: 'CUST-8512', name: 'Amara Diallo', riskScore: 85, typologyTags: ['corruption', 'pep'], exposure: 1900000 },
        { id: 'CUST-8103', name: 'Nordic Capital Solutions', riskScore: 82, typologyTags: ['layering', 'shell_company'], exposure: 3400000 },
      ],
      counterpartyRisk: [
        { id: 'CP-2201', name: 'Vostok Financial Services', exposure: 8900000, country: 'Russia', riskLevel: 'critical' },
        { id: 'CP-2302', name: 'Dragon Gate Imports', exposure: 5600000, country: 'China', riskLevel: 'high' },
        { id: 'CP-2403', name: 'Sahara Trade Finance', exposure: 3200000, country: 'Nigeria', riskLevel: 'high' },
        { id: 'CP-2504', name: 'Andean Mining Corp', exposure: 2100000, country: 'Colombia', riskLevel: 'medium' },
      ],
    },

    models: {
      precision: { value: 91.3, delta: 1.2, definition: 'Fraction of positive predictions that were actually fraud' },
      recall: { value: 87.6, delta: 2.8, definition: 'Fraction of actual fraud cases that the model detected' },
      f1: { value: 89.4, delta: 2.0, definition: 'Harmonic mean of precision and recall' },
      auc: { value: 95.1, delta: 0.8, definition: 'Area Under the ROC Curve measuring overall discrimination ability' },
      featureDrift: { value: 2.1, delta: 0.4, definition: 'Population Stability Index measuring input feature distribution shift' },
      predictionDrift: { value: 1.8, delta: 0.3, definition: 'Shift in model prediction distribution vs. training baseline' },
      dataQuality: { value: 99.2, delta: 0.1, definition: 'Percentage of input features passing completeness and validity checks' },
      latencyP50: { value: '12ms', delta: -8.0, definition: 'Median model inference time per transaction' },
      latencyP95: { value: '45ms', delta: -5.0, definition: '95th percentile model inference time' },
      modelVersion: { value: 'v2.3.1', delta: 0, definition: 'Currently deployed model version' },
      performanceComparison: [
        { name: 'Logistic Regression', precision: 85.2, recall: 78.4, f1: 81.6, auc: 89.1 },
        { name: 'Random Forest', precision: 88.1, recall: 82.3, f1: 85.1, auc: 92.7 },
        { name: 'XGBoost (Active)', precision: 91.3, recall: 87.6, f1: 89.4, auc: 95.1 },
        { name: 'Isolation Forest', precision: 79.8, recall: 91.2, f1: 85.1, auc: 90.4 },
      ],
      driftTrend: months12.map((month, i) => ({
        month,
        featureDrift: [1.2, 1.4, 1.3, 1.6, 1.5, 1.8, 1.7, 1.9, 2.0, 2.3, 2.1, 2.1][i],
        predictionDrift: [0.8, 0.9, 1.0, 1.1, 1.0, 1.3, 1.2, 1.4, 1.5, 1.7, 1.6, 1.8][i],
      })),
      scoreDistribution: [
        { bucket: '0-10', count: 42150 }, { bucket: '10-20', count: 18340 }, { bucket: '20-30', count: 8920 },
        { bucket: '30-40', count: 4560 }, { bucket: '40-50', count: 2890 }, { bucket: '50-60', count: 1870 },
        { bucket: '60-70', count: 1240 }, { bucket: '70-80', count: 780 }, { bucket: '80-90', count: 420 },
        { bucket: '90-100', count: 210 },
      ],
      confusionMatrix: { tp: 4231, fp: 402, tn: 89234, fn: 587 },
    },

    rules: {
      totalTriggers: { value: s(8934), delta: 5.7, definition: 'Total rule trigger events across all active rules' },
      confirmedFraudRate: { value: 68.4, delta: 3.2, definition: 'Percentage of rule triggers that resulted in confirmed fraud' },
      noiseRate: { value: 31.6, delta: -3.2, definition: 'Percentage of rule triggers that were false positives' },
      avgTimeToReview: { value: '34 min', delta: -12.5, definition: 'Average time for analysts to review a rule-triggered alert' },
      lastTunedDate: { value: '2026-02-14', delta: 0, definition: 'Date of most recent rule tuning cycle' },
      rulesTable: [
        { id: 'R-001', name: 'High Amount Single Txn', category: 'fraud', triggerCount: s(245), trueFraudPct: 78, noisePct: 22, netValuePrevented: 1245000, lastUpdated: '2026-02-17', status: 'active', triggerTrend: [18, 22, 25, 28, 24, 30, 27, 32, 29, 35, 31, 34] },
        { id: 'R-002', name: 'Velocity Check', category: 'fraud', triggerCount: s(156), trueFraudPct: 65, noisePct: 35, netValuePrevented: 890000, lastUpdated: '2026-02-10', status: 'active', triggerTrend: [12, 14, 16, 15, 18, 17, 20, 19, 22, 21, 24, 23] },
        { id: 'R-003', name: 'Impossible Travel', category: 'fraud', triggerCount: s(34), trueFraudPct: 91, noisePct: 9, netValuePrevented: 567000, lastUpdated: '2026-02-18', status: 'active', triggerTrend: [2, 3, 2, 4, 3, 5, 4, 3, 5, 4, 6, 5] },
        { id: 'R-004', name: 'Structuring Detection', category: 'aml', triggerCount: s(89), trueFraudPct: 72, noisePct: 28, netValuePrevented: 2340000, lastUpdated: '2026-02-15', status: 'active', triggerTrend: [6, 7, 8, 9, 7, 10, 8, 11, 9, 12, 10, 11] },
        { id: 'R-005', name: 'High-Risk Country', category: 'fraud', triggerCount: s(178), trueFraudPct: 45, noisePct: 55, netValuePrevented: 456000, lastUpdated: '2026-02-19', status: 'active', triggerTrend: [14, 16, 15, 18, 17, 20, 19, 22, 21, 24, 23, 26] },
        { id: 'R-006', name: 'New Device + High Amount', category: 'fraud', triggerCount: s(67), trueFraudPct: 82, noisePct: 18, netValuePrevented: 723000, lastUpdated: '2026-02-16', status: 'active', triggerTrend: [4, 5, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9] },
        { id: 'R-007', name: 'After Hours Activity', category: 'fraud', triggerCount: s(123), trueFraudPct: 38, noisePct: 62, netValuePrevented: 234000, lastUpdated: '2026-02-14', status: 'under_review', triggerTrend: [10, 11, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15] },
        { id: 'R-008', name: 'Rapid Fund Movement', category: 'aml', triggerCount: s(45), trueFraudPct: 88, noisePct: 12, netValuePrevented: 1890000, lastUpdated: '2026-02-18', status: 'active', triggerTrend: [3, 4, 3, 5, 4, 6, 5, 4, 6, 5, 7, 6] },
        { id: 'R-009', name: 'Dormant Account Reactivation', category: 'fraud', triggerCount: s(56), trueFraudPct: 74, noisePct: 26, netValuePrevented: 345000, lastUpdated: '2026-02-12', status: 'active', triggerTrend: [4, 5, 4, 6, 5, 7, 6, 5, 7, 6, 8, 7] },
        { id: 'R-010', name: 'Sanctions List Match', category: 'aml', triggerCount: s(12), trueFraudPct: 95, noisePct: 5, netValuePrevented: 4500000, lastUpdated: '2026-02-20', status: 'active', triggerTrend: [1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1] },
      ],
    },

    geography: {
      countries: [
        { code: 'US', name: 'United States', txnVolume: s(456000), alertRate: 1.8, fraudRate: 0.12, amlRiskScore: 18, topMerchant: 'Amazon', topChannel: 'web' },
        { code: 'GB', name: 'United Kingdom', txnVolume: s(124500), alertRate: 2.1, fraudRate: 0.15, amlRiskScore: 23, topMerchant: 'Tesco', topChannel: 'pos' },
        { code: 'DE', name: 'Germany', txnVolume: s(98700), alertRate: 1.6, fraudRate: 0.09, amlRiskScore: 15, topMerchant: 'MediaMarkt', topChannel: 'web' },
        { code: 'NG', name: 'Nigeria', txnVolume: s(23400), alertRate: 8.7, fraudRate: 1.24, amlRiskScore: 87, topMerchant: 'QuickCash Exchange', topChannel: 'mobile' },
        { code: 'RU', name: 'Russia', txnVolume: s(18900), alertRate: 7.2, fraudRate: 0.98, amlRiskScore: 82, topMerchant: 'Vostok Financial', topChannel: 'web' },
        { code: 'CN', name: 'China', txnVolume: s(56700), alertRate: 4.5, fraudRate: 0.45, amlRiskScore: 71, topMerchant: 'Dragon Gate Imports', topChannel: 'mobile' },
        { code: 'BR', name: 'Brazil', txnVolume: s(32100), alertRate: 3.8, fraudRate: 0.34, amlRiskScore: 65, topMerchant: 'MercadoPago', topChannel: 'mobile' },
        { code: 'JP', name: 'Japan', txnVolume: s(78900), alertRate: 0.9, fraudRate: 0.04, amlRiskScore: 12, topMerchant: 'Rakuten', topChannel: 'web' },
        { code: 'AE', name: 'UAE', txnVolume: s(34500), alertRate: 3.2, fraudRate: 0.28, amlRiskScore: 58, topMerchant: 'Dubai Gold Souk', topChannel: 'pos' },
        { code: 'CO', name: 'Colombia', txnVolume: s(8900), alertRate: 6.1, fraudRate: 0.87, amlRiskScore: 78, topMerchant: 'Andean Mining Corp', topChannel: 'branch' },
      ],
      geoAnomalies: { ipMismatchRate: 4.7, impossibleTravel: s(127), firstSeenCountry: s(342) },
    },

    channels: {
      channelVolume: [
        { name: 'POS', volume: s(189000), risk: 22, alertsPer1k: 3.4, falsePositiveRate: 12.1 },
        { name: 'Web', volume: s(156000), risk: 45, alertsPer1k: 8.7, falsePositiveRate: 16.3 },
        { name: 'Mobile', volume: s(134000), risk: 38, alertsPer1k: 6.2, falsePositiveRate: 18.4 },
        { name: 'ATM', volume: s(54000), risk: 55, alertsPer1k: 12.1, falsePositiveRate: 9.8 },
        { name: 'Branch', volume: s(27000), risk: 12, alertsPer1k: 1.8, falsePositiveRate: 7.2 },
      ],
      channelRiskTrend: months12.map((month, i) => ({
        month,
        pos: [20, 21, 22, 21, 23, 22, 24, 23, 22, 21, 22, 22][i],
        web: [38, 40, 42, 41, 44, 43, 45, 44, 46, 45, 44, 45][i],
        mobile: [30, 32, 34, 33, 36, 35, 37, 36, 38, 37, 38, 38][i],
        atm: [45, 47, 48, 50, 52, 51, 53, 52, 54, 55, 54, 55][i],
        branch: [10, 11, 12, 11, 13, 12, 12, 11, 12, 12, 12, 12][i],
      })),
      channelFunnel: [
        { name: 'POS', flagged: s(643), reviewed: s(512), confirmed: s(189) },
        { name: 'Web', flagged: s(1357), reviewed: s(1024), confirmed: s(456) },
        { name: 'Mobile', flagged: s(831), reviewed: s(645), confirmed: s(234) },
        { name: 'ATM', flagged: s(654), reviewed: s(534), confirmed: s(312) },
        { name: 'Branch', flagged: s(49), reviewed: s(42), confirmed: s(18) },
      ],
    },

    users: {
      totalUsers: { value: 142, delta: 4.4, definition: 'Total registered platform users across all roles' },
      activeUsers: { value: 118, delta: 2.6, definition: 'Users who logged in during the selected period' },
      privilegedUsers: { value: 23, delta: 0, definition: 'Users with elevated or admin privilege levels' },
      mfaAdoption: { value: 94.3, delta: 3.1, definition: 'Percentage of users with multi-factor authentication enabled' },
      ssoAdoption: { value: 78.2, delta: 5.6, definition: 'Percentage of users authenticating via SSO provider' },
      failedLogins24h: { value: 17, delta: 41.7, definition: 'Number of failed login attempts in the last 24 hours' },
      lockedUsers: { value: 3, delta: 50.0, definition: 'User accounts currently locked due to security policy' },
      loginsTrend: months12.map((month, i) => ({ month, logins: [2890, 3012, 3145, 3234, 3102, 3456, 3321, 3478, 3567, 3612, 3489, 3534][i] })),
      failedLoginsTrend: months12.map((month, i) => ({ month, failed: [45, 52, 38, 67, 43, 89, 56, 72, 48, 61, 53, 47][i] })),
      analystProductivity: [
        { name: 'Sarah Chen', casesHandled: 87, avgReviewTime: 28, slaBreaches: 2 },
        { name: 'Michael Torres', casesHandled: 92, avgReviewTime: 24, slaBreaches: 1 },
        { name: 'Emily Watson', casesHandled: 78, avgReviewTime: 32, slaBreaches: 4 },
        { name: 'James Kim', casesHandled: 95, avgReviewTime: 22, slaBreaches: 0 },
        { name: 'Priya Patel', casesHandled: 81, avgReviewTime: 30, slaBreaches: 3 },
        { name: 'David Okafor', casesHandled: 73, avgReviewTime: 35, slaBreaches: 5 },
      ],
      unusualAccess: [
        { userId: 'USR-1042', name: 'Mark Reynolds', pattern: 'Bulk export of 2,400 customer records', exports: 12, unusualTime: true, lastAction: '2026-02-20T02:34:00Z' },
        { userId: 'USR-1187', name: 'Lisa Chang', pattern: 'Access from unrecognized IP (VPN detected)', exports: 3, unusualTime: false, lastAction: '2026-02-19T16:12:00Z' },
        { userId: 'USR-1305', name: 'Ahmed Hassan', pattern: 'Privilege escalation attempt (role_change denied)', exports: 0, unusualTime: true, lastAction: '2026-02-20T01:45:00Z' },
      ],
      roleDistribution: [
        { role: 'Risk Analyst', count: 45 },
        { role: 'Compliance Officer', count: 28 },
        { role: 'AML Analyst', count: 32 },
        { role: 'Auditor', count: 12 },
        { role: 'Admin', count: 8 },
        { role: 'Viewer', count: 17 },
      ],
    },

    operations: {
      openAlerts: { value: s(347), delta: -8.3, definition: 'Alerts currently in open or pending status' },
      openCases: { value: s(89), delta: 4.7, definition: 'Investigation cases currently open or in review' },
      slaBreachRisk: { value: s(23), delta: 15.0, definition: 'Cases at risk of breaching SLA in the next 24 hours' },
      avgTimeToTriage: { value: '1.2h', delta: -18.0, definition: 'Average time from alert creation to initial analyst triage' },
      avgTimeToResolution: { value: '3.4d', delta: -12.0, definition: 'Average time from case creation to final resolution' },
      backlogTrend: { value: '-8.3%', delta: -8.3, definition: 'Month-over-month change in total open items' },
      backlogTrendData: months12.map((month, i) => ({
        month,
        alerts: [412, 398, 378, 365, 389, 402, 378, 356, 367, 345, 358, 347][i],
        cases: [102, 98, 95, 89, 94, 97, 91, 87, 92, 86, 90, 89][i],
      })),
      slaComplianceTrend: months12.map((month, i) => ({
        month,
        compliance: [87.2, 88.5, 89.1, 90.3, 89.8, 91.2, 90.7, 92.1, 91.5, 93.0, 92.4, 93.8][i],
      })),
      caseAging: [
        { bucket: '0-24h', count: s(34) },
        { bucket: '1-3d', count: s(28) },
        { bucket: '3-7d', count: s(15) },
        { bucket: '7-14d', count: s(8) },
        { bucket: '14-30d', count: s(3) },
        { bucket: '30d+', count: s(1) },
      ],
      oldestCases: [
        { id: 'CASE-2024-0891', title: 'Multi-account structuring ring - Eastern Europe', age: 45, assignee: 'Sarah Chen', priority: 'critical' },
        { id: 'CASE-2024-1023', title: 'Shell company layering via trade finance', age: 38, assignee: 'Michael Torres', priority: 'high' },
        { id: 'CASE-2024-1156', title: 'PEP-linked suspicious wire transfers', age: 32, assignee: 'Priya Patel', priority: 'high' },
        { id: 'CASE-2024-1287', title: 'Card testing fraud - botnet suspected', age: 28, assignee: 'James Kim', priority: 'medium' },
        { id: 'CASE-2024-1345', title: 'Cross-border ATM skimming network', age: 21, assignee: 'Emily Watson', priority: 'high' },
      ],
      teamQueues: [
        { team: 'Fraud Operations', open: s(145), inReview: s(67), breached: s(8) },
        { team: 'AML Compliance', open: s(98), inReview: s(45), breached: s(12) },
        { team: 'Escalations', open: s(34), inReview: s(23), breached: s(3) },
        { team: 'Senior Review', open: s(12), inReview: s(8), breached: s(0) },
      ],
    },

    audit: {
      auditEvents: [
        { id: 'AUD-20260220-001', timestamp: '2026-02-20T09:15:23Z', user: 'sarah.chen@snapfort.com', action: 'login', target: 'platform', details: 'SSO login via Azure AD from 10.0.12.45 (New York)', correlationId: 'sess-a1b2c3', immutable: true },
        { id: 'AUD-20260220-002', timestamp: '2026-02-20T09:18:45Z', user: 'sarah.chen@snapfort.com', action: 'case_status_change', target: 'CASE-2024-1156', details: 'Status changed from open to in_review', correlationId: 'sess-a1b2c3', immutable: true },
        { id: 'AUD-20260220-003', timestamp: '2026-02-20T08:45:12Z', user: 'admin@snapfort.com', action: 'role_change', target: 'USR-1187 (Lisa Chang)', details: 'Role changed from viewer to risk_analyst, approved by compliance lead', correlationId: 'sess-d4e5f6', immutable: true },
        { id: 'AUD-20260220-004', timestamp: '2026-02-20T07:30:00Z', user: 'james.kim@snapfort.com', action: 'rule_edit', target: 'R-005 (High-Risk Country)', details: 'Threshold adjusted from 70 to 65, added Colombia to country list', correlationId: 'sess-g7h8i9', immutable: true },
        { id: 'AUD-20260220-005', timestamp: '2026-02-20T02:34:18Z', user: 'mark.reynolds@snapfort.com', action: 'export', target: 'Customer Records', details: 'Exported 2,400 customer records to CSV - flagged for review', correlationId: 'sess-j0k1l2', immutable: true },
        { id: 'AUD-20260219-006', timestamp: '2026-02-19T22:15:00Z', user: 'system', action: 'mfa_toggle', target: 'USR-1305 (Ahmed Hassan)', details: 'MFA disabled by user - security alert triggered', correlationId: 'sys-m3n4o5', immutable: true },
        { id: 'AUD-20260219-007', timestamp: '2026-02-19T18:45:30Z', user: 'emily.watson@snapfort.com', action: 'case_status_change', target: 'CASE-2024-1287', details: 'Case escalated to senior review, priority upgraded to high', correlationId: 'sess-p6q7r8', immutable: true },
        { id: 'AUD-20260219-008', timestamp: '2026-02-19T16:20:00Z', user: 'admin@snapfort.com', action: 'password_reset', target: 'USR-1042 (Mark Reynolds)', details: 'Password reset initiated after unusual access pattern detected', correlationId: 'sess-s9t0u1', immutable: true },
        { id: 'AUD-20260219-009', timestamp: '2026-02-19T14:00:00Z', user: 'michael.torres@snapfort.com', action: 'logout', target: 'platform', details: 'Session ended after 6.2 hours, normal activity', correlationId: 'sess-v2w3x4', immutable: true },
        { id: 'AUD-20260219-010', timestamp: '2026-02-19T11:30:45Z', user: 'priya.patel@snapfort.com', action: 'export', target: 'SAR Report - CASE-2024-0891', details: 'SAR draft exported for compliance review', correlationId: 'sess-y5z6a7', immutable: true },
        { id: 'AUD-20260218-011', timestamp: '2026-02-18T09:00:00Z', user: 'system', action: 'login', target: 'platform', details: 'Failed login attempt for admin@snapfort.com from 185.234.12.89 (blocked IP)', correlationId: 'sys-b8c9d0', immutable: true },
        { id: 'AUD-20260218-012', timestamp: '2026-02-18T15:45:00Z', user: 'david.okafor@snapfort.com', action: 'rule_edit', target: 'R-008 (Rapid Fund Movement)', details: 'Added velocity condition: max 3 transfers in 1 hour window', correlationId: 'sess-e1f2g3', immutable: true },
      ],
    },
  };
}

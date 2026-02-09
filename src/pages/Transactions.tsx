import { useMemo, useState } from 'react';
import { 
  FileText, Search, Download, Filter, Eye, 
  ChevronDown, ChevronUp, Briefcase, Info,
  SlidersHorizontal, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RiskScoreBadge } from '@/components/dashboard/RiskScoreBadge';
import { generateTransactions } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const riskDriverLabels: Record<string, string> = {
  velocity: 'Velocity', geo: 'Geography', device: 'Device', amount: 'Amount',
};

const getRiskDrivers = (txn: Transaction) => {
  const drivers: string[] = [];
  if (txn.amount > 5000) drivers.push('amount');
  if (txn.rulesTriggered.some(r => r.toLowerCase().includes('velocity'))) drivers.push('velocity');
  if (txn.rulesTriggered.some(r => r.toLowerCase().includes('geo') || r.toLowerCase().includes('location') || r.toLowerCase().includes('country'))) drivers.push('geo');
  if (txn.rulesTriggered.some(r => r.toLowerCase().includes('device'))) drivers.push('device');
  if (!drivers.length && txn.riskLevel !== 'low') drivers.push('amount');
  return drivers;
};

// --- Summary Strip Component ---
const SummaryStrip = ({ transactions }: { transactions: Transaction[] }) => {
  const totalValue = transactions.reduce((s, t) => s + t.amount, 0);
  const highRiskPct = transactions.length ? ((transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length / transactions.length) * 100).toFixed(1) : '0';
  const crossBorderPct = transactions.length ? ((transactions.filter(t => t.geoLocation.country !== 'United States').length / transactions.length) * 100).toFixed(1) : '0';
  const avgRisk = transactions.length ? (transactions.reduce((s, t) => s + t.riskScore, 0) / transactions.length).toFixed(0) : '0';

  const items = [
    { label: 'Total Transactions', value: transactions.length.toLocaleString(), tooltip: 'Count of transactions matching current filters.' },
    { label: 'Total Value', value: `$${(totalValue / 1e6).toFixed(2)}M`, tooltip: 'Sum of all transaction amounts in current view.' },
    { label: 'High-Risk', value: `${highRiskPct}%`, tooltip: 'Percentage of transactions scored as High or Critical risk.' },
    { label: 'Cross-Border', value: `${crossBorderPct}%`, tooltip: 'Percentage of transactions originating outside the United States.' },
    { label: 'Avg Risk Score', value: avgRisk, tooltip: 'Mean risk score across all transactions in current view.' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(item => (
        <div key={item.label} className="stat-card p-3">
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">{item.tooltip}</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-lg font-bold tracking-tight mt-0.5">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

// --- Expandable Transaction Row ---
const TransactionExpandedRow = ({ txn }: { txn: Transaction }) => (
  <tr className="bg-muted/20">
    <td colSpan={12} className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Risk Explanation</p>
          {txn.rulesTriggered.length > 0 ? (
            <ul className="space-y-1 text-muted-foreground">
              {txn.rulesTriggered.map((r, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-destructive mt-0.5">-</span>{r}</li>)}
            </ul>
          ) : (
            <p className="text-muted-foreground">No rules triggered. Risk within normal range.</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Device & Geo</p>
          <div className="space-y-1 text-muted-foreground">
            <p>Device: {txn.deviceId}</p>
            <p>IP: {txn.ipAddress}</p>
            <p>Location: {txn.geoLocation.city}, {txn.geoLocation.country}</p>
            <p>Card: {txn.cardNumberMasked}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Model Output</p>
          <div className="space-y-1 text-muted-foreground">
            <p>ML Probability: {(txn.mlProbability * 100).toFixed(1)}%</p>
            <p>Anomaly Score: {txn.anomalyScore.toFixed(3)}</p>
            <p>Model: XGBoost v2.3.1</p>
            <p>Rules Hit: {txn.rulesTriggered.length}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground text-sm">Actions</p>
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" className="text-xs justify-start">
              <Briefcase className="h-3 w-3 mr-1.5" />Create Case
            </Button>
            <Button size="sm" variant="outline" className="text-xs justify-start">
              <Eye className="h-3 w-3 mr-1.5" />Full Audit View
            </Button>
          </div>
        </div>
      </div>
    </td>
  </tr>
);

// --- Main Page ---
const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [riskRange, setRiskRange] = useState<[number, number]>([0, 100]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const transactions = useMemo(() => generateTransactions(100), []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!txn.id.toLowerCase().includes(q) && !txn.customerId.toLowerCase().includes(q) && !txn.merchantName.toLowerCase().includes(q)) return false;
      }
      if (typeFilter !== 'all' && txn.type !== typeFilter) return false;
      if (statusFilter !== 'all' && txn.status !== statusFilter) return false;
      if (riskFilter !== 'all' && txn.riskLevel !== riskFilter) return false;
      if (txn.riskScore < riskRange[0] || txn.riskScore > riskRange[1]) return false;
      return true;
    });
  }, [transactions, searchQuery, typeFilter, statusFilter, riskFilter, riskRange]);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { credit_card: '\u{1F4B3}', wire_transfer: '\u{1F504}', ach: '\u{1F3E6}', mobile: '\u{1F4F1}', atm: '\u{1F3E7}' };
    return icons[type] || '\u{1F4B0}';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setRiskFilter('all');
    setRiskRange([0, 100]);
  };

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || riskFilter !== 'all' || riskRange[0] !== 0 || riskRange[1] !== 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Transactions
          </h1>
          <p className="text-muted-foreground">Single source of truth for all transaction activity</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      {/* Summary Strip */}
      <SummaryStrip transactions={filteredTransactions} />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by ID, customer, or merchant..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
              <SelectItem value="ach">ACH</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="atm">ATM</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={showAdvanced ? 'default' : 'outline'} size="icon" onClick={() => setShowAdvanced(!showAdvanced)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
              <X className="h-3 w-3 mr-1" />Clear
            </Button>
          )}
        </div>
        {showAdvanced && (
          <div className="stat-card p-4 flex flex-wrap items-center gap-6">
            <div className="space-y-1 min-w-[200px]">
              <p className="text-xs text-muted-foreground">Risk Score Range: {riskRange[0]} - {riskRange[1]}</p>
              <Slider min={0} max={100} step={1} value={riskRange} onValueChange={(v) => setRiskRange(v as [number, number])} className="w-48" />
            </div>
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="stat-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date/Time</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Risk Drivers</th>
                <th>Confidence</th>
                <th>Risk</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => {
                const isExpanded = expandedRow === txn.id;
                const drivers = getRiskDrivers(txn);
                return (
                  <>
                    <tr
                      key={txn.id}
                      className={cn('cursor-pointer', isExpanded && 'bg-muted/30')}
                      onClick={() => setExpandedRow(isExpanded ? null : txn.id)}
                    >
                      <td className="font-mono text-xs">{txn.id}</td>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(txn.timestamp), 'MMM d, yyyy HH:mm:ss')}</td>
                      <td>
                        <span className="flex items-center gap-2">
                          <span>{getTypeIcon(txn.type)}</span>
                          <span className="text-xs capitalize">{txn.type.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="font-mono text-xs">{txn.customerId}</td>
                      <td className={cn('font-semibold', txn.amount > 5000 && 'text-warning', txn.amount > 10000 && 'text-destructive')}>{formatAmount(txn.amount)}</td>
                      <td className="max-w-[150px]">
                        <p className="text-sm truncate">{txn.merchantName}</p>
                        <p className="text-xs text-muted-foreground">MCC: {txn.merchantCategoryCode}</p>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {drivers.map(d => (
                            <Badge key={d} variant="outline" className="text-[10px] capitalize px-1.5 py-0">{riskDriverLabels[d] || d}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-xs font-mono">{(txn.mlProbability * 100).toFixed(0)}%</td>
                      <td><RiskScoreBadge score={txn.riskScore} level={txn.riskLevel} size="sm" /></td>
                      <td>
                        <Badge variant="outline" className={cn('text-xs capitalize',
                          txn.status === 'completed' && 'border-success/30 text-success',
                          txn.status === 'pending' && 'border-warning/30 text-warning',
                          txn.status === 'declined' && 'border-destructive/30 text-destructive'
                        )}>{txn.status}</Badge>
                      </td>
                      <td>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</td>
                    </tr>
                    {isExpanded && <TransactionExpandedRow key={`${txn.id}-exp`} txn={txn} />}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

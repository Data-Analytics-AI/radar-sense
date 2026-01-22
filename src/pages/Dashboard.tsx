import { useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Briefcase, 
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { LiveTransactionFeed } from '@/components/dashboard/LiveTransactionFeed';
import { TopRiskyMerchants } from '@/components/dashboard/TopRiskyMerchants';
import { generateDashboardStats } from '@/lib/mock-data';

const Dashboard = () => {
  const stats = useMemo(() => generateDashboardStats(), []);
  
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time fraud detection and AML monitoring overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Transactions Today"
          value={stats.transactionsToday.toLocaleString()}
          subtitle={formatCurrency(stats.volumeToday)}
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: 12.5, label: 'vs yesterday' }}
        />
        <StatCard
          title="Fraud Detection Rate"
          value={`${stats.fraudDetectionRate}%`}
          subtitle="ML + Rules combined"
          icon={<Shield className="h-5 w-5" />}
          trend={{ value: 2.3, label: 'improvement' }}
          variant="success"
        />
        <StatCard
          title="Open Alerts"
          value={stats.openAlerts}
          subtitle={`${stats.openCases} active cases`}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: -8, label: 'vs last week' }}
          variant="warning"
        />
        <StatCard
          title="Amount Saved"
          value={formatCurrency(stats.amountSaved)}
          subtitle="Fraud prevented this month"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 15.7, label: 'vs last month' }}
          variant="success"
        />
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <TransactionChart title="Transaction Volume (7d)" metric="transactions" />
        <TransactionChart title="Fraud Rate Trend (7d)" metric="fraud_rate" />
        <RiskDistributionChart />
      </div>
      
      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <LiveTransactionFeed />
        <RecentAlerts />
        <TopRiskyMerchants />
      </div>
      
      {/* Model performance summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Model Precision"
          value="91%"
          subtitle="XGBoost v2.3.1"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 3, label: 'vs baseline' }}
        />
        <StatCard
          title="False Positive Rate"
          value={`${stats.falsePositiveRate}%`}
          subtitle="Below 5% target"
          icon={<ArrowDownRight className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${stats.avgResolutionTime}h`}
          subtitle="Alert to closure"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: -12, label: 'improvement' }}
        />
      </div>
    </div>
  );
};

export default Dashboard;

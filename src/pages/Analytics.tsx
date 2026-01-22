import { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { TopRiskyMerchants } from '@/components/dashboard/TopRiskyMerchants';
import { generateDashboardStats, getChannelDistribution } from '@/lib/mock-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const Analytics = () => {
  const stats = useMemo(() => generateDashboardStats(), []);
  const channelData = useMemo(() => getChannelDistribution(), []);
  
  const modelComparisonData = [
    { name: 'Precision', LogReg: 85, RandomForest: 88, XGBoost: 91 },
    { name: 'Recall', LogReg: 78, RandomForest: 82, XGBoost: 87 },
    { name: 'F1-Score', LogReg: 81, RandomForest: 85, XGBoost: 89 },
    { name: 'AUC-ROC', LogReg: 89, RandomForest: 93, XGBoost: 95 },
  ];
  
  const fraudTrendData = [
    { month: 'Aug', detected: 245, prevented: 234, falsePositive: 23 },
    { month: 'Sep', detected: 267, prevented: 256, falsePositive: 19 },
    { month: 'Oct', detected: 289, prevented: 281, falsePositive: 15 },
    { month: 'Nov', detected: 312, prevented: 305, falsePositive: 12 },
    { month: 'Dec', detected: 278, prevented: 273, falsePositive: 10 },
    { month: 'Jan', detected: 298, prevented: 294, falsePositive: 8 },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Reporting
          </h1>
          <p className="text-muted-foreground">Performance metrics and trend analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={(stats.totalTransactions / 1000000).toFixed(2) + 'M'}
          subtitle="All time"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          title="Fraud Detection Rate"
          value={`${stats.fraudDetectionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
          trend={{ value: 5.2, label: 'vs last quarter' }}
        />
        <StatCard
          title="False Positive Rate"
          value={`${stats.falsePositiveRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
          trend={{ value: -12, label: 'improvement' }}
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${stats.avgResolutionTime}h`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: -18, label: 'faster' }}
        />
      </div>
      
      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransactionChart title="Transaction Volume Trend" metric="transactions" days={30} />
        <TransactionChart title="Alert Volume Trend" metric="alerts" days={30} />
      </div>
      
      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RiskDistributionChart />
        <div className="stat-card h-[300px]">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Channel Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={channelData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <TopRiskyMerchants />
      </div>
      
      {/* Fraud trend analysis */}
      <div className="stat-card h-[350px]">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Fraud Detection Trend (6 Months)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={fraudTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="detected" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Detected"
            />
            <Line 
              type="monotone" 
              dataKey="prevented" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--success))' }}
              name="Prevented"
            />
            <Line 
              type="monotone" 
              dataKey="falsePositive" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning))' }}
              name="False Positives"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Model comparison */}
      <div className="stat-card h-[350px]">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Model Performance Comparison</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={modelComparisonData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              domain={[70, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="LogReg" fill="hsl(var(--muted-foreground))" name="Logistic Regression" radius={[4, 4, 0, 0]} />
            <Bar dataKey="RandomForest" fill="hsl(var(--chart-5))" name="Random Forest" radius={[4, 4, 0, 0]} />
            <Bar dataKey="XGBoost" fill="hsl(var(--primary))" name="XGBoost (Active)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;

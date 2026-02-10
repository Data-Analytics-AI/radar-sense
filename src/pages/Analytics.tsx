import { useMemo, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Shield,
  AlertTriangle,
  Globe,
  Cpu,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { TopRiskyMerchants } from '@/components/dashboard/TopRiskyMerchants';
import { generateDashboardStats, getChannelDistribution } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px'
};

const Analytics = () => {
  const stats = useMemo(() => generateDashboardStats(), []);
  const channelData = useMemo(() => getChannelDistribution(), []);
  const [dateRange, setDateRange] = useState('30d');
  
  const modelComparisonData = [
    { name: 'Precision', LogReg: 85, RandomForest: 88, XGBoost: 91 },
    { name: 'Recall', LogReg: 78, RandomForest: 82, XGBoost: 87 },
    { name: 'F1-Score', LogReg: 81, RandomForest: 85, XGBoost: 89 },
    { name: 'AUC-ROC', LogReg: 89, RandomForest: 93, XGBoost: 95 },
  ];

  const radarData = [
    { metric: 'Precision', value: 91 },
    { metric: 'Recall', value: 87 },
    { metric: 'F1', value: 89 },
    { metric: 'AUC', value: 95 },
    { metric: 'Speed', value: 92 },
    { metric: 'Stability', value: 88 },
  ];
  
  const fraudTrendData = [
    { month: 'Aug', detected: 245, prevented: 234, falsePositive: 23, loss: 120000 },
    { month: 'Sep', detected: 267, prevented: 256, falsePositive: 19, loss: 98000 },
    { month: 'Oct', detected: 289, prevented: 281, falsePositive: 15, loss: 78000 },
    { month: 'Nov', detected: 312, prevented: 305, falsePositive: 12, loss: 65000 },
    { month: 'Dec', detected: 278, prevented: 273, falsePositive: 10, loss: 52000 },
    { month: 'Jan', detected: 298, prevented: 294, falsePositive: 8, loss: 41000 },
  ];

  const amlTrendData = [
    { month: 'Aug', alerts: 89, escalated: 23, sars: 5 },
    { month: 'Sep', alerts: 95, escalated: 28, sars: 7 },
    { month: 'Oct', alerts: 102, escalated: 31, sars: 6 },
    { month: 'Nov', alerts: 87, escalated: 19, sars: 4 },
    { month: 'Dec', alerts: 110, escalated: 34, sars: 9 },
    { month: 'Jan', alerts: 96, escalated: 26, sars: 5 },
  ];

  const rulesData = [
    { name: 'High Amount', triggers: 245, trueFraud: 78, noise: 22, lastUpdated: '3d ago' },
    { name: 'Velocity Check', triggers: 156, trueFraud: 65, noise: 35, lastUpdated: '1w ago' },
    { name: 'Impossible Travel', triggers: 34, trueFraud: 91, noise: 9, lastUpdated: '2d ago' },
    { name: 'Structuring', triggers: 89, trueFraud: 72, noise: 28, lastUpdated: '5d ago' },
    { name: 'High-Risk Country', triggers: 178, trueFraud: 45, noise: 55, lastUpdated: '1d ago' },
    { name: 'New Device + High', triggers: 67, trueFraud: 82, noise: 18, lastUpdated: '4d ago' },
    { name: 'After Hours', triggers: 123, trueFraud: 38, noise: 62, lastUpdated: '6d ago' },
    { name: 'Rapid Fund Move', triggers: 45, trueFraud: 88, noise: 12, lastUpdated: '2d ago' },
  ];

  const geoRiskData = [
    { country: 'Nigeria', risk: 87, volume: 2340, alerts: 156 },
    { country: 'Russia', risk: 82, volume: 1890, alerts: 134 },
    { country: 'China', risk: 71, volume: 5670, alerts: 189 },
    { country: 'Brazil', risk: 65, volume: 3210, alerts: 98 },
    { country: 'United Kingdom', risk: 23, volume: 12450, alerts: 45 },
    { country: 'United States', risk: 18, volume: 45600, alerts: 67 },
  ];

  const channelRiskData = [
    { channel: 'Web', risk: 45, volume: 12300, color: 'hsl(var(--primary))' },
    { channel: 'Mobile', risk: 38, volume: 15600, color: 'hsl(var(--chart-5))' },
    { channel: 'POS', risk: 22, volume: 18900, color: 'hsl(var(--success))' },
    { channel: 'ATM', risk: 55, volume: 5400, color: 'hsl(var(--warning))' },
    { channel: 'Branch', risk: 12, volume: 2700, color: 'hsl(var(--muted-foreground))' },
  ];

  const executiveSummary = [
    { type: 'risk', text: 'ATM fraud attempts increased 18% week-over-week. Highest concentration in Eastern European corridors.' },
    { type: 'change', text: 'XGBoost model confidence dropped 2.1% for cross-border web transactions in the last 7 days.' },
    { type: 'action', text: 'Consider retraining model on latest ATM fraud patterns. Review high-risk country rule thresholds.' },
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
          <p className="text-muted-foreground">Performance metrics, trend analysis, and regulatory reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
            {['7d', '30d', '90d'].map(r => (
              <Button key={r} variant={dateRange === r ? 'default' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setDateRange(r)}>
                {r}
              </Button>
            ))}
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="stat-card border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Executive Summary</h3>
          <Badge variant="secondary" className="text-xs ml-auto">Updated 15 min ago</Badge>
        </div>
        <div className="space-y-2">
          {executiveSummary.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                item.type === 'risk' && 'bg-destructive',
                item.type === 'change' && 'bg-warning',
                item.type === 'action' && 'bg-primary'
              )} />
              <p className="text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabbed sections */}
      <Tabs defaultValue="fraud" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-2xl">
          <TabsTrigger value="fraud" className="text-xs">Fraud</TabsTrigger>
          <TabsTrigger value="aml" className="text-xs">AML</TabsTrigger>
          <TabsTrigger value="models" className="text-xs">Models</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs">Rules</TabsTrigger>
          <TabsTrigger value="geo" className="text-xs">Geography</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
        </TabsList>

        {/* FRAUD TAB */}
        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Fraud Detection Rate" value={`${stats.fraudDetectionRate}%`} icon={<TrendingUp className="h-5 w-5" />} variant="success" trend={{ value: 5.2, label: 'vs last quarter' }} />
            <StatCard title="False Positive Rate" value={`${stats.falsePositiveRate}%`} icon={<TrendingDown className="h-5 w-5" />} variant="success" trend={{ value: -12, label: 'improvement' }} />
            <StatCard title="Loss Prevented" value="$2.3M" icon={<Shield className="h-5 w-5" />} variant="success" trend={{ value: 18, label: 'vs prior period' }} />
            <StatCard title="Avg Resolution" value={`${stats.avgResolutionTime}h`} icon={<TrendingDown className="h-5 w-5" />} trend={{ value: -18, label: 'faster' }} />
          </div>
          <div className="stat-card h-[350px]">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Fraud Detection Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={fraudTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="prevented" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} strokeWidth={2} name="Prevented" />
                <Area type="monotone" dataKey="detected" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} name="Detected" />
                <Line type="monotone" dataKey="falsePositive" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: 'hsl(var(--warning))' }} name="False Positives" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TransactionChart title="Transaction Volume" metric="transactions" days={30} />
            <div className="stat-card h-[300px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Loss Prevented vs Actual Loss</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={fraudTrendData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="loss" fill="hsl(var(--destructive))" name="Actual Loss ($)" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* AML TAB */}
        <TabsContent value="aml" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="AML Alerts" value="579" icon={<AlertTriangle className="h-5 w-5" />} trend={{ value: 8, label: 'vs prior period' }} />
            <StatCard title="Escalated" value="161" icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard title="SARs Filed" value="36" icon={<Shield className="h-5 w-5" />} />
            <StatCard title="Avg Escalation Time" value="6.2h" icon={<TrendingDown className="h-5 w-5" />} trend={{ value: -15, label: 'faster' }} />
          </div>
          <div className="stat-card h-[350px]">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">AML Alert Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={amlTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="alerts" stroke="hsl(var(--primary))" strokeWidth={2} name="Alerts" />
                <Line type="monotone" dataKey="escalated" stroke="hsl(var(--warning))" strokeWidth={2} name="Escalated" />
                <Line type="monotone" dataKey="sars" stroke="hsl(var(--destructive))" strokeWidth={2} name="SARs Filed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* MODELS TAB */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="stat-card h-[350px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Model Performance Comparison</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={modelComparisonData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} domain={[70, 100]} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="LogReg" fill="hsl(var(--muted-foreground))" name="Logistic Regression" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="RandomForest" fill="hsl(var(--chart-5))" name="Random Forest" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="XGBoost" fill="hsl(var(--primary))" name="XGBoost (Active)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="stat-card h-[350px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">XGBoost v2.3.1 — Active Model Profile</h3>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Radar name="XGBoost" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Model Drift Indicators</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Model confidence dropped slightly for cross-border web transactions in the last 7 days. No significant feature drift detected across primary inputs.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Feature Drift', value: 2.1, status: 'normal' },
                { label: 'Prediction Stability', value: 97.3, status: 'normal' },
                { label: 'Data Quality', value: 99.1, status: 'normal' },
              ].map(m => (
                <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-lg font-bold">{m.value}%</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <Badge variant="secondary" className="text-xs mt-1">Stable</Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskDistributionChart />
            <TopRiskyMerchants />
          </div>
        </TabsContent>

        {/* RULES TAB */}
        <TabsContent value="rules" className="space-y-4">
          <div className="stat-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Rules Effectiveness</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Rule</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Triggers</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">True Fraud %</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Noise %</th>
                    <th className="text-center py-2 text-xs font-medium text-muted-foreground">Effectiveness</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rulesData.map(rule => (
                    <tr key={rule.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium text-xs">{rule.name}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{rule.triggers}</td>
                      <td className="py-2.5 text-right font-mono text-xs">
                        <span className={rule.trueFraud >= 70 ? 'text-success' : rule.trueFraud >= 50 ? 'text-warning' : 'text-destructive'}>
                          {rule.trueFraud}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs text-muted-foreground">{rule.noise}%</td>
                      <td className="py-2.5">
                        <Progress value={rule.trueFraud} className="h-1.5 mx-auto max-w-[80px]" />
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">{rule.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* GEO TAB */}
        <TabsContent value="geo" className="space-y-4">
          <div className="stat-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Geographic Risk Distribution</h3>
            <div className="space-y-3">
              {geoRiskData.map(geo => (
                <div key={geo.country} className="flex items-center gap-4">
                  <span className="text-sm w-32 truncate">{geo.country}</span>
                  <div className="flex-1">
                    <Progress value={geo.risk} className="h-2" />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={cn('font-mono w-10 text-right cursor-help',
                          geo.risk >= 70 ? 'text-destructive' : geo.risk >= 40 ? 'text-warning' : 'text-success'
                        )}>{geo.risk}</span>
                      </TooltipTrigger>
                      <TooltipContent>Risk score based on historical fraud and AML patterns</TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground w-16 text-right">{geo.volume.toLocaleString()} txns</span>
                    <span className="text-muted-foreground w-14 text-right">{geo.alerts} alerts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* CHANNELS TAB */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="stat-card h-[300px]">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Channel Volume Distribution</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={channelData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="stat-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Channel Risk Comparison</h3>
              <div className="space-y-3">
                {channelRiskData.map(ch => (
                  <div key={ch.channel} className="flex items-center gap-4">
                    <span className="text-sm w-16">{ch.channel}</span>
                    <div className="flex-1">
                      <Progress value={ch.risk} className="h-2" />
                    </div>
                    <span className={cn('text-xs font-mono w-10 text-right',
                      ch.risk >= 50 ? 'text-destructive' : ch.risk >= 30 ? 'text-warning' : 'text-success'
                    )}>{ch.risk}%</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">{ch.volume.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;

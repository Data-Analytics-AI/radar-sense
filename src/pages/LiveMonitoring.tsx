import { useState, useEffect, useMemo } from 'react';
import { Activity, Pause, Play, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskScoreBadge } from '@/components/dashboard/RiskScoreBadge';
import { generateTransactions, generateHourlyData } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const LiveMonitoring = () => {
  const [isLive, setIsLive] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    perMinute: 0,
    highRisk: 0,
    blocked: 0
  });
  
  const initialTransactions = useMemo(() => generateTransactions(50), []);
  const hourlyData = useMemo(() => generateHourlyData(24), []);
  
  useEffect(() => {
    setTransactions(initialTransactions.slice(0, 20));
    
    if (!isLive) return;
    
    const interval = setInterval(() => {
      const newTxn = generateTransactions(1)[0];
      setTransactions(prev => [newTxn, ...prev.slice(0, 19)]);
      
      // Update stats
      setStats(prev => ({
        perMinute: Math.floor(Math.random() * 50) + 100,
        highRisk: prev.highRisk + (newTxn.riskLevel === 'high' || newTxn.riskLevel === 'critical' ? 1 : 0),
        blocked: prev.blocked + (newTxn.status === 'declined' ? 1 : 0)
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLive, initialTransactions]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Live Monitoring
            {isLive && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Real-time transaction stream and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Live stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.perMinute}</p>
            <p className="text-xs text-muted-foreground">Transactions/min</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10">
            <Activity className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{transactions.filter(t => t.riskLevel === 'low').length}</p>
            <p className="text-xs text-muted-foreground">Low Risk (last 20)</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10">
            <Activity className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length}</p>
            <p className="text-xs text-muted-foreground">High Risk (last 20)</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-destructive/10">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'declined').length}</p>
            <p className="text-xs text-muted-foreground">Blocked (last 20)</p>
          </div>
        </div>
      </div>
      
      {/* Intraday chart */}
      <div className="stat-card h-[200px]">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Transaction Volume (Last 24h)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gradient-volume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval={3}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#gradient-volume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Transaction feed */}
      <div className="stat-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Live Transaction Stream</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Channel</th>
                <th>Location</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr 
                  key={txn.id} 
                  className={cn(
                    'transition-all duration-300',
                    index === 0 && isLive && 'bg-primary/5'
                  )}
                >
                  <td className="font-mono text-xs text-muted-foreground">
                    {formatTime(txn.timestamp)}
                  </td>
                  <td className="font-mono text-xs">{txn.id}</td>
                  <td className="font-mono text-xs">{txn.customerId}</td>
                  <td className={cn(
                    'font-semibold',
                    txn.amount > 5000 && 'text-warning',
                    txn.amount > 10000 && 'text-destructive'
                  )}>
                    {formatAmount(txn.amount)}
                  </td>
                  <td className="text-sm">{txn.merchantName}</td>
                  <td>
                    <Badge variant="outline" className="text-xs capitalize">
                      {txn.channel}
                    </Badge>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {txn.geoLocation.city}, {txn.geoLocation.country}
                  </td>
                  <td>
                    <RiskScoreBadge score={txn.riskScore} level={txn.riskLevel} size="sm" />
                  </td>
                  <td>
                    <Badge 
                      variant="outline"
                      className={cn(
                        'text-xs capitalize',
                        txn.status === 'completed' && 'border-success/30 text-success',
                        txn.status === 'pending' && 'border-warning/30 text-warning',
                        txn.status === 'declined' && 'border-destructive/30 text-destructive'
                      )}
                    >
                      {txn.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;

import { useState, useEffect, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { RiskScoreBadge } from './RiskScoreBadge';
import { generateTransactions } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';

export const LiveTransactionFeed = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const initialTransactions = useMemo(() => generateTransactions(20), []);
  
  useEffect(() => {
    setTransactions(initialTransactions.slice(0, 8));
    
    // Simulate live updates
    const interval = setInterval(() => {
      const newTxn = generateTransactions(1)[0];
      setTransactions(prev => [newTxn, ...prev.slice(0, 7)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [initialTransactions]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Transaction Feed
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-hidden">
        {transactions.map((txn, index) => (
          <div
            key={txn.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20',
              'transition-all duration-300',
              index === 0 && 'animate-slide-up border-primary/30 bg-primary/5'
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{formatTime(txn.timestamp)}</span>
                <span className={cn(
                  'font-semibold',
                  txn.riskLevel === 'critical' && 'text-destructive',
                  txn.riskLevel === 'high' && 'text-orange-400',
                  txn.riskLevel === 'medium' && 'text-warning',
                  txn.riskLevel === 'low' && 'text-foreground'
                )}>
                  {formatAmount(txn.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {txn.merchantName} • {txn.geoLocation.city}, {txn.geoLocation.country}
              </p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">{txn.channel}</span>
              <RiskScoreBadge score={txn.riskScore} level={txn.riskLevel} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

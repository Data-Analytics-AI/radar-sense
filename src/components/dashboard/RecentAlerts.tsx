import { useMemo } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RiskScoreBadge } from './RiskScoreBadge';
import { AlertStatusBadge } from './AlertStatusBadge';
import { generateTransactions, generateAlerts } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

export const RecentAlerts = () => {
  const alerts = useMemo(() => {
    const transactions = generateTransactions(50);
    return generateAlerts(transactions).slice(0, 5);
  }, []);
  
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Recent Alerts
        </h3>
        <Link to="/alerts">
          <Button variant="ghost" size="sm" className="text-xs">
            View all
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Link
            key={alert.id}
            to={`/alerts/${alert.id}`}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-foreground">{alert.id}</span>
                <AlertStatusBadge status={alert.status} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {alert.description}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="ml-4">
              <RiskScoreBadge score={alert.riskScore} level={alert.severity} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

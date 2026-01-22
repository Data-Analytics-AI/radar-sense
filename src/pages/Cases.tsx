import { useMemo, useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus,
  Calendar,
  User,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RiskScoreBadge } from '@/components/dashboard/RiskScoreBadge';
import { generateTransactions, generateAlerts, generateCases } from '@/lib/mock-data';
import { Case, CaseStatus } from '@/types';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const Cases = () => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  
  const cases = useMemo(() => {
    const transactions = generateTransactions(200);
    const alerts = generateAlerts(transactions);
    return generateCases(alerts);
  }, []);
  
  const filteredCases = useMemo(() => {
    if (statusFilter === 'all') return cases;
    return cases.filter(c => c.status === statusFilter);
  }, [cases, statusFilter]);
  
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'open':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'in_review':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'resolved':
        return 'bg-success/20 text-success border-success/30';
      case 'escalated':
        return 'bg-destructive/20 text-destructive border-destructive/30';
    }
  };
  
  const getDueDateStatus = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return { label: 'Overdue', color: 'text-destructive' };
    if (days === 0) return { label: 'Due today', color: 'text-warning' };
    if (days <= 2) return { label: `${days}d left`, color: 'text-warning' };
    return { label: `${days}d left`, color: 'text-muted-foreground' };
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Case Management
          </h1>
          <p className="text-muted-foreground">Investigate and resolve fraud and AML cases</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Cases</p>
          <p className="text-3xl font-bold">{cases.length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-3xl font-bold">{cases.filter(c => c.status === 'open').length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-warning">
          <p className="text-sm text-muted-foreground">In Review</p>
          <p className="text-3xl font-bold">{cases.filter(c => c.status === 'in_review').length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-success">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-3xl font-bold">{cases.filter(c => c.status === 'resolved').length}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search cases..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'open', 'in_review', 'escalated', 'resolved'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Cases grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCases.map((caseItem) => {
          const dueStatus = getDueDateStatus(caseItem.dueDate);
          
          return (
            <div
              key={caseItem.id}
              className="stat-card hover:border-primary/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold">{caseItem.id}</span>
                    <Badge variant="outline" className={cn('text-xs', getStatusColor(caseItem.status))}>
                      {caseItem.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {caseItem.type}
                  </Badge>
                </div>
                <RiskScoreBadge 
                  score={0} 
                  level={caseItem.priority} 
                  showScore={false} 
                  size="sm" 
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-mono">{caseItem.customerId}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDistanceToNow(new Date(caseItem.createdAt), { addSuffix: true })}</span>
                </div>
                
                {dueStatus && (
                  <div className={cn('flex items-center gap-2 text-sm', dueStatus.color)}>
                    <Calendar className="h-4 w-4" />
                    <span>Due: {dueStatus.label}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {caseItem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Alerts: {caseItem.alertIds.length}</span>
                    <span>Transactions: {caseItem.transactionIds.length}</span>
                  </div>
                  <Progress value={caseItem.status === 'resolved' ? 100 : caseItem.status === 'in_review' ? 60 : 30} className="h-1" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-sm">
                  {caseItem.assignedTo ? (
                    <span className="text-foreground">{caseItem.assignedTo}</span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="group-hover:text-primary">
                  View
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No cases found</p>
        </div>
      )}
    </div>
  );
};

export default Cases;

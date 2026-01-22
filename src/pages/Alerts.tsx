import { useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  Filter, 
  Search, 
  ChevronDown, 
  Eye,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RiskScoreBadge } from '@/components/dashboard/RiskScoreBadge';
import { AlertStatusBadge } from '@/components/dashboard/AlertStatusBadge';
import { generateTransactions, generateAlerts } from '@/lib/mock-data';
import { Alert, AlertStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const Alerts = () => {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const alerts = useMemo(() => {
    const transactions = generateTransactions(100);
    return generateAlerts(transactions);
  }, []);
  
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesSearch = searchQuery === '' || 
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.customerId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [alerts, statusFilter, searchQuery]);
  
  const statusCounts = useMemo(() => {
    return {
      all: alerts.length,
      open: alerts.filter(a => a.status === 'open').length,
      under_investigation: alerts.filter(a => a.status === 'under_investigation').length,
      escalated: alerts.filter(a => a.status === 'escalated').length,
      closed: alerts.filter(a => a.status === 'closed').length,
    };
  }, [alerts]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Alert Management
          </h1>
          <p className="text-muted-foreground">Review and manage fraud and AML alerts</p>
        </div>
      </div>
      
      {/* Status tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {(['all', 'open', 'under_investigation', 'escalated', 'closed'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status.replace('_', ' ')}
            <Badge 
              variant="secondary" 
              className={cn(
                'ml-2',
                statusFilter === status && 'bg-primary-foreground/20'
              )}
            >
              {statusCounts[status]}
            </Badge>
          </Button>
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alert Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fraud">Fraud</SelectItem>
            <SelectItem value="aml">AML</SelectItem>
            <SelectItem value="graph">Graph/Network</SelectItem>
            <SelectItem value="rule">Rule Violation</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Alerts table */}
      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Customer</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="font-mono text-sm">{alert.id}</td>
                  <td>
                    <Badge variant="outline" className="capitalize text-xs">
                      {alert.type}
                    </Badge>
                  </td>
                  <td className="max-w-[300px]">
                    <p className="text-sm truncate">{alert.description}</p>
                    {alert.contributingFactors.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.contributingFactors.length} contributing factors
                      </p>
                    )}
                  </td>
                  <td className="font-mono text-xs">{alert.customerId}</td>
                  <td>
                    <RiskScoreBadge score={alert.riskScore} level={alert.severity} size="sm" />
                  </td>
                  <td>
                    <AlertStatusBadge status={alert.status} />
                  </td>
                  <td className="text-sm">
                    {alert.assignedTo ? (
                      <span className="text-foreground">{alert.assignedTo}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign to Me
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Escalate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

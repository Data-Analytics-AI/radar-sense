import { useMemo, useState } from 'react';
import { 
  FileText, 
  Search, 
  Download,
  Filter,
  ChevronDown,
  Eye
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
import { generateTransactions } from '@/lib/mock-data';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const transactions = useMemo(() => generateTransactions(100), []);
  
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    return transactions.filter(txn =>
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return '💳';
      case 'wire_transfer':
        return '🔄';
      case 'ach':
        return '🏦';
      case 'mobile':
        return '📱';
      case 'atm':
        return '🏧';
      default:
        return '💰';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Transactions
          </h1>
          <p className="text-muted-foreground">View and analyze transaction history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, customer, or merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="atm">ATM</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Transactions table */}
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
                <th>Location</th>
                <th>Channel</th>
                <th>Risk</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs">{txn.id}</td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(txn.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td>
                    <span className="flex items-center gap-2">
                      <span>{getTypeIcon(txn.type)}</span>
                      <span className="text-xs capitalize">{txn.type.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="font-mono text-xs">{txn.customerId}</td>
                  <td className={cn(
                    'font-semibold',
                    txn.amount > 5000 && 'text-warning',
                    txn.amount > 10000 && 'text-destructive'
                  )}>
                    {formatAmount(txn.amount)}
                  </td>
                  <td className="max-w-[150px]">
                    <p className="text-sm truncate">{txn.merchantName}</p>
                    <p className="text-xs text-muted-foreground">MCC: {txn.merchantCategoryCode}</p>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    <p>{txn.geoLocation.city}</p>
                    <p>{txn.geoLocation.country}</p>
                  </td>
                  <td>
                    <Badge variant="outline" className="text-xs capitalize">
                      {txn.channel}
                    </Badge>
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
                  <td>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
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

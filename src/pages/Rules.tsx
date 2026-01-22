import { useMemo, useState } from 'react';
import { 
  BookOpen, 
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateRules } from '@/lib/mock-data';
import { Rule } from '@/types';
import { cn } from '@/lib/utils';

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>(() => generateRules());
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fraud' | 'aml'>('all');
  
  const filteredRules = useMemo(() => {
    if (categoryFilter === 'all') return rules;
    return rules.filter(r => r.category === categoryFilter);
  }, [rules, categoryFilter]);
  
  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  };
  
  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'velocity':
        return '⚡';
      case 'amount':
        return '💰';
      case 'geographic':
        return '🌍';
      case 'time':
        return '🕐';
      case 'device':
        return '📱';
      case 'blacklist':
        return '🚫';
      default:
        return '📋';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Rules Engine
          </h1>
          <p className="text-muted-foreground">Configure fraud and AML detection rules</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-xs text-muted-foreground">Total Rules</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ToggleRight className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rules.filter(r => r.category === 'fraud').length}</p>
              <p className="text-xs text-muted-foreground">Fraud Rules</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rules.filter(r => r.category === 'aml').length}</p>
              <p className="text-xs text-muted-foreground">AML Rules</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rules..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'fraud', 'aml'] as const).map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="capitalize"
            >
              {cat === 'all' ? 'All Rules' : cat.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Rules list */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              'stat-card transition-all',
              !rule.isActive && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getRuleTypeIcon(rule.type)}</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <Badge variant="outline" className="capitalize">
                      {rule.category}
                    </Badge>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {rule.type}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={cn(
                        'text-xs',
                        rule.priority === 1 && 'border-destructive/30 text-destructive',
                        rule.priority === 2 && 'border-warning/30 text-warning',
                        rule.priority === 3 && 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      Priority {rule.priority}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{rule.description}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Condition: </span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {rule.condition}
                      </code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Threshold: </span>
                      <span className="font-semibold">{rule.threshold}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Triggered: </span>
                      <span className="font-semibold text-warning">{rule.triggeredCount.toLocaleString()} times</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rules;

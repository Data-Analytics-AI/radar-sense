import { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  BookOpen,
  ChevronRight,
  Clock,
  Shield,
  AlertTriangle,
  Globe,
  Cpu,
  Scale,
  Users,
  Activity,
  ClipboardList,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getAnalyticsData, type AnalyticsFilters } from '@/lib/analytics-data';
import { AnalyticsDrawer } from '@/components/analytics/AnalyticsDrawer';
import { FraudTab } from '@/components/analytics/FraudTab';
import { AMLTab } from '@/components/analytics/AMLTab';
import { ModelsTab } from '@/components/analytics/ModelsTab';
import { RulesTab } from '@/components/analytics/RulesTab';
import { GeographyTab } from '@/components/analytics/GeographyTab';
import { ChannelsTab } from '@/components/analytics/ChannelsTab';
import { UsersTab } from '@/components/analytics/UsersTab';
import { OperationsTab } from '@/components/analytics/OperationsTab';
import { AuditTab } from '@/components/analytics/AuditTab';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsFilters['timeRange']>('30d');
  const [channel, setChannel] = useState<AnalyticsFilters['channel']>('all');
  const [country, setCountry] = useState<AnalyticsFilters['country']>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const filters: AnalyticsFilters = { timeRange, channel, country };
  const data = useMemo(() => getAnalyticsData(filters), [timeRange, channel, country]);

  const [evidenceDrawer, setEvidenceDrawer] = useState<{ open: boolean; title: string; evidence: string; sections?: { label: string; value: string | number }[] }>({ open: false, title: '', evidence: '' });

  const handleExport = (format: string) => {
    toast({ title: `Export Started`, description: `Your ${format.toUpperCase()} report is being generated and will download shortly.` });
  };

  const priorityColor = (p: string) => p === 'high' ? 'text-destructive' : p === 'medium' ? 'text-warning' : 'text-primary';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Reporting
          </h1>
          <p className="text-muted-foreground">Performance metrics, trend analysis, and regulatory reporting</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
            {(['24h', '7d', '30d', '90d'] as const).map(r => (
              <Button key={r} variant={timeRange === r ? 'default' : 'ghost'} size="sm" className="text-xs h-7" onClick={() => setTimeRange(r)} data-testid={`button-range-${r}`}>
                {r}
              </Button>
            ))}
          </div>
          <Select value={channel} onValueChange={(v) => setChannel(v as AnalyticsFilters['channel'])}>
            <SelectTrigger className="w-[100px] h-8 text-xs" data-testid="select-channel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="pos">POS</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="atm">ATM</SelectItem>
              <SelectItem value="branch">Branch</SelectItem>
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[110px] h-8 text-xs" data-testid="select-country"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
              <SelectItem value="NG">Nigeria</SelectItem>
              <SelectItem value="RU">Russia</SelectItem>
              <SelectItem value="CN">China</SelectItem>
              <SelectItem value="BR">Brazil</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="pdf" onValueChange={handleExport}>
            <SelectTrigger className="w-[80px] h-8 text-xs" data-testid="select-export">
              <Download className="h-3 w-3 mr-1" /><SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated 12 min ago</span>
          </div>
        </div>
      </div>

      <div className="stat-card border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Executive Summary</h3>
          <Badge variant="secondary" className="text-xs ml-auto">{timeRange} window</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Key Insights</p>
            {data.executive.insights.map((item, i) => (
              <button key={i} className="flex items-start gap-2 text-sm w-full text-left hover:bg-muted/30 rounded-md p-1.5 -ml-1.5 transition-colors"
                data-testid={`insight-${i}`}
                onClick={() => setEvidenceDrawer({ open: true, title: item.text.slice(0, 60) + '...', evidence: item.evidence, sections: [{ label: 'Severity', value: item.severity }, { label: 'Key Metric', value: item.metric }] })}>
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                  item.severity === 'critical' && 'bg-destructive',
                  item.severity === 'warning' && 'bg-warning',
                  item.severity === 'info' && 'bg-primary'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs">{item.text}</p>
                  <span className="text-[10px] text-primary font-medium">{item.metric} · View evidence →</span>
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Recommended Actions</p>
            {data.executive.recommendedActions.map((action, i) => (
              <button key={i} className="flex items-center gap-2 text-xs w-full text-left hover:bg-muted/30 rounded-md p-2 transition-colors group"
                data-testid={`action-${i}`}
                onClick={() => navigate(action.linkTo)}>
                <div className={cn("w-1 h-6 rounded-full shrink-0", priorityColor(action.priority).replace('text-', 'bg-'))} />
                <span className="flex-1 text-muted-foreground">{action.text}</span>
                <Badge variant="outline" className={cn("text-[9px] shrink-0", priorityColor(action.priority))}>{action.priority}</Badge>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="fraud" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="fraud" className="text-xs gap-1" data-testid="tab-fraud"><Shield className="h-3 w-3" />Fraud</TabsTrigger>
            <TabsTrigger value="aml" className="text-xs gap-1" data-testid="tab-aml"><Scale className="h-3 w-3" />AML</TabsTrigger>
            <TabsTrigger value="models" className="text-xs gap-1" data-testid="tab-models"><Cpu className="h-3 w-3" />Models</TabsTrigger>
            <TabsTrigger value="rules" className="text-xs gap-1" data-testid="tab-rules"><FileText className="h-3 w-3" />Rules</TabsTrigger>
            <TabsTrigger value="geo" className="text-xs gap-1" data-testid="tab-geo"><Globe className="h-3 w-3" />Geography</TabsTrigger>
            <TabsTrigger value="channels" className="text-xs gap-1" data-testid="tab-channels"><Activity className="h-3 w-3" />Channels</TabsTrigger>
            <TabsTrigger value="users" className="text-xs gap-1" data-testid="tab-users"><Users className="h-3 w-3" />Users</TabsTrigger>
            <TabsTrigger value="operations" className="text-xs gap-1" data-testid="tab-ops"><ClipboardList className="h-3 w-3" />Operations</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs gap-1" data-testid="tab-audit"><AlertTriangle className="h-3 w-3" />Audit</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fraud"><FraudTab data={data.fraud} /></TabsContent>
        <TabsContent value="aml"><AMLTab data={data.aml} /></TabsContent>
        <TabsContent value="models"><ModelsTab data={data.models} /></TabsContent>
        <TabsContent value="rules"><RulesTab data={data.rules} /></TabsContent>
        <TabsContent value="geo"><GeographyTab data={data.geography} /></TabsContent>
        <TabsContent value="channels"><ChannelsTab data={data.channels} /></TabsContent>
        <TabsContent value="users"><UsersTab data={data.users} /></TabsContent>
        <TabsContent value="operations"><OperationsTab data={data.operations} /></TabsContent>
        <TabsContent value="audit"><AuditTab data={data.audit} /></TabsContent>
      </Tabs>

      <AnalyticsDrawer open={evidenceDrawer.open} onOpenChange={(o) => setEvidenceDrawer(prev => ({ ...prev, open: o }))}
        title={evidenceDrawer.title} subtitle="Evidence & Supporting Data"
        sections={evidenceDrawer.sections}>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">Supporting Evidence</p>
          <p className="text-xs text-foreground">{evidenceDrawer.evidence}</p>
        </div>
      </AnalyticsDrawer>
    </div>
  );
};

export default Analytics;

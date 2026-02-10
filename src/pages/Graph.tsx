import { useState, useRef, useCallback } from 'react';
import { 
  Network, 
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  User,
  CreditCard,
  Smartphone,
  Building2,
  Bot,
  Eye,
  EyeOff,
  Play,
  Pause,
  Download,
  Briefcase,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const networkStats = {
  totalNodes: 1247,
  totalEdges: 3891,
  communities: 23,
  riskClusters: 7,
  avgDegree: 6.2
};

const riskClusters = [
  { id: 'C1', name: 'High-Velocity Ring', nodes: 12, risk: 92, type: 'fraud' },
  { id: 'C2', name: 'Structuring Network', nodes: 8, risk: 87, type: 'aml' },
  { id: 'C3', name: 'Shared Device Cluster', nodes: 15, risk: 78, type: 'fraud' },
  { id: 'C4', name: 'Cross-Border Flow', nodes: 6, risk: 71, type: 'aml' },
  { id: 'C5', name: 'Mule Account Network', nodes: 9, risk: 85, type: 'fraud' },
];

const aiInsights = [
  { severity: 'critical', text: 'Circular transaction pattern detected between CUST-4521, ACC-7834, and Western Union', linkedNodes: ['C001', 'A001', 'M001'] },
  { severity: 'high', text: 'Shared device DEV-x8k2m used across 4 high-risk accounts in different jurisdictions', linkedNodes: ['D001'] },
  { severity: 'medium', text: 'MoneyGram node shows 3x increase in connection velocity over past 48h', linkedNodes: ['M002'] },
  { severity: 'info', text: 'New community detected — 3 accounts linked via common beneficiary in high-risk jurisdiction', linkedNodes: ['A003'] },
];

interface GraphNode {
  id: string;
  label: string;
  type: 'customer' | 'account' | 'device' | 'merchant';
  risk: 'low' | 'medium' | 'high' | 'critical';
  x: number;
  y: number;
  connections: number;
  transactions: number;
  amount: number;
  openCases: number;
}

const mockNodes: GraphNode[] = [
  { id: 'C001', label: 'CUST-4521', type: 'customer', risk: 'critical', x: 50, y: 50, connections: 12, transactions: 45, amount: 125000, openCases: 2 },
  { id: 'A001', label: 'ACC-7834', type: 'account', risk: 'high', x: 30, y: 30, connections: 8, transactions: 32, amount: 87000, openCases: 1 },
  { id: 'D001', label: 'DEV-x8k2m', type: 'device', risk: 'medium', x: 70, y: 25, connections: 5, transactions: 18, amount: 45000, openCases: 0 },
  { id: 'M001', label: 'Western Union', type: 'merchant', risk: 'high', x: 25, y: 60, connections: 15, transactions: 89, amount: 230000, openCases: 3 },
  { id: 'A002', label: 'ACC-2341', type: 'account', risk: 'low', x: 75, y: 70, connections: 3, transactions: 12, amount: 15000, openCases: 0 },
  { id: 'D002', label: 'DEV-m3n9p', type: 'device', risk: 'low', x: 60, y: 80, connections: 2, transactions: 8, amount: 8500, openCases: 0 },
  { id: 'C002', label: 'CUST-8932', type: 'customer', risk: 'medium', x: 20, y: 45, connections: 6, transactions: 24, amount: 52000, openCases: 1 },
  { id: 'M002', label: 'MoneyGram', type: 'merchant', risk: 'high', x: 85, y: 35, connections: 11, transactions: 67, amount: 178000, openCases: 2 },
  { id: 'A003', label: 'ACC-5567', type: 'account', risk: 'critical', x: 65, y: 85, connections: 9, transactions: 38, amount: 112000, openCases: 1 },
];

const edges = [
  { from: 'C001', to: 'A001' },
  { from: 'C001', to: 'D001' },
  { from: 'C001', to: 'M001' },
  { from: 'A001', to: 'M001' },
  { from: 'D001', to: 'M002' },
  { from: 'M001', to: 'C002' },
  { from: 'A002', to: 'D002' },
  { from: 'A002', to: 'A003' },
  { from: 'M002', to: 'A003' },
];

const getNodeColor = (risk: string) => {
  switch (risk) {
    case 'critical': return 'hsl(var(--destructive))';
    case 'high': return 'hsl(25 95% 53%)';
    case 'medium': return 'hsl(var(--warning))';
    default: return 'hsl(var(--success))';
  }
};

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'customer': return User;
    case 'account': return CreditCard;
    case 'device': return Smartphone;
    case 'merchant': return Building2;
    default: return User;
  }
};

const getNodeSize = (transactions: number) => {
  if (transactions > 60) return 20;
  if (transactions > 30) return 16;
  return 12;
};

const getBorderWidth = (risk: string) => {
  switch (risk) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    default: return 1;
  }
};

const Graph = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hideLowRisk, setHideLowRisk] = useState(false);
  const [depthLevel, setDepthLevel] = useState([3]);
  const [searchType, setSearchType] = useState<'all' | 'customer' | 'transaction' | 'case'>('all');
  const svgRef = useRef<SVGSVGElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'line') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  const filteredNodes = mockNodes.filter(node => {
    const matchSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRisk = hideLowRisk ? node.risk !== 'low' : true;
    return matchSearch && matchRisk;
  });

  const visibleEdges = edges.filter(edge => {
    return filteredNodes.some(n => n.id === edge.from) && filteredNodes.some(n => n.id === edge.to);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Graph Network Analysis
          </h1>
          <p className="text-muted-foreground">Visualize entity relationships and detect fraud rings</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setHideLowRisk(!hideLowRisk)}>
                {hideLowRisk ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{hideLowRisk ? 'Show low-risk nodes' : 'Hide low-risk nodes'}</TooltipContent>
          </Tooltip>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
          {(['all', 'customer', 'transaction', 'case'] as const).map(t => (
            <Button key={t} variant={searchType === t ? 'default' : 'ghost'} size="sm" className="text-xs h-7 capitalize" onClick={() => setSearchType(t)}>
              {t}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={`Search by ${searchType}...`}
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Depth:</span>
          <div className="w-24">
            <Slider value={depthLevel} onValueChange={setDepthLevel} min={1} max={5} step={1} />
          </div>
          <span className="font-mono w-4">{depthLevel[0]}</span>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold">{networkStats.totalNodes.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Nodes</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold">{networkStats.totalEdges.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold">{networkStats.communities}</p>
          <p className="text-xs text-muted-foreground">Communities</p>
        </div>
        <div className="stat-card text-center border-destructive/30">
          <p className="text-2xl font-bold text-destructive">{networkStats.riskClusters}</p>
          <p className="text-xs text-muted-foreground">Risk Clusters</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold">{networkStats.avgDegree}</p>
          <p className="text-xs text-muted-foreground">Avg Degree</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph visualization */}
        <div className="lg:col-span-3 stat-card h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Network Visualization</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                Create Case
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                Tag Cluster
              </Button>
            </div>
          </div>
          
          <div 
            className="flex-1 rounded-lg bg-muted/10 border border-border relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg 
              ref={svgRef}
              className="absolute inset-0 w-full h-full"
              style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            >
              {/* Edges */}
              <g stroke="hsl(var(--border))" strokeWidth="2" opacity="0.6">
                {visibleEdges.map((edge, i) => {
                  const fromNode = mockNodes.find(n => n.id === edge.from);
                  const toNode = mockNodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  const isHighRisk = fromNode.risk === 'critical' || toNode.risk === 'critical';
                  return (
                    <line 
                      key={i}
                      x1={`${fromNode.x}%`} y1={`${fromNode.y}%`} 
                      x2={`${toNode.x}%`} y2={`${toNode.y}%`}
                      stroke={isHighRisk ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}
                      opacity={isHighRisk ? 0.8 : 0.4}
                      strokeWidth={isHighRisk ? 2.5 : 1.5}
                    />
                  );
                })}
              </g>
              
              {/* Nodes */}
              <g>
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  const size = getNodeSize(node.transactions);
                  const borderW = getBorderWidth(node.risk);
                  return (
                    <g key={node.id} className="cursor-pointer" onClick={() => setSelectedNode(node)}>
                      {isSelected && (
                        <circle cx={`${node.x}%`} cy={`${node.y}%`} r={size + 8} fill="none" stroke={getNodeColor(node.risk)} strokeWidth={2} opacity={0.4} className="animate-pulse" />
                      )}
                      <circle 
                        cx={`${node.x}%`} cy={`${node.y}%`} 
                        r={size}
                        fill={getNodeColor(node.risk)}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? 'hsl(var(--foreground))' : getNodeColor(node.risk)}
                        strokeWidth={borderW}
                      />
                      {node.openCases > 0 && (
                        <g>
                          <circle cx={`${node.x + 2}%`} cy={`${node.y - 3}%`} r={7} fill="hsl(var(--destructive))" />
                          <text x={`${node.x + 2}%`} y={`${node.y - 3}%`} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" className="pointer-events-none">{node.openCases}</text>
                        </g>
                      )}
                      <text x={`${node.x}%`} y={`${node.y + 5}%`} textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" className="pointer-events-none">{node.label}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
            
            {/* Node Details Panel */}
            {selectedNode && (
              <Card className="absolute top-4 right-4 w-72 p-4 bg-card/95 backdrop-blur-sm shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = getNodeIcon(selectedNode.type); return <Icon className="h-4 w-4 text-primary" />; })()}
                    <span className="font-medium text-sm">{selectedNode.label}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize text-xs">{selectedNode.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <Badge variant="outline" className={cn("capitalize text-xs",
                      selectedNode.risk === 'critical' && 'border-destructive/30 text-destructive',
                      selectedNode.risk === 'high' && 'border-risk-high/30 text-risk-high',
                      selectedNode.risk === 'medium' && 'border-warning/30 text-warning',
                      selectedNode.risk === 'low' && 'border-success/30 text-success'
                    )}>{selectedNode.risk}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span>{selectedNode.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transactions</span>
                    <span>{selectedNode.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-mono">${selectedNode.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Cases</span>
                    <span className={selectedNode.openCases > 0 ? 'text-destructive font-medium' : ''}>{selectedNode.openCases}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 text-xs">Investigate</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">Create Case</Button>
                </div>
              </Card>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-xs flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium">Risk:</span>
              {[
                { label: 'Low', cls: 'bg-success' },
                { label: 'Medium', cls: 'bg-warning' },
                { label: 'High', cls: 'bg-risk-high' },
                { label: 'Critical', cls: 'bg-destructive' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-3 rounded-full', r.cls)} />
                  <span className="text-muted-foreground">{r.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium">Type:</span>
              {[
                { label: 'Customer', Icon: User },
                { label: 'Account', Icon: CreditCard },
                { label: 'Device', Icon: Smartphone },
                { label: 'Merchant', Icon: Building2 },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1.5">
                  <t.Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Network Insights</h3>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className={cn(
                  "p-2.5 rounded-lg border text-xs cursor-pointer hover:bg-muted/50 transition-colors",
                  insight.severity === 'critical' && 'border-destructive/30 bg-destructive/5',
                  insight.severity === 'high' && 'border-warning/30 bg-warning/5',
                  insight.severity === 'medium' && 'border-primary/20 bg-primary/5',
                  insight.severity === 'info' && 'border-border'
                )}>
                  <div className="flex items-start gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      insight.severity === 'critical' && 'bg-destructive',
                      insight.severity === 'high' && 'bg-warning',
                      insight.severity === 'medium' && 'bg-primary',
                      insight.severity === 'info' && 'bg-muted-foreground'
                    )} />
                    <p className="text-muted-foreground leading-relaxed">{insight.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-2 ml-3.5">
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span className="text-primary text-xs">View in graph</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Clusters */}
          <div className="stat-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Risk Clusters</h3>
            <div className="space-y-2">
              {riskClusters.map((cluster) => (
                <div key={cluster.id} className="p-2.5 rounded-lg bg-muted/30 border border-border hover:border-primary/50 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-xs">{cluster.name}</p>
                      <p className="text-xs text-muted-foreground">{cluster.nodes} nodes</p>
                    </div>
                    <Badge variant="outline" className={cn('text-xs', cluster.risk >= 80 ? 'border-destructive/30 text-destructive' : 'border-warning/30 text-warning')}>
                      {cluster.risk}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">{cluster.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;

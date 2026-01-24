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
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Simulated network data
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
}

const mockNodes: GraphNode[] = [
  { id: 'C001', label: 'CUST-4521', type: 'customer', risk: 'critical', x: 50, y: 50, connections: 12, transactions: 45, amount: 125000 },
  { id: 'A001', label: 'ACC-7834', type: 'account', risk: 'high', x: 30, y: 30, connections: 8, transactions: 32, amount: 87000 },
  { id: 'D001', label: 'DEV-x8k2m', type: 'device', risk: 'medium', x: 70, y: 25, connections: 5, transactions: 18, amount: 45000 },
  { id: 'M001', label: 'Western Union', type: 'merchant', risk: 'high', x: 25, y: 60, connections: 15, transactions: 89, amount: 230000 },
  { id: 'A002', label: 'ACC-2341', type: 'account', risk: 'low', x: 75, y: 70, connections: 3, transactions: 12, amount: 15000 },
  { id: 'D002', label: 'DEV-m3n9p', type: 'device', risk: 'low', x: 60, y: 80, connections: 2, transactions: 8, amount: 8500 },
  { id: 'C002', label: 'CUST-8932', type: 'customer', risk: 'medium', x: 20, y: 45, connections: 6, transactions: 24, amount: 52000 },
  { id: 'M002', label: 'MoneyGram', type: 'merchant', risk: 'high', x: 85, y: 35, connections: 11, transactions: 67, amount: 178000 },
  { id: 'A003', label: 'ACC-5567', type: 'account', risk: 'critical', x: 65, y: 85, connections: 9, transactions: 38, amount: 112000 },
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

const Graph = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const filteredNodes = mockNodes.filter(node => 
    node.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleZoomOut}
            className="hover:bg-muted active:scale-95 transition-all"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleZoomIn}
            className="hover:bg-muted active:scale-95 transition-all"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleReset}
            className="hover:bg-muted active:scale-95 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card text-center hover:border-primary/30 transition-colors cursor-default">
          <p className="text-2xl font-bold">{networkStats.totalNodes.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Nodes</p>
        </div>
        <div className="stat-card text-center hover:border-primary/30 transition-colors cursor-default">
          <p className="text-2xl font-bold">{networkStats.totalEdges.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </div>
        <div className="stat-card text-center hover:border-primary/30 transition-colors cursor-default">
          <p className="text-2xl font-bold">{networkStats.communities}</p>
          <p className="text-xs text-muted-foreground">Communities</p>
        </div>
        <div className="stat-card text-center border-destructive/30 hover:border-destructive/50 transition-colors cursor-default">
          <p className="text-2xl font-bold text-destructive">{networkStats.riskClusters}</p>
          <p className="text-xs text-muted-foreground">Risk Clusters</p>
        </div>
        <div className="stat-card text-center hover:border-primary/30 transition-colors cursor-default">
          <p className="text-2xl font-bold">{networkStats.avgDegree}</p>
          <p className="text-xs text-muted-foreground">Avg Degree</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph visualization */}
        <div className="lg:col-span-2 stat-card h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Network Visualization</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search entity..." 
                  className="pl-9 h-8 text-sm" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="hover:bg-muted active:scale-95 transition-all">
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          
          {/* Interactive Graph */}
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
              <defs>
                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              
              {/* Edges */}
              <g stroke="hsl(var(--border))" strokeWidth="2" opacity="0.6">
                {edges.map((edge, i) => {
                  const fromNode = mockNodes.find(n => n.id === edge.from);
                  const toNode = mockNodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <line 
                      key={i}
                      x1={`${fromNode.x}%`} 
                      y1={`${fromNode.y}%`} 
                      x2={`${toNode.x}%`} 
                      y2={`${toNode.y}%`}
                      className="transition-opacity hover:opacity-100"
                    />
                  );
                })}
              </g>
              
              {/* Nodes */}
              <g>
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <g 
                      key={node.id}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => handleNodeClick(node)}
                    >
                      <circle 
                        cx={`${node.x}%`} 
                        cy={`${node.y}%`} 
                        r={isSelected ? 18 : 14}
                        fill={getNodeColor(node.risk)}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? 'hsl(var(--foreground))' : 'none'}
                        strokeWidth={2}
                        className="transition-all"
                      />
                      {isSelected && (
                        <circle 
                          cx={`${node.x}%`} 
                          cy={`${node.y}%`} 
                          r={24}
                          fill="none"
                          stroke={getNodeColor(node.risk)}
                          strokeWidth={2}
                          opacity={0.5}
                          className="animate-pulse"
                        />
                      )}
                      <text
                        x={`${node.x}%`}
                        y={`${node.y + 6}%`}
                        textAnchor="middle"
                        fontSize="10"
                        fill="hsl(var(--foreground))"
                        className="pointer-events-none"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
            
            {/* Node Details Panel */}
            {selectedNode && (
              <Card className="absolute top-4 right-4 w-64 p-4 bg-card/95 backdrop-blur-sm shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getNodeIcon(selectedNode.type);
                      return <Icon className="h-4 w-4 text-primary" />;
                    })()}
                    <span className="font-medium text-sm">{selectedNode.label}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setSelectedNode(null)}
                  >
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
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize text-xs",
                        selectedNode.risk === 'critical' && 'border-destructive/30 text-destructive',
                        selectedNode.risk === 'high' && 'border-risk-high/30 text-risk-high',
                        selectedNode.risk === 'medium' && 'border-warning/30 text-warning',
                        selectedNode.risk === 'low' && 'border-success/30 text-success'
                      )}
                    >
                      {selectedNode.risk}
                    </Badge>
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
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  View Full Details
                </Button>
              </Card>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-risk-high" />
              <span className="text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Critical</span>
            </div>
          </div>
        </div>
        
        {/* Risk clusters sidebar */}
        <div className="stat-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Detected Risk Clusters</h3>
          <div className="space-y-3">
            {riskClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{cluster.name}</p>
                    <p className="text-xs text-muted-foreground">{cluster.nodes} nodes</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cluster.risk >= 80 
                      ? 'border-destructive/30 text-destructive' 
                      : 'border-warning/30 text-warning'
                    }
                  >
                    {cluster.risk}
                  </Badge>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {cluster.type}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Graph Metrics</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clustering Coefficient</span>
                <span>0.42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Density</span>
                <span>0.0025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Path Length</span>
                <span>4.7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;

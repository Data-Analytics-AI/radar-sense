import { useMemo } from 'react';
import { 
  Network, 
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

const Graph = () => {
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
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph visualization placeholder */}
        <div className="lg:col-span-2 stat-card h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Network Visualization</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search entity..." className="pl-9 h-8 text-sm" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          
          {/* Placeholder for D3 visualization */}
          <div className="flex-1 rounded-lg bg-muted/20 border border-border flex items-center justify-center relative overflow-hidden">
            {/* Simulated network nodes */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              
              {/* Simulated edges */}
              <g stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5">
                <line x1="50%" y1="50%" x2="30%" y2="30%" />
                <line x1="50%" y1="50%" x2="70%" y2="25%" />
                <line x1="50%" y1="50%" x2="25%" y2="60%" />
                <line x1="50%" y1="50%" x2="75%" y2="70%" />
                <line x1="50%" y1="50%" x2="60%" y2="80%" />
                <line x1="30%" y1="30%" x2="20%" y2="45%" />
                <line x1="70%" y1="25%" x2="85%" y2="35%" />
                <line x1="75%" y1="70%" x2="65%" y2="85%" />
              </g>
              
              {/* Simulated nodes */}
              <g>
                <circle cx="50%" cy="50%" r="20" fill="url(#nodeGradient)" className="animate-pulse" />
                <circle cx="30%" cy="30%" r="12" fill="hsl(var(--success))" opacity="0.8" />
                <circle cx="70%" cy="25%" r="15" fill="hsl(var(--warning))" opacity="0.8" />
                <circle cx="25%" cy="60%" r="10" fill="hsl(var(--success))" opacity="0.8" />
                <circle cx="75%" cy="70%" r="14" fill="hsl(var(--destructive))" opacity="0.8" />
                <circle cx="60%" cy="80%" r="8" fill="hsl(var(--success))" opacity="0.8" />
                <circle cx="20%" cy="45%" r="8" fill="hsl(var(--success))" opacity="0.8" />
                <circle cx="85%" cy="35%" r="10" fill="hsl(var(--warning))" opacity="0.8" />
                <circle cx="65%" cy="85%" r="12" fill="hsl(var(--destructive))" opacity="0.8" />
              </g>
            </svg>
            
            <div className="relative z-10 text-center">
              <Network className="h-16 w-16 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Interactive D3.js visualization
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click nodes to explore connections
              </p>
            </div>
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
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Selected</span>
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
                className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/50 cursor-pointer transition-colors"
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

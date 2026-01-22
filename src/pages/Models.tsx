import { useMemo } from 'react';
import { 
  Brain, 
  Play,
  TrendingUp,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateModels } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

const Models = () => {
  const models = useMemo(() => generateModels(), []);
  
  const activeModel = models.find(m => m.isActive && m.type !== 'isolation_forest');
  
  const radarData = [
    { metric: 'Accuracy', ...Object.fromEntries(models.map(m => [m.name.split(' ')[0], m.metrics.accuracy * 100])) },
    { metric: 'Precision', ...Object.fromEntries(models.map(m => [m.name.split(' ')[0], m.metrics.precision * 100])) },
    { metric: 'Recall', ...Object.fromEntries(models.map(m => [m.name.split(' ')[0], m.metrics.recall * 100])) },
    { metric: 'F1-Score', ...Object.fromEntries(models.map(m => [m.name.split(' ')[0], m.metrics.f1Score * 100])) },
    { metric: 'AUC-ROC', ...Object.fromEntries(models.map(m => [m.name.split(' ')[0], m.metrics.aucRoc * 100])) },
  ];
  
  const getModelIcon = (type: string) => {
    switch (type) {
      case 'logistic_regression':
        return '📈';
      case 'random_forest':
        return '🌲';
      case 'xgboost':
        return '🚀';
      case 'isolation_forest':
        return '🔍';
      case 'autoencoder':
        return '🧠';
      default:
        return '⚙️';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Model Performance
          </h1>
          <p className="text-muted-foreground">Monitor and manage ML models</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retrain Models
        </Button>
      </div>
      
      {/* Active model highlight */}
      {activeModel && (
        <div className="stat-card border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{getModelIcon(activeModel.type)}</span>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {activeModel.name}
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">Version {activeModel.version}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
              <p className="text-2xl font-bold">{(activeModel.metrics.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Precision</p>
              <p className="text-2xl font-bold">{(activeModel.metrics.precision * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recall</p>
              <p className="text-2xl font-bold">{(activeModel.metrics.recall * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">F1-Score</p>
              <p className="text-2xl font-bold">{(activeModel.metrics.f1Score * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">AUC-ROC</p>
              <p className="text-2xl font-bold">{(activeModel.metrics.aucRoc * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Radar chart comparison */}
      <div className="stat-card h-[400px]">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Model Performance Comparison</h3>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[70, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Logistic"
              dataKey="Logistic"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.2}
            />
            <Radar
              name="Random"
              dataKey="Random"
              stroke="hsl(var(--chart-5))"
              fill="hsl(var(--chart-5))"
              fillOpacity={0.2}
            />
            <Radar
              name="XGBoost"
              dataKey="XGBoost"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* All models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className={cn(
              'stat-card',
              model.isActive && 'border-primary/30'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getModelIcon(model.type)}</span>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {model.name}
                    {model.isActive && (
                      <Badge variant="outline" className="border-success/30 text-success text-xs">
                        Active
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Version {model.version} • Trained {format(new Date(model.trainedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              {!model.isActive && (
                <Button variant="outline" size="sm">
                  <Play className="h-3 w-3 mr-1" />
                  Activate
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Precision</p>
                  <div className="flex items-center gap-2">
                    <Progress value={model.metrics.precision * 100} className="h-2 flex-1" />
                    <span className="font-mono text-xs">{(model.metrics.precision * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Recall</p>
                  <div className="flex items-center gap-2">
                    <Progress value={model.metrics.recall * 100} className="h-2 flex-1" />
                    <span className="font-mono text-xs">{(model.metrics.recall * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">F1-Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={model.metrics.f1Score * 100} className="h-2 flex-1" />
                    <span className="font-mono text-xs">{(model.metrics.f1Score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Training data: {model.trainingDataSize.toLocaleString()} samples</span>
                <span>{model.featuresUsed.length} features</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Models;

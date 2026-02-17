import { Alert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RiskScoreBadge } from '@/components/dashboard/RiskScoreBadge';
import { AlertStatusBadge } from '@/components/dashboard/AlertStatusBadge';
import {
  Briefcase, AlertTriangle, Clock, Hash, User,
  UserPlus, ArrowUpRight, MessageSquare, FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface AlertDetailsPanelProps {
  alert: Alert;
}

function DetailRow({ label, value, icon: Icon, mono = false }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
        {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
        <span>{label}</span>
      </div>
      <span className={cn('text-sm text-right', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}

export function AlertDetailsPanel({ alert }: AlertDetailsPanelProps) {
  return (
    <div className="space-y-5" data-testid="alert-details-panel">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Alert Summary</h3>
        <DetailRow label="Alert ID" value={alert.id} icon={Hash} mono />
        <DetailRow
          label="Type"
          value={<Badge variant="outline" className="text-xs capitalize">{alert.type}</Badge>}
        />
        <div className="flex items-start justify-between gap-2 py-1.5">
          <span className="text-xs text-muted-foreground">Severity</span>
          <RiskScoreBadge score={alert.riskScore} level={alert.severity} size="sm" />
        </div>
        <div className="flex items-start justify-between gap-2 py-1.5">
          <span className="text-xs text-muted-foreground">Status</span>
          <AlertStatusBadge status={alert.status} />
        </div>
        <DetailRow
          label="Created"
          value={format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm:ss')}
          icon={Clock}
        />
        <DetailRow
          label="Updated"
          value={formatDistanceToNow(new Date(alert.updatedAt), { addSuffix: true })}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Description</h3>
        <p className="text-sm text-foreground">{alert.description}</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Linked Entities</h3>
        <DetailRow label="Transaction ID" value={alert.transactionId} icon={FileText} mono />
        <DetailRow label="Customer ID" value={alert.customerId} icon={User} mono />
        <DetailRow label="Model Version" value={alert.modelVersion} mono />
        {alert.ruleIds.length > 0 && (
          <div className="py-1.5">
            <span className="text-xs text-muted-foreground block mb-1">Rules Triggered</span>
            <div className="flex flex-wrap gap-1">
              {alert.ruleIds.map((ruleId) => (
                <Badge key={ruleId} variant="outline" className="text-xs font-mono">{ruleId}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {alert.contributingFactors.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Contributing Factors ({alert.contributingFactors.length})
            </h3>
            <div className="space-y-1.5">
              {alert.contributingFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Investigation Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Alert Created</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
          {alert.assignedTo && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-warning mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Assigned to {alert.assignedTo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
          {alert.status !== 'open' && (
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                alert.status === 'under_investigation' && 'bg-warning',
                alert.status === 'escalated' && 'bg-orange-500',
                alert.status === 'closed' && 'bg-muted-foreground',
              )} />
              <div>
                <p className="text-sm font-medium capitalize">
                  Status: {alert.status.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2 pb-4">
        <Button size="sm" variant="outline" data-testid="button-assign-alert">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign
        </Button>
        <Button size="sm" variant="outline" data-testid="button-escalate-alert">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Escalate
        </Button>
        <Button size="sm" variant="outline" data-testid="button-create-case-from-alert">
          <Briefcase className="h-4 w-4 mr-2" />
          Create Case
        </Button>
        <Button size="sm" variant="outline" data-testid="button-add-note">
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  action: 'promote' | 'rollback' | 'threshold';
  modelName: string;
  details?: string;
}

const actionConfig = {
  promote: { title: 'Promote to Production', description: 'This will deploy the model to production and route live traffic to it.', buttonLabel: 'Confirm Promote', variant: 'default' as const },
  rollback: { title: 'Rollback Model', description: 'This will revert to the previous production model version. Current model will be moved to staging.', buttonLabel: 'Confirm Rollback', variant: 'destructive' as const },
  threshold: { title: 'Change Threshold', description: 'Adjusting the scoring threshold will impact alert volume and detection rates in production.', buttonLabel: 'Confirm Change', variant: 'default' as const },
};

export default function ConfirmActionDialog({ open, onClose, action, modelName, details }: ConfirmActionDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const config = actionConfig[action];

  const handleConfirm = () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: `${config.title} completed`,
        description: `${modelName}: action logged to audit trail.`,
      });
      setReason('');
      onClose();
    }, 1500);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent data-testid={`confirm-${action}-dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {config.description}
            {details && <span className="block mt-1 text-foreground font-medium">{details}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label>Reason (required)</Label>
          <Textarea
            placeholder="Provide a reason for this action..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
            data-testid={`input-${action}-reason`}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid={`button-cancel-${action}`}>Cancel</AlertDialogCancel>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={submitting || !reason.trim()}
            data-testid={`button-confirm-${action}`}
          >
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : config.buttonLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

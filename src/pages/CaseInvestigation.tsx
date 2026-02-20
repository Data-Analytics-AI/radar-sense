import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft, Clock, User, Tag, FileText, Plus, Download, Upload,
  Shield, AlertTriangle, CheckCircle2, Circle, Building2, UserCircle,
  FileSignature, Receipt, Wallet, Users, Image, Database, Mail,
  FileBarChart, MessageSquare, ChevronDown, ChevronUp, ExternalLink,
  Eye, Link2, Paperclip, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getCachedMockData } from '@/lib/mock-data';
import type {
  Case, CaseStatus, CaseNote, CaseTimelineEvent, LinkedEntity,
  LinkedEntityType, Evidence, EvidenceFileType, EvidenceSourceType,
  EvidenceCustodyEntry, CaseResolution, RiskLevel
} from '@/types';

const genId = () => 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getStatusColor = (status: CaseStatus) => {
  switch (status) {
    case 'open': return 'bg-primary/20 text-primary border-primary/30';
    case 'in_review': return 'bg-warning/20 text-warning border-warning/30';
    case 'escalated': return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'closed': return 'bg-success/20 text-success border-success/30';
  }
};

const getPriorityColor = (priority: RiskLevel) => {
  switch (priority) {
    case 'low': return 'bg-success/20 text-success border-success/30';
    case 'medium': return 'bg-warning/20 text-warning border-warning/30';
    case 'high': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
  }
};

const getTimelineDotColor = (type: string) => {
  switch (type) {
    case 'alert_triggered': return 'bg-red-500';
    case 'case_created': return 'bg-blue-500';
    case 'assigned': return 'bg-green-500';
    case 'status_change': return 'bg-amber-500';
    case 'evidence_added': return 'bg-purple-500';
    case 'note_added': return 'bg-gray-400';
    case 'entity_linked': return 'bg-cyan-500';
    case 'escalated': return 'bg-orange-500';
    case 'resolution': return 'bg-emerald-500';
    default: return 'bg-gray-400';
  }
};

const getEntityIcon = (type: LinkedEntityType) => {
  switch (type) {
    case 'vendor': return Building2;
    case 'employee': return UserCircle;
    case 'contract': return FileSignature;
    case 'invoice': return Receipt;
    case 'account': return Wallet;
    case 'customer': return Users;
  }
};

const getEvidenceIcon = (type: EvidenceFileType) => {
  switch (type) {
    case 'document': return FileText;
    case 'screenshot': return Image;
    case 'transaction_log': return Database;
    case 'email': return Mail;
    case 'report': return FileBarChart;
    default: return FileText;
  }
};

const getSourceBadge = (source: EvidenceSourceType) => {
  switch (source) {
    case 'system_generated': return { label: 'System', className: 'bg-blue-500/20 text-blue-600 border-blue-500/30' };
    case 'manual_upload': return { label: 'Manual', className: 'bg-green-500/20 text-green-600 border-green-500/30' };
    case 'external_feed': return { label: 'External', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' };
  }
};

const CaseInvestigation = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialCase = useMemo(() => {
    const data = getCachedMockData();
    return data.cases.find(c => c.id === caseId) || null;
  }, [caseId]);

  const [caseData, setCaseData] = useState<Case | null>(initialCase);
  const [activeTab, setActiveTab] = useState('timeline');
  const [expandedCustody, setExpandedCustody] = useState<Record<string, boolean>>({});
  const [linkEntityOpen, setLinkEntityOpen] = useState(false);
  const [uploadEvidenceOpen, setUploadEvidenceOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({ type: 'vendor' as LinkedEntityType, name: '', reference: '', relationship: '', notes: '' });
  const [newEvidence, setNewEvidence] = useState({ fileName: '', fileType: 'document' as EvidenceFileType, description: '', tags: '', source: 'manual_upload' as EvidenceSourceType });
  const [newNote, setNewNote] = useState({ content: '', type: 'comment' as 'comment' | 'evidence' | 'action_taken', mentions: '' });

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Case Not Found</h2>
        <p className="text-muted-foreground">The case "{caseId}" could not be located.</p>
        <Button onClick={() => navigate('/cases')} data-testid="button-back-to-cases">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (newStatus === caseData.status) return;
    const now = new Date().toISOString();
    const timelineEvent: CaseTimelineEvent = {
      id: genId(),
      type: 'status_change',
      title: `Status changed to ${newStatus.replace('_', ' ')}`,
      description: `Case status updated from ${caseData.status.replace('_', ' ')} to ${newStatus.replace('_', ' ')}`,
      performedBy: 'Current Analyst',
      timestamp: now,
      metadata: { from: caseData.status, to: newStatus }
    };
    const auditNote: CaseNote = {
      id: genId(),
      caseId: caseData.id,
      authorId: 'current-analyst',
      authorName: 'Current Analyst',
      content: `Status changed from "${caseData.status.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}"`,
      timestamp: now,
      type: 'action_taken'
    };
    setCaseData(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: now,
      timeline: [...prev.timeline, timelineEvent],
      notes: [auditNote, ...prev.notes]
    }));
    toast({ title: 'Status Updated', description: `Case status changed to ${newStatus.replace('_', ' ')}` });
  };

  const handleAddEntity = () => {
    if (!newEntity.name || !newEntity.reference || !newEntity.relationship) return;
    const now = new Date().toISOString();
    const entity: LinkedEntity = {
      id: genId(),
      type: newEntity.type,
      name: newEntity.name,
      reference: newEntity.reference,
      relationship: newEntity.relationship,
      addedBy: 'Current Analyst',
      addedAt: now,
      notes: newEntity.notes || undefined
    };
    const timelineEvent: CaseTimelineEvent = {
      id: genId(),
      type: 'entity_linked',
      title: `Entity linked: ${newEntity.name}`,
      description: `${newEntity.type} entity linked to case`,
      performedBy: 'Current Analyst',
      timestamp: now
    };
    setCaseData(prev => ({
      ...prev,
      linkedEntities: [...prev.linkedEntities, entity],
      timeline: [...prev.timeline, timelineEvent],
      updatedAt: now
    }));
    setNewEntity({ type: 'vendor', name: '', reference: '', relationship: '', notes: '' });
    setLinkEntityOpen(false);
    toast({ title: 'Entity Linked', description: `${entity.name} added to case` });
  };

  const handleUploadEvidence = () => {
    if (!newEvidence.fileName || !newEvidence.description) return;
    const now = new Date().toISOString();
    const evidence: Evidence = {
      id: genId(),
      caseId: caseData.id,
      fileName: newEvidence.fileName,
      fileType: newEvidence.fileType,
      fileSize: Math.floor(Math.random() * 2000000) + 10000,
      mimeType: 'application/octet-stream',
      source: newEvidence.source,
      sourceAttribution: 'Current Analyst',
      tags: newEvidence.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: newEvidence.description,
      uploadedBy: 'Current Analyst',
      uploadedAt: now,
      custodyChain: [{ action: 'uploaded', performedBy: 'Current Analyst', timestamp: now, details: 'Initial upload' }]
    };
    const timelineEvent: CaseTimelineEvent = {
      id: genId(),
      type: 'evidence_added',
      title: `Evidence added: ${newEvidence.fileName}`,
      description: `New ${newEvidence.fileType} evidence uploaded`,
      performedBy: 'Current Analyst',
      timestamp: now
    };
    setCaseData(prev => ({
      ...prev,
      evidence: [...prev.evidence, evidence],
      timeline: [...prev.timeline, timelineEvent],
      updatedAt: now
    }));
    setNewEvidence({ fileName: '', fileType: 'document', description: '', tags: '', source: 'manual_upload' });
    setUploadEvidenceOpen(false);
    toast({ title: 'Evidence Uploaded', description: `${evidence.fileName} added to case` });
  };

  const handleAddNote = () => {
    if (!newNote.content) return;
    const now = new Date().toISOString();
    const note: CaseNote = {
      id: genId(),
      caseId: caseData.id,
      authorId: 'current-analyst',
      authorName: 'Current Analyst',
      content: newNote.content,
      timestamp: now,
      type: newNote.type,
      mentions: newNote.mentions ? newNote.mentions.split(',').map(m => m.trim()).filter(Boolean) : undefined
    };
    const timelineEvent: CaseTimelineEvent = {
      id: genId(),
      type: 'note_added',
      title: 'Note added',
      description: newNote.content.substring(0, 80) + (newNote.content.length > 80 ? '...' : ''),
      performedBy: 'Current Analyst',
      timestamp: now
    };
    setCaseData(prev => ({
      ...prev,
      notes: [note, ...prev.notes],
      timeline: [...prev.timeline, timelineEvent],
      updatedAt: now
    }));
    setNewNote({ content: '', type: 'comment', mentions: '' });
    toast({ title: 'Note Added', description: 'Your note has been posted' });
  };

  const handleRemoveTag = (evidenceId: string, tagToRemove: string) => {
    setCaseData(prev => ({
      ...prev,
      evidence: prev.evidence.map(e =>
        e.id === evidenceId ? { ...e, tags: e.tags.filter(t => t !== tagToRemove) } : e
      )
    }));
  };

  const handleAddTag = (evidenceId: string, newTag: string) => {
    if (!newTag.trim()) return;
    const now = new Date().toISOString();
    setCaseData(prev => ({
      ...prev,
      evidence: prev.evidence.map(e =>
        e.id === evidenceId
          ? {
              ...e,
              tags: [...e.tags, newTag.trim()],
              custodyChain: [...e.custodyChain, { action: 'tagged' as const, performedBy: 'Current Analyst', timestamp: now, details: `Tag added: ${newTag.trim()}` }]
            }
          : e
      )
    }));
  };

  const exportCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: `${filename} downloaded` });
  };

  const exportPDF = () => {
    const html = `<!DOCTYPE html><html><head><title>Case Report - ${caseData.id}</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto}h1{color:#1a1a2e}h2{border-bottom:2px solid #e0e0e0;padding-bottom:8px;margin-top:32px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;margin:2px}.meta{color:#666;font-size:14px}</style></head><body>
<h1>Case Investigation Report</h1>
<p class="meta">Generated: ${format(new Date(), 'PPpp')}</p>
<h2>Case Details</h2>
<table><tr><th>Case ID</th><td>${caseData.id}</td></tr><tr><th>Status</th><td>${caseData.status.replace('_', ' ')}</td></tr><tr><th>Priority</th><td>${caseData.priority}</td></tr><tr><th>Type</th><td>${caseData.type}</td></tr><tr><th>Customer</th><td>${caseData.customerId}</td></tr><tr><th>Assigned To</th><td>${caseData.assignedTo || 'Unassigned'}</td></tr><tr><th>Created</th><td>${format(new Date(caseData.createdAt), 'PPpp')}</td></tr><tr><th>Description</th><td>${caseData.description || 'N/A'}</td></tr><tr><th>Tags</th><td>${caseData.tags.join(', ')}</td></tr></table>
${caseData.resolution ? `<h2>Resolution</h2><table><tr><th>Outcome</th><td>${caseData.resolution.outcome.replace(/_/g, ' ')}</td></tr><tr><th>Summary</th><td>${caseData.resolution.summary}</td></tr><tr><th>Resolved By</th><td>${caseData.resolution.resolvedBy}</td></tr><tr><th>Resolved At</th><td>${format(new Date(caseData.resolution.resolvedAt), 'PPpp')}</td></tr>${caseData.resolution.sarFiled ? `<tr><th>SAR Filed</th><td>Yes - ${caseData.resolution.sarReference || 'N/A'}</td></tr>` : ''}</table>` : ''}
<h2>Timeline (${caseData.timeline.length} events)</h2>
<table><tr><th>Time</th><th>Type</th><th>Title</th><th>Description</th><th>By</th></tr>${caseData.timeline.map(e => `<tr><td>${format(new Date(e.timestamp), 'PPpp')}</td><td>${e.type}</td><td>${e.title}</td><td>${e.description}</td><td>${e.performedBy}</td></tr>`).join('')}</table>
<h2>Evidence (${caseData.evidence.length} items)</h2>
<table><tr><th>File</th><th>Type</th><th>Size</th><th>Source</th><th>Uploaded By</th><th>Uploaded At</th></tr>${caseData.evidence.map(e => `<tr><td>${e.fileName}</td><td>${e.fileType}</td><td>${formatFileSize(e.fileSize)}</td><td>${e.source}</td><td>${e.uploadedBy}</td><td>${format(new Date(e.uploadedAt), 'PPpp')}</td></tr>`).join('')}</table>
<h2>Linked Entities (${caseData.linkedEntities.length})</h2>
<table><tr><th>Name</th><th>Type</th><th>Reference</th><th>Relationship</th><th>Risk</th></tr>${caseData.linkedEntities.map(e => `<tr><td>${e.name}</td><td>${e.type}</td><td>${e.reference}</td><td>${e.relationship}</td><td>${e.riskIndicator || 'N/A'}</td></tr>`).join('')}</table>
<h2>Notes (${caseData.notes.length})</h2>
${caseData.notes.map(n => `<div style="border:1px solid #eee;padding:12px;margin:8px 0;border-radius:4px"><p class="meta">${n.authorName} - ${format(new Date(n.timestamp), 'PPpp')} [${n.type}]</p><p>${n.content}</p></div>`).join('')}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    toast({ title: 'Report Generated', description: 'Full case report opened in new tab' });
  };

  const sortedTimeline = [...caseData.timeline].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const sortedNotes = [...caseData.notes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const statuses: { value: CaseStatus; label: string; icon: typeof Circle }[] = [
    { value: 'open', label: 'Open', icon: Circle },
    { value: 'in_review', label: 'In Review', icon: Eye },
    { value: 'escalated', label: 'Escalated', icon: AlertTriangle },
    { value: 'closed', label: 'Closed', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cases')} data-testid="button-back">
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-mono" data-testid="text-case-id">{caseData.id}</h1>
              {caseData.description && (
                <p className="text-sm text-muted-foreground mt-1" data-testid="text-case-description">{caseData.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', getStatusColor(caseData.status))} data-testid="badge-status">
                  {caseData.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={cn('text-xs capitalize', getPriorityColor(caseData.priority))} data-testid="badge-priority">
                  {caseData.priority}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize" data-testid="badge-type">
                  {caseData.type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportPDF} data-testid="button-export-pdf">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(
              `${caseData.id}_timeline.csv`,
              ['ID', 'Type', 'Title', 'Description', 'Performed By', 'Timestamp'],
              caseData.timeline.map(e => [e.id, e.type, e.title, e.description, e.performedBy, e.timestamp])
            )} data-testid="button-export-csv">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map(s => {
            const Icon = s.icon;
            return (
              <Button
                key={s.value}
                variant={caseData.status === s.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(s.value)}
                data-testid={`button-status-${s.value}`}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {s.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            <Clock className="h-4 w-4 mr-1.5" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="entities" data-testid="tab-entities">
            <Link2 className="h-4 w-4 mr-1.5" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="evidence" data-testid="tab-evidence">
            <Paperclip className="h-4 w-4 mr-1.5" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="export" data-testid="tab-export">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <div className="border-l-2 border-border ml-4 space-y-0">
            {sortedTimeline.map(event => (
              <div key={event.id} className="relative pl-8 pb-8" data-testid={`timeline-event-${event.id}`}>
                <div className={cn('absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full', getTimelineDotColor(event.type))} />
                <div className="stat-card">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {event.performedBy}
                    </span>
                    {event.metadata && Object.entries(event.metadata).map(([key, val]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="entities" className="mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Linked Entities ({caseData.linkedEntities.length})</h3>
            <Button size="sm" onClick={() => setLinkEntityOpen(true)} data-testid="button-link-entity">
              <Plus className="h-4 w-4 mr-1.5" />
              Link Entity
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {caseData.linkedEntities.map(entity => {
              const Icon = getEntityIcon(entity.type);
              return (
                <div key={entity.id} className="stat-card" data-testid={`entity-card-${entity.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{entity.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{entity.reference}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">{entity.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{entity.relationship}</Badge>
                      {entity.riskIndicator && (
                        <Badge variant="outline" className={cn('text-xs capitalize', getPriorityColor(entity.riskIndicator))}>
                          {entity.riskIndicator}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Added by {entity.addedBy} {formatDistanceToNow(new Date(entity.addedAt), { addSuffix: true })}
                    </p>
                    {entity.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">{entity.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Dialog open={linkEntityOpen} onOpenChange={setLinkEntityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Entity to Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newEntity.type} onValueChange={v => setNewEntity(p => ({ ...p, type: v as LinkedEntityType }))}>
                    <SelectTrigger data-testid="select-entity-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newEntity.name} onChange={e => setNewEntity(p => ({ ...p, name: e.target.value }))} placeholder="Entity name" data-testid="input-entity-name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Reference</label>
                  <Input value={newEntity.reference} onChange={e => setNewEntity(p => ({ ...p, reference: e.target.value }))} placeholder="Reference ID" data-testid="input-entity-reference" />
                </div>
                <div>
                  <label className="text-sm font-medium">Relationship</label>
                  <Input value={newEntity.relationship} onChange={e => setNewEntity(p => ({ ...p, relationship: e.target.value }))} placeholder="e.g. payee, intermediary" data-testid="input-entity-relationship" />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea value={newEntity.notes} onChange={e => setNewEntity(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes" data-testid="input-entity-notes" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkEntityOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEntity} data-testid="button-submit-entity">Add Entity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Evidence ({caseData.evidence.length} items)</h3>
            <Button size="sm" onClick={() => setUploadEvidenceOpen(true)} data-testid="button-upload-evidence">
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Evidence
            </Button>
          </div>
          <div className="space-y-4">
            {caseData.evidence.map(ev => {
              const Icon = getEvidenceIcon(ev.fileType);
              const source = getSourceBadge(ev.source);
              const custodyExpanded = expandedCustody[ev.id] || false;
              return (
                <div key={ev.id} className="stat-card" data-testid={`evidence-card-${ev.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="text-sm font-medium">{ev.fileName}</h4>
                          <p className="text-xs text-muted-foreground">{ev.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">{formatFileSize(ev.fileSize)}</span>
                          <Badge variant="outline" className={cn('text-xs', source.className)}>{source.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {ev.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs group/tag">
                            {tag}
                            <button
                              className="ml-1 opacity-50 hover:opacity-100"
                              onClick={() => handleRemoveTag(ev.id, tag)}
                              data-testid={`button-remove-tag-${ev.id}-${tag}`}
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                        <Input
                          className="h-6 w-24 text-xs"
                          placeholder="+ tag"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleAddTag(ev.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          data-testid={`input-add-tag-${ev.id}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded by {ev.uploadedBy} {formatDistanceToNow(new Date(ev.uploadedAt), { addSuffix: true })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => setExpandedCustody(prev => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                        data-testid={`button-custody-${ev.id}`}
                      >
                        {custodyExpanded ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
                        {custodyExpanded ? 'Hide' : 'View'} Custody Chain ({ev.custodyChain.length})
                      </Button>
                      {custodyExpanded && (
                        <div className="mt-2 border-l-2 border-border pl-4 space-y-2">
                          {ev.custodyChain.map((entry, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium capitalize">{entry.action}</span>
                              <span className="text-muted-foreground"> by {entry.performedBy}</span>
                              <span className="text-muted-foreground"> {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                              {entry.details && <p className="text-muted-foreground italic">{entry.details}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Dialog open={uploadEvidenceOpen} onOpenChange={setUploadEvidenceOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Evidence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">File Name</label>
                  <Input value={newEvidence.fileName} onChange={e => setNewEvidence(p => ({ ...p, fileName: e.target.value }))} placeholder="document.pdf" data-testid="input-evidence-filename" />
                </div>
                <div>
                  <label className="text-sm font-medium">File Type</label>
                  <Select value={newEvidence.fileType} onValueChange={v => setNewEvidence(p => ({ ...p, fileType: v as EvidenceFileType }))}>
                    <SelectTrigger data-testid="select-evidence-filetype"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="transaction_log">Transaction Log</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={newEvidence.description} onChange={e => setNewEvidence(p => ({ ...p, description: e.target.value }))} placeholder="Describe the evidence" data-testid="input-evidence-description" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input value={newEvidence.tags} onChange={e => setNewEvidence(p => ({ ...p, tags: e.target.value }))} placeholder="fraud, investigation" data-testid="input-evidence-tags" />
                </div>
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <Select value={newEvidence.source} onValueChange={v => setNewEvidence(p => ({ ...p, source: v as EvidenceSourceType }))}>
                    <SelectTrigger data-testid="select-evidence-source"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual_upload">Manual Upload</SelectItem>
                      <SelectItem value="external_feed">External Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadEvidenceOpen(false)}>Cancel</Button>
                <Button onClick={handleUploadEvidence} data-testid="button-submit-evidence">Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <div className="stat-card mb-6">
            <h3 className="text-sm font-medium mb-3">Add Note</h3>
            <div className="space-y-3">
              <Textarea
                value={newNote.content}
                onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your investigation note..."
                className="min-h-[80px]"
                data-testid="input-note-content"
              />
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <Select value={newNote.type} onValueChange={v => setNewNote(p => ({ ...p, type: v as 'comment' | 'evidence' | 'action_taken' }))}>
                    <SelectTrigger data-testid="select-note-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comment">Comment</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="action_taken">Action Taken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-muted-foreground">Mentions (comma-separated)</label>
                  <Input
                    value={newNote.mentions}
                    onChange={e => setNewNote(p => ({ ...p, mentions: e.target.value }))}
                    placeholder="compliance-team, analyst-2"
                    data-testid="input-note-mentions"
                  />
                </div>
                <Button onClick={handleAddNote} data-testid="button-post-note">
                  <Send className="h-4 w-4 mr-1.5" />
                  Post
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedNotes.map(note => {
              const initials = note.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const noteTypeColor = note.type === 'comment'
                ? 'bg-primary/20 text-primary border-primary/30'
                : note.type === 'evidence'
                  ? 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                  : 'bg-amber-500/20 text-amber-600 border-amber-500/30';
              return (
                <div key={note.id} className="stat-card" data-testid={`note-card-${note.id}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{note.authorName}</span>
                        <Badge variant="outline" className={cn('text-xs capitalize', noteTypeColor)}>
                          {note.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                          {formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{note.content}</p>
                      {note.mentions && note.mentions.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {note.mentions.map(m => (
                            <Badge key={m} variant="secondary" className="text-xs cursor-pointer">@{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Full Case Report</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Comprehensive HTML report containing case details, timeline ({caseData.timeline.length} events),
                evidence ({caseData.evidence.length} items), notes ({caseData.notes.length}),
                linked entities ({caseData.linkedEntities.length}), and resolution details.
                Opens in a new tab for printing to PDF.
              </p>
              <Button onClick={exportPDF} data-testid="button-export-full-report">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Generate Report
              </Button>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Evidence Log (CSV)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Export all evidence records including file details, source attribution,
                tags, and custody chain summary.
              </p>
              <Button variant="outline" onClick={() => exportCSV(
                `${caseData.id}_evidence.csv`,
                ['ID', 'File Name', 'File Type', 'File Size', 'Source', 'Attribution', 'Tags', 'Uploaded By', 'Uploaded At', 'Custody Chain Length'],
                caseData.evidence.map(e => [e.id, e.fileName, e.fileType, formatFileSize(e.fileSize), e.source, e.sourceAttribution, e.tags.join('; '), e.uploadedBy, e.uploadedAt, String(e.custodyChain.length)])
              )} data-testid="button-export-evidence-csv">
                <Download className="h-4 w-4 mr-1.5" />
                Export Evidence CSV
              </Button>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Timeline (CSV)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Export all {caseData.timeline.length} timeline events with type, title, description,
                performer, and timestamp.
              </p>
              <Button variant="outline" onClick={() => exportCSV(
                `${caseData.id}_timeline.csv`,
                ['ID', 'Type', 'Title', 'Description', 'Performed By', 'Timestamp'],
                caseData.timeline.map(e => [e.id, e.type, e.title, e.description, e.performedBy, e.timestamp])
              )} data-testid="button-export-timeline-csv">
                <Download className="h-4 w-4 mr-1.5" />
                Export Timeline CSV
              </Button>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Notes (CSV)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Export all {caseData.notes.length} investigator notes with author, type, content,
                and mentions.
              </p>
              <Button variant="outline" onClick={() => exportCSV(
                `${caseData.id}_notes.csv`,
                ['ID', 'Author', 'Type', 'Content', 'Mentions', 'Timestamp'],
                caseData.notes.map(n => [n.id, n.authorName, n.type, n.content, (n.mentions || []).join('; '), n.timestamp])
              )} data-testid="button-export-notes-csv">
                <Download className="h-4 w-4 mr-1.5" />
                Export Notes CSV
              </Button>
            </div>
          </div>

          <div className="stat-card mt-6">
            <h3 className="text-sm font-medium mb-3">Export Preview</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Case ID</span>
                <span className="font-mono">{caseData.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="capitalize">{caseData.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority</span>
                <span className="capitalize">{caseData.priority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <span className="capitalize">{caseData.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Customer</span>
                <span className="font-mono">{caseData.customerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span>{format(new Date(caseData.createdAt), 'PPpp')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timeline Events</span>
                <span>{caseData.timeline.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Evidence Items</span>
                <span>{caseData.evidence.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Linked Entities</span>
                <span>{caseData.linkedEntities.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Notes</span>
                <span>{caseData.notes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tags</span>
                <span>{caseData.tags.join(', ')}</span>
              </div>
              {caseData.resolution && (
                <div className="flex items-center justify-between">
                  <span>Resolution</span>
                  <span className="capitalize">{caseData.resolution.outcome.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseInvestigation;

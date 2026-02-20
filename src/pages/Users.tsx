import { useState, useMemo, useCallback } from 'react';
import {
  Users as UsersIcon, Plus, Search, Shield, Mail, MoreHorizontal,
  Filter, ChevronDown, Clock, AlertTriangle, Lock, Key, Smartphone,
  Globe, Monitor, LogOut, RotateCcw, Eye, UserCheck, UserX, UserPlus,
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ChevronRight,
  Bookmark, Download, Activity, FileText, Settings, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getCachedMockData, generateRoleDefinitions } from '@/lib/mock-data';
import {
  IAMUser, UserRole, UserStatus, PrivilegeLevel, SSOProvider,
  RoleDefinition, UserAuditEntry, PERMISSION_GROUPS
} from '@/types';
import { formatDistanceToNow } from 'date-fns';

const genId = () => Math.random().toString(36).substring(2, 10);

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  risk_analyst: { label: 'Risk Analyst', className: 'bg-primary/20 text-primary border-primary/30' },
  compliance_officer: { label: 'Compliance', className: 'bg-warning/20 text-warning border-warning/30' },
  aml_analyst: { label: 'AML Analyst', className: 'bg-accent/20 text-accent border-accent/30' },
  auditor: { label: 'Auditor', className: 'bg-muted text-muted-foreground border-border' },
  viewer: { label: 'Viewer', className: 'bg-muted text-muted-foreground border-border' },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', className: 'border-success/30 text-success bg-success/10', icon: CheckCircle2 },
  invited: { label: 'Invited', className: 'border-blue-500/30 text-blue-500 bg-blue-500/10', icon: Mail },
  suspended: { label: 'Suspended', className: 'border-warning/30 text-warning bg-warning/10', icon: AlertTriangle },
  locked: { label: 'Locked', className: 'border-destructive/30 text-destructive bg-destructive/10', icon: Lock },
  deactivated: { label: 'Deactivated', className: 'border-muted-foreground/30 text-muted-foreground bg-muted', icon: XCircle },
};

const PRIVILEGE_CONFIG: Record<PrivilegeLevel, { label: string; className: string }> = {
  standard: { label: 'Standard', className: 'bg-muted text-muted-foreground border-border' },
  elevated: { label: 'Elevated', className: 'bg-warning/15 text-warning border-warning/30' },
  admin: { label: 'Admin', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const SSO_LABELS: Record<SSOProvider, string> = { azure_ad: 'Azure AD', okta: 'Okta', none: 'None' };

interface SavedView { id: string; label: string; filters: Partial<Filters>; }

interface Filters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  statusMulti?: UserStatus[];
  mfa: 'all' | 'enabled' | 'disabled';
  sso: 'all' | 'azure_ad' | 'okta' | 'none';
  privilege: PrivilegeLevel | 'all';
  privilegeMulti?: PrivilegeLevel[];
  hasFailedLogins?: boolean;
  hasPendingApprovals?: boolean;
}

const DEFAULT_FILTERS: Filters = { search: '', role: 'all', status: 'all', mfa: 'all', sso: 'all', privilege: 'all' };

const SAVED_VIEWS: SavedView[] = [
  { id: 'privileged', label: 'Privileged Accounts', filters: { privilegeMulti: ['admin', 'elevated'] } },
  { id: 'mfa-disabled', label: 'MFA Disabled', filters: { mfa: 'disabled' } },
  { id: 'locked-suspended', label: 'Locked / Suspended', filters: { statusMulti: ['locked', 'suspended'] } },
  { id: 'invited', label: 'Pending Invitations', filters: { status: 'invited' } },
];

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const Users = () => {
  const { toast } = useToast();
  const data = useMemo(() => getCachedMockData(), []);
  const roleDefinitions = useMemo(() => data.roleDefinitions, [data]);

  const [users, setUsers] = useState<IAMUser[]>(data.iamUsers);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'lastLogin' | 'name' | 'privilege'>('lastLogin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId) || null, [users, selectedUserId]);

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.roles.some(r => ROLE_CONFIG[r].label.toLowerCase().includes(s)));
    }
    if (filters.role !== 'all') result = result.filter(u => u.roles.includes(filters.role as UserRole));
    if (filters.statusMulti && filters.statusMulti.length > 0) {
      result = result.filter(u => filters.statusMulti!.includes(u.status));
    } else if (filters.status !== 'all') {
      result = result.filter(u => u.status === filters.status);
    }
    if (filters.mfa === 'enabled') result = result.filter(u => u.mfaEnabled);
    if (filters.mfa === 'disabled') result = result.filter(u => !u.mfaEnabled);
    if (filters.sso !== 'all') result = result.filter(u => u.ssoProvider === filters.sso);
    if (filters.privilegeMulti && filters.privilegeMulti.length > 0) {
      result = result.filter(u => filters.privilegeMulti!.includes(u.privilegeLevel));
    } else if (filters.privilege !== 'all') {
      result = result.filter(u => u.privilegeLevel === filters.privilege);
    }
    if (filters.hasFailedLogins) result = result.filter(u => u.failedLogins24h > 0);
    if (filters.hasPendingApprovals) result = result.filter(u => u.approvals.some(a => a.status === 'pending'));

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'lastLogin') cmp = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else {
        const pl = { standard: 0, elevated: 1, admin: 2 };
        cmp = pl[a.privilegeLevel] - pl[b.privilegeLevel];
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [users, filters, sortBy, sortDir]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.privilegeLevel === 'admin' || u.privilegeLevel === 'elevated').length,
    mfaPct: Math.round((users.filter(u => u.mfaEnabled).length / users.length) * 100),
    ssoCount: users.filter(u => u.ssoProvider !== 'none').length,
    lockedSuspended: users.filter(u => u.status === 'locked' || u.status === 'suspended').length,
    failedLogins: users.reduce((sum, u) => sum + u.failedLogins24h, 0),
    pendingApprovals: users.reduce((sum, u) => sum + u.approvals.filter(a => a.status === 'pending').length, 0),
  }), [users]);

  const addAuditEntry = useCallback((userId: string, action: string, details: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u, auditLog: [{ id: genId(), action, timestamp: new Date().toISOString(), ipAddress: '10.0.0.23', details }, ...u.auditLog]
    } : u));
  }, []);

  const handleStatusChange = useCallback((userId: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    addAuditEntry(userId, `Status changed to ${newStatus}`, `User status updated to ${newStatus}`);
    toast({ title: 'Status Updated', description: `User status changed to ${newStatus}` });
  }, [addAuditEntry, toast]);

  const handleTerminateSession = useCallback((userId: string, sessionId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, sessions: u.sessions.filter(s => s.id !== sessionId) } : u));
    addAuditEntry(userId, 'Session terminated', `Session ${sessionId} terminated by admin`);
    toast({ title: 'Session Terminated' });
  }, [addAuditEntry, toast]);

  const handleMfaToggle = useCallback((userId: string, enabled: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, mfaEnabled: enabled } : u));
    addAuditEntry(userId, enabled ? 'MFA enabled' : 'MFA disabled', `MFA ${enabled ? 'enabled' : 'disabled'} by admin`);
    toast({ title: `MFA ${enabled ? 'Enabled' : 'Disabled'}` });
  }, [addAuditEntry, toast]);

  const handleAddUser = useCallback((newUser: Partial<IAMUser>) => {
    const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const user: IAMUser = {
      id, email: newUser.email || '', name: newUser.name || '', roles: newUser.roles || ['viewer'],
      privilegeLevel: newUser.privilegeLevel || 'standard', status: 'invited',
      department: newUser.department || '', team: newUser.team || '', title: newUser.title || '',
      mfaEnabled: newUser.mfaEnabled || false, ssoProvider: newUser.ssoProvider || 'none',
      authMethod: newUser.authMethod || 'local', lastLogin: '', lastLoginIp: '', lastLoginLocation: '',
      lastLoginDevice: '', lastActivity: '', lastActivityAction: '',
      failedLogins24h: 0, createdAt: new Date().toISOString(), createdBy: 'John Doe',
      sessions: [], auditLog: [{ id: genId(), action: 'User created', timestamp: new Date().toISOString(), ipAddress: '10.0.0.23', details: 'User account created and invitation sent' }],
      approvals: [],
    };
    setUsers(prev => [user, ...prev]);
    setAddUserOpen(false);
    toast({ title: 'User Created', description: `Invitation sent to ${user.email}` });
  }, [users.length, toast]);

  const applySavedView = useCallback((view: SavedView) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters });
  }, []);

  const kpiCards = [
    { label: 'Total Users', value: stats.total, icon: UsersIcon, onClick: () => setFilters(DEFAULT_FILTERS), tip: 'Total number of registered users in the system' },
    { label: 'Active Users', value: stats.active, icon: UserCheck, className: 'border-l-4 border-l-success', onClick: () => setFilters({ ...DEFAULT_FILTERS, status: 'active' }), tip: 'Users with active status who can access the platform' },
    { label: 'Privileged Users', value: stats.admins, icon: ShieldAlert, className: 'border-l-4 border-l-warning', onClick: () => setFilters({ ...DEFAULT_FILTERS, privilegeMulti: ['admin', 'elevated'] }), tip: 'Admin and elevated privilege accounts' },
    { label: 'MFA Enabled', value: `${stats.mfaPct}%`, icon: Smartphone, className: 'border-l-4 border-l-primary', onClick: () => setFilters({ ...DEFAULT_FILTERS, mfa: 'enabled' }), tip: 'Percentage of users with multi-factor authentication enabled' },
    { label: 'SSO Enabled', value: stats.ssoCount, icon: Globe, className: 'border-l-4 border-l-accent', onClick: () => setFilters({ ...DEFAULT_FILTERS, sso: 'azure_ad' }), tip: 'Users authenticating via SSO providers' },
    { label: 'Locked / Suspended', value: stats.lockedSuspended, icon: Lock, className: 'border-l-4 border-l-destructive', onClick: () => setFilters({ ...DEFAULT_FILTERS, statusMulti: ['locked', 'suspended'] }), tip: 'Users currently locked out or suspended' },
    { label: 'Failed Logins (24h)', value: stats.failedLogins, icon: AlertTriangle, className: 'border-l-4 border-l-destructive', onClick: () => setFilters({ ...DEFAULT_FILTERS, hasFailedLogins: true }), tip: 'Total failed login attempts in the last 24 hours' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, className: 'border-l-4 border-l-blue-500', onClick: () => setFilters({ ...DEFAULT_FILTERS, hasPendingApprovals: true }), tip: 'Access requests awaiting approval' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <UsersIcon className="h-6 w-6 text-primary" />
            User & Access Management
          </h1>
          <p className="text-muted-foreground">Manage user accounts, roles, permissions, and access policies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRolesModalOpen(true)} data-testid="button-manage-roles">
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          <Button onClick={() => setAddUserOpen(true)} data-testid="button-add-user">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpiCards.map((kpi) => (
          <Tooltip key={kpi.label}>
            <TooltipTrigger asChild>
              <div
                className={cn('stat-card cursor-pointer hover:shadow-md transition-shadow', kpi.className)}
                onClick={kpi.onClick}
                data-testid={`kpi-${kpi.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  <kpi.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent><p>{kpi.tip}</p></TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, role..."
            className="pl-9"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            data-testid="input-search-users"
          />
        </div>
        <Select value={filters.role} onValueChange={v => setFilters(f => ({ ...f, role: v as any }))}>
          <SelectTrigger className="w-[140px]" data-testid="select-role-filter"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v as any }))}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.mfa} onValueChange={v => setFilters(f => ({ ...f, mfa: v as any }))}>
          <SelectTrigger className="w-[130px]" data-testid="select-mfa-filter"><SelectValue placeholder="MFA" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All MFA</SelectItem>
            <SelectItem value="enabled">MFA On</SelectItem>
            <SelectItem value="disabled">MFA Off</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.sso} onValueChange={v => setFilters(f => ({ ...f, sso: v as any }))}>
          <SelectTrigger className="w-[130px]" data-testid="select-sso-filter"><SelectValue placeholder="SSO" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SSO</SelectItem>
            <SelectItem value="azure_ad">Azure AD</SelectItem>
            <SelectItem value="okta">Okta</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-saved-views">
              <Bookmark className="h-4 w-4 mr-1" /> Saved Views <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SAVED_VIEWS.map(v => (
              <DropdownMenuItem key={v.id} onClick={() => applySavedView(v)} data-testid={`view-${v.id}`}>{v.label}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilters(DEFAULT_FILTERS)}>Clear All Filters</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="button-sort">
              <ArrowUpDown className="h-4 w-4 mr-1" /> Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => { setSortBy('lastLogin'); setSortDir('desc'); }}>Last Login (Recent)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('lastLogin'); setSortDir('asc'); }}>Last Login (Oldest)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('name'); setSortDir('asc'); }}>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('privilege'); setSortDir('desc'); }}>Privilege (High→Low)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="stat-card">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Role(s)</th>
                <th>Privilege</th>
                <th>Status</th>
                <th>MFA</th>
                <th>SSO</th>
                <th>Last Login</th>
                <th>Last Activity</th>
                <th>Failed (24h)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No users match the current filters</td></tr>
              ) : filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 transition-colors',
                    selectedUserId === user.id && 'bg-primary/5 hover:bg-primary/10'
                  )}
                  onClick={() => setSelectedUserId(user.id)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedUserId(user.id); } }}
                  aria-selected={selectedUserId === user.id}
                  aria-expanded={selectedUserId === user.id}
                  role="button"
                  data-testid={`row-user-${user.id}`}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-username-${user.id}`}>{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(r => (
                        <Badge key={r} variant="outline" className={cn('text-[10px]', ROLE_CONFIG[r].className)}>{ROLE_CONFIG[r].label}</Badge>
                      ))}
                    </div>
                  </td>
                  <td><Badge variant="outline" className={cn('text-[10px]', PRIVILEGE_CONFIG[user.privilegeLevel].className)}>{PRIVILEGE_CONFIG[user.privilegeLevel].label}</Badge></td>
                  <td><Badge variant="outline" className={cn('text-[10px]', STATUS_CONFIG[user.status].className)}>{STATUS_CONFIG[user.status].label}</Badge></td>
                  <td>
                    <Badge variant="outline" className={cn('text-[10px]', user.mfaEnabled ? 'border-success/30 text-success bg-success/10' : 'border-destructive/30 text-destructive bg-destructive/10')}>
                      {user.mfaEnabled ? 'On' : 'Off'}
                    </Badge>
                  </td>
                  <td><span className="text-xs text-muted-foreground">{SSO_LABELS[user.ssoProvider]}</span></td>
                  <td>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground">
                          {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'No login recorded'}</p>
                        {user.lastLoginIp && <p className="text-xs text-muted-foreground">{user.lastLoginIp} • {user.lastLoginLocation}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td><span className="text-xs text-muted-foreground truncate max-w-[120px] block">{user.lastActivityAction || '—'}</span></td>
                  <td>
                    {user.failedLogins24h > 0 ? (
                      <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive bg-destructive/10">{user.failedLogins24h}</Badge>
                    ) : <span className="text-xs text-muted-foreground">0</span>}
                  </td>
                  <td>
                    <button
                      className="p-1 rounded hover:bg-muted/80 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedUserId(user.id); }}
                      tabIndex={-1}
                      aria-label={`Open details for ${user.name}`}
                      data-testid={`button-chevron-${user.id}`}
                    >
                      <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', selectedUserId === user.id && 'rotate-90')} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-muted-foreground px-1">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* User Detail Drawer */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}>
        <SheetContent className="w-full sm:max-w-[540px] p-0 overflow-hidden" data-testid="drawer-user-detail">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">{getInitials(selectedUser.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg" data-testid="text-drawer-username">{selectedUser.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn('text-[10px]', STATUS_CONFIG[selectedUser.status].className)}>{STATUS_CONFIG[selectedUser.status].label}</Badge>
                      <Badge variant="outline" className={cn('text-[10px]', PRIVILEGE_CONFIG[selectedUser.privilegeLevel].className)}>{PRIVILEGE_CONFIG[selectedUser.privilegeLevel].label}</Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-6 mt-3 grid grid-cols-5 w-auto">
                  <TabsTrigger value="profile" className="text-xs" data-testid="tab-profile">Profile</TabsTrigger>
                  <TabsTrigger value="roles" className="text-xs" data-testid="tab-roles">Roles</TabsTrigger>
                  <TabsTrigger value="security" className="text-xs" data-testid="tab-security">Security</TabsTrigger>
                  <TabsTrigger value="audit" className="text-xs" data-testid="tab-audit">Audit</TabsTrigger>
                  <TabsTrigger value="approvals" className="text-xs" data-testid="tab-approvals">SoD</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 px-6 pb-6">
                  {/* TAB 1 — Profile */}
                  <TabsContent value="profile" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', value: selectedUser.name },
                        { label: 'Email', value: selectedUser.email },
                        { label: 'Department', value: selectedUser.department },
                        { label: 'Team', value: selectedUser.team },
                        { label: 'Title', value: selectedUser.title },
                        { label: 'Status', value: STATUS_CONFIG[selectedUser.status].label },
                        { label: 'Created', value: new Date(selectedUser.createdAt).toLocaleDateString() },
                        { label: 'Created By', value: selectedUser.createdBy },
                      ].map(item => (
                        <div key={item.label}>
                          <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                          <p className="text-sm font-medium">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Last Login Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-muted-foreground">Time</p><p className="text-sm">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p></div>
                        <div><p className="text-xs text-muted-foreground">IP Address</p><p className="text-sm">{selectedUser.lastLoginIp || '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm">{selectedUser.lastLoginLocation || '—'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Device</p><p className="text-sm">{selectedUser.lastLoginDevice || '—'}</p></div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">User Lifecycle</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'suspended')} data-testid="button-suspend-user">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Suspend
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'locked')} data-testid="button-lock-user">
                              <Lock className="h-3 w-3 mr-1" /> Lock
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleStatusChange(selectedUser.id, 'deactivated')} data-testid="button-deactivate-user">
                              <UserX className="h-3 w-3 mr-1" /> Deactivate
                            </Button>
                          </>
                        )}
                        {(selectedUser.status === 'suspended' || selectedUser.status === 'locked') && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'active')} data-testid="button-activate-user">
                            <UserCheck className="h-3 w-3 mr-1" /> Activate
                          </Button>
                        )}
                        {selectedUser.status === 'deactivated' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'active')} data-testid="button-reactivate-user">
                            <RotateCcw className="h-3 w-3 mr-1" /> Reactivate
                          </Button>
                        )}
                        {selectedUser.status === 'invited' && (
                          <Button size="sm" variant="outline" data-testid="button-resend-invite">
                            <Mail className="h-3 w-3 mr-1" /> Resend Invite
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2 — Roles & Permissions */}
                  <TabsContent value="roles" className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Assigned Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.roles.map(r => (
                          <Badge key={r} variant="outline" className={cn('text-xs', ROLE_CONFIG[r].className)}>{ROLE_CONFIG[r].label}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Role Permissions</p>
                      {selectedUser.roles.map(role => {
                        const rd = roleDefinitions.find(r => r.name === role);
                        if (!rd) return null;
                        return (
                          <div key={role} className="mb-3 p-3 rounded-lg bg-muted/30 border border-border">
                            <p className="text-sm font-medium mb-1">{rd.label}</p>
                            <p className="text-xs text-muted-foreground mb-2">{rd.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {rd.permissions.map(p => (
                                <Badge key={p} variant="outline" className="text-[10px] bg-muted">{p.replace(/_/g, ' ')}</Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Effective Permissions Summary</p>
                      {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                        const allRolePerms = selectedUser.roles.flatMap(r => roleDefinitions.find(rd => rd.name === r)?.permissions || []);
                        const effective = perms.filter(p => allRolePerms.includes(p));
                        if (effective.length === 0) return null;
                        return (
                          <div key={group} className="mb-2">
                            <p className="text-xs font-medium text-muted-foreground">{group}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {perms.map(p => (
                                <Badge key={p} variant="outline" className={cn('text-[10px]', effective.includes(p) ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground/40 line-through')}>
                                  {p.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* TAB 3 — Security */}
                  <TabsContent value="security" className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Multi-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">{selectedUser.mfaEnabled ? 'Enabled' : 'Not enabled'}</p>
                        </div>
                      </div>
                      <Switch
                        checked={selectedUser.mfaEnabled}
                        onCheckedChange={(checked) => handleMfaToggle(selectedUser.id, checked)}
                        data-testid="switch-mfa"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => { addAuditEntry(selectedUser.id, 'MFA reset', 'MFA reset by admin'); toast({ title: 'MFA Reset' }); }} data-testid="button-reset-mfa">
                        <RotateCcw className="h-3 w-3 mr-1" /> Reset MFA
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { addAuditEntry(selectedUser.id, 'Password reset forced', 'Admin forced password reset'); toast({ title: 'Password Reset Sent' }); }} data-testid="button-force-password-reset">
                        <Key className="h-3 w-3 mr-1" /> Force Password Reset
                      </Button>
                      {selectedUser.status === 'locked' ? (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'active')} data-testid="button-unlock-account">
                          <Lock className="h-3 w-3 mr-1" /> Unlock Account
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedUser.id, 'locked')} data-testid="button-lock-account">
                          <Lock className="h-3 w-3 mr-1" /> Lock Account
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Active Sessions ({selectedUser.sessions.length})</p>
                      {selectedUser.sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No active sessions</p>
                      ) : selectedUser.sessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border mb-2">
                          <div className="flex items-center gap-3">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{session.device}</p>
                              <p className="text-xs text-muted-foreground">{session.ipAddress} • {session.location}</p>
                              <p className="text-xs text-muted-foreground">Login: {formatDistanceToNow(new Date(session.loginTime), { addSuffix: true })}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleTerminateSession(selectedUser.id, session.id)} data-testid={`button-terminate-session-${session.id}`}>
                            <LogOut className="h-3 w-3 mr-1" /> End
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-muted-foreground">Auth Method</p><p className="text-sm font-medium">{selectedUser.authMethod === 'sso' ? 'SSO' : 'Local'}</p></div>
                      <div><p className="text-xs text-muted-foreground">SSO Provider</p><p className="text-sm font-medium">{SSO_LABELS[selectedUser.ssoProvider]}</p></div>
                      <div><p className="text-xs text-muted-foreground">Failed Logins (24h)</p><p className="text-sm font-medium">{selectedUser.failedLogins24h}</p></div>
                    </div>
                  </TabsContent>

                  {/* TAB 4 — Audit Activity */}
                  <TabsContent value="audit" className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-medium">User Activity Log ({selectedUser.auditLog.length} entries)</p>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: 'Audit log exported' })} data-testid="button-export-audit">
                        <Download className="h-3 w-3 mr-1" /> Export
                      </Button>
                    </div>
                    {selectedUser.auditLog.map(entry => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                            {entry.ipAddress && <span className="text-[10px] text-muted-foreground">• {entry.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* TAB 5 — Approvals / SoD */}
                  <TabsContent value="approvals" className="mt-4 space-y-4">
                    {selectedUser.privilegeLevel !== 'standard' && (
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldAlert className="h-4 w-4 text-warning" />
                          <p className="text-sm font-medium text-warning">Privileged Account</p>
                        </div>
                        <p className="text-xs text-muted-foreground">This user has {selectedUser.privilegeLevel} privileges. Role changes require approval workflow.</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Approval History</p>
                      {selectedUser.approvals.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No approval records</p>
                      ) : selectedUser.approvals.map(approval => (
                        <div key={approval.id} className="p-3 rounded-lg bg-muted/30 border border-border mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Role: {ROLE_CONFIG[approval.requestedRole as UserRole]?.label || approval.requestedRole}</p>
                            <Badge variant="outline" className={cn('text-[10px]',
                              approval.status === 'approved' ? 'bg-success/10 text-success border-success/30' :
                              approval.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                              'bg-warning/10 text-warning border-warning/30'
                            )}>{approval.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{approval.reason}</p>
                          <div className="text-[10px] text-muted-foreground space-y-0.5">
                            <p>Requested by: {approval.requestedBy} • {new Date(approval.requestedAt).toLocaleDateString()}</p>
                            {approval.approver && <p>Approved by: {approval.approver} • {approval.approvedAt ? new Date(approval.approvedAt).toLocaleDateString() : ''}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Segregation of Duties Check</p>
                      {selectedUser.roles.length > 1 ? (
                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <p className="text-sm font-medium">Multi-Role Assignment Detected</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This user holds {selectedUser.roles.length} roles ({selectedUser.roles.map(r => ROLE_CONFIG[r].label).join(', ')}).
                            Verify no conflicting duties exist per your SoD policy.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-success" />
                            <p className="text-sm font-medium text-success">No SoD Conflicts</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Single role assignment — no segregation of duties conflicts detected.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add User Dialog */}
      <AddUserDialog open={addUserOpen} onClose={() => setAddUserOpen(false)} onSubmit={handleAddUser} />

      {/* Role Management Dialog */}
      <RoleManagementDialog open={rolesModalOpen} onClose={() => setRolesModalOpen(false)} roles={roleDefinitions} />
    </div>
  );
};

const AddUserDialog = ({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (user: Partial<IAMUser>) => void }) => {
  const [form, setForm] = useState({ name: '', email: '', roles: ['viewer'] as UserRole[], department: '', team: '', title: '', authMethod: 'local' as 'local' | 'sso', mfaEnabled: false, ssoProvider: 'none' as SSOProvider, inviteMessage: '' });

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    onSubmit({
      name: form.name, email: form.email, roles: form.roles,
      department: form.department, team: form.team, title: form.title,
      authMethod: form.authMethod, mfaEnabled: form.mfaEnabled, ssoProvider: form.ssoProvider,
      privilegeLevel: form.roles.includes('admin') ? 'admin' : form.roles.some(r => r === 'risk_analyst' || r === 'compliance_officer') ? 'elevated' : 'standard',
    });
    setForm({ name: '', email: '', roles: ['viewer'], department: '', team: '', title: '', authMethod: 'local', mfaEnabled: false, ssoProvider: 'none', inviteMessage: '' });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md" data-testid="dialog-add-user">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" data-testid="input-new-user-name" />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@snapnet.com" data-testid="input-new-user-email" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Role(s)</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Checkbox
                    checked={form.roles.includes(key as UserRole)}
                    onCheckedChange={(checked) => {
                      setForm(f => ({
                        ...f,
                        roles: checked ? [...f.roles, key as UserRole] : f.roles.filter(r => r !== key),
                      }));
                    }}
                    data-testid={`checkbox-role-${key}`}
                  />
                  {cfg.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Department</Label>
              <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Risk" data-testid="input-new-user-dept" />
            </div>
            <div>
              <Label className="text-xs">Team</Label>
              <Input value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} placeholder="Fraud Detection" data-testid="input-new-user-team" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Auth Method</Label>
            <Select value={form.authMethod} onValueChange={v => setForm(f => ({ ...f, authMethod: v as any }))}>
              <SelectTrigger data-testid="select-auth-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="sso">SSO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={form.mfaEnabled} onCheckedChange={(c) => setForm(f => ({ ...f, mfaEnabled: !!c }))} data-testid="checkbox-require-mfa" />
              Require MFA
            </label>
          </div>
          <div>
            <Label className="text-xs">Invite Message (optional)</Label>
            <Textarea value={form.inviteMessage} onChange={e => setForm(f => ({ ...f, inviteMessage: e.target.value }))} placeholder="Welcome to SnapFort..." rows={2} data-testid="input-invite-message" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-add-user">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.email || form.roles.length === 0} data-testid="button-send-invite">
            <Mail className="h-4 w-4 mr-2" /> Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RoleManagementDialog = ({ open, onClose, roles }: { open: boolean; onClose: () => void; roles: RoleDefinition[] }) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const role = roles.find(r => r.id === selectedRole);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" data-testid="dialog-manage-roles">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Role Management</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-[200px] space-y-1 border-r pr-4">
            {roles.map(r => (
              <div
                key={r.id}
                className={cn('p-2 rounded-lg cursor-pointer text-sm hover:bg-muted/50 transition-colors', selectedRole === r.id && 'bg-muted')}
                onClick={() => setSelectedRole(r.id)}
                data-testid={`role-item-${r.name}`}
              >
                <p className="font-medium">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.userCount} users • {r.permissions.length} perms</p>
              </div>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {role ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={cn('text-xs', PRIVILEGE_CONFIG[role.privilegeLevel].className)}>{PRIVILEGE_CONFIG[role.privilegeLevel].label}</Badge>
                    <span className="text-xs text-muted-foreground">{role.userCount} assigned users</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length})</p>
                  {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                    const active = perms.filter(p => role.permissions.includes(p));
                    return (
                      <div key={group} className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{group}</p>
                        <div className="flex flex-wrap gap-1">
                          {perms.map(p => (
                            <Badge key={p} variant="outline" className={cn('text-[10px]', active.includes(p) ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground/40')}>
                              {active.includes(p) ? '✓' : '✗'} {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-12">
                Select a role to view details
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close-roles">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Users;

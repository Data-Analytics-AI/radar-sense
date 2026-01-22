import { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus,
  Search,
  MoreHorizontal,
  Shield,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'admin', status: 'active', lastLogin: '2025-01-22T10:30:00Z' },
  { id: '2', name: 'Sarah Smith', email: 'sarah.smith@example.com', role: 'risk_analyst', status: 'active', lastLogin: '2025-01-22T09:15:00Z' },
  { id: '3', name: 'Mike Johnson', email: 'mike.j@example.com', role: 'compliance_officer', status: 'active', lastLogin: '2025-01-21T16:45:00Z' },
  { id: '4', name: 'Emily Brown', email: 'emily.b@example.com', role: 'aml_analyst', status: 'active', lastLogin: '2025-01-22T08:00:00Z' },
  { id: '5', name: 'David Wilson', email: 'david.w@example.com', role: 'auditor', status: 'inactive', lastLogin: '2025-01-15T14:20:00Z' },
  { id: '6', name: 'Lisa Chen', email: 'lisa.chen@example.com', role: 'viewer', status: 'active', lastLogin: '2025-01-22T11:00:00Z' },
];

const Users = () => {
  const [users] = useState<User[]>(mockUsers);
  
  const getRoleBadge = (role: UserRole) => {
    const config = {
      admin: { label: 'Admin', className: 'bg-destructive/20 text-destructive border-destructive/30' },
      risk_analyst: { label: 'Risk Analyst', className: 'bg-primary/20 text-primary border-primary/30' },
      compliance_officer: { label: 'Compliance', className: 'bg-warning/20 text-warning border-warning/30' },
      aml_analyst: { label: 'AML Analyst', className: 'bg-accent/20 text-accent border-accent/30' },
      auditor: { label: 'Auditor', className: 'bg-muted text-muted-foreground border-border' },
      viewer: { label: 'Viewer', className: 'bg-muted text-muted-foreground border-border' },
    };
    
    const { label, className } = config[role];
    return (
      <Badge variant="outline" className={cn('text-xs', className)}>
        {label}
      </Badge>
    );
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage user access and roles</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-success">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-3xl font-bold">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-muted">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-3xl font-bold">{users.filter(u => u.status === 'inactive').length}</p>
        </div>
        <div className="stat-card border-l-4 border-l-destructive">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>
      
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" />
        </div>
      </div>
      
      {/* Users table */}
      <div className="stat-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      user.status === 'active' 
                        ? 'border-success/30 text-success' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="text-sm text-muted-foreground">
                  {new Date(user.lastLogin).toLocaleString()}
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Role permissions */}
      <div className="stat-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="font-medium text-destructive mb-2">Admin</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Full system access</li>
              <li>• Model retraining</li>
              <li>• User management</li>
              <li>• Configuration changes</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="font-medium text-primary mb-2">Risk Analyst</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Alert investigation</li>
              <li>• Case management</li>
              <li>• Rule creation</li>
              <li>• Report generation</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="font-medium text-warning mb-2">Compliance Officer</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• SAR/STR export</li>
              <li>• Audit access</li>
              <li>• Compliance reports</li>
              <li>• Regulatory filings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;

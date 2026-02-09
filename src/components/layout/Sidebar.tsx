import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Briefcase,
  FileText,
  BarChart3,
  Network,
  Brain,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import snapnetLogo from '@/assets/snapnet-logo.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Live Monitoring', icon: Activity, href: '/monitoring' },
  { label: 'Alerts', icon: AlertTriangle, href: '/alerts', badge: 47 },
  { label: 'Cases', icon: Briefcase, href: '/cases', badge: 12 },
  { label: 'Transactions', icon: FileText, href: '/transactions' },
];

const analysisNavItems: NavItem[] = [
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Graph Network', icon: Network, href: '/graph' },
  { label: 'AI Assistant', icon: Sparkles, href: '/ai-assistant' },
];

const configNavItems: NavItem[] = [
  { label: 'Rules Engine', icon: BookOpen, href: '/rules' },
  { label: 'Models', icon: Brain, href: '/models' },
  { label: 'Users', icon: Users, href: '/users' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

const NavSection = ({ 
  title, 
  items, 
  collapsed 
}: { 
  title: string; 
  items: NavItem[]; 
  collapsed: boolean;
}) => {
  const location = useLocation();
  
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        const linkContent = (
          <NavLink
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-[1.02]',
              'active:scale-[0.98]',
              isActive && 'bg-primary/10 text-primary border border-primary/20 shadow-sm',
              !isActive && 'text-sidebar-foreground',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-destructive/20 text-destructive'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        );
        
        if (collapsed) {
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                {item.label}
                {item.badge && (
                  <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded text-xs">
                    {item.badge}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        }
        
        return <div key={item.href}>{linkContent}</div>;
      })}
    </div>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <aside className={cn(
      'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
      collapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Logo Section - Snapnet + SnapFort */}
      <div className={cn(
        'h-20 border-b border-sidebar-border flex items-center px-4',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex items-center gap-3">
          <img 
            src={snapnetLogo} 
            alt="Snapnet" 
            className={cn(
              'h-10 w-auto object-contain',
              collapsed && 'h-8'
            )}
          />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-px bg-border"></div>
              <div>
                <h1 className="font-bold text-foreground tracking-tight text-sm">SnapFort</h1>
                <p className="text-[9px] text-muted-foreground -mt-0.5">Fraud Detection</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        <NavSection title="Overview" items={mainNavItems} collapsed={collapsed} />
        <NavSection title="Analysis" items={analysisNavItems} collapsed={collapsed} />
        <NavSection title="Configuration" items={configNavItems} collapsed={collapsed} />
      </nav>
      
      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

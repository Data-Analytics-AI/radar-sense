import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Lock, Eye, EyeOff, Info, CheckCircle } from 'lucide-react';
import snapnetLogo from '@/assets/snapnet-logo.png';

const metrics = [
  {
    value: '99.2%',
    label: 'Real-time transaction coverage',
    tooltip: 'Percentage of inbound transactions scored in real time before authorization, measured over a rolling 30-day window.',
  },
  {
    value: '<300ms',
    label: 'Average risk-scoring latency',
    tooltip: 'Median end-to-end latency from transaction ingestion to risk score delivery, measured at the 95th percentile.',
  },
  {
    value: '45–70%',
    label: 'Reduction in false positives',
    tooltip: 'Observed reduction compared to rules-only baselines, measured across deployments with hybrid model + rules configurations.',
  },
  {
    value: '30–60%',
    label: 'Faster case resolution',
    tooltip: 'Improvement in mean time to resolution for fraud and AML cases, measured against pre-deployment baselines.',
  },
  {
    value: '24/7',
    label: 'Continuous monitoring',
    tooltip: 'Uninterrupted transaction monitoring with automated alerting, failover, and on-call escalation.',
  },
  {
    value: 'Multi-model',
    label: 'Rules & ML detection',
    tooltip: 'Combines deterministic rules engine with ensemble ML models (XGBoost, neural nets) for layered detection.',
  },
];

const complianceBadges = ['PCI DSS', 'ISO 27001', 'SOC 2', 'Audit-Ready Logs'];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulated login — replace with real auth when implemented
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Value & Credibility */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 bg-muted/30 border-r border-border relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative z-10 space-y-10">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <img src={snapnetLogo} alt="Snapnet" className="h-10 w-auto" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="font-bold text-foreground tracking-tight text-lg">SnapFort</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide uppercase">Fraud Detection</p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-3 max-w-lg">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight leading-tight">
              Real-Time Fraud & AML Intelligence Platform
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SnapFort helps financial institutions detect fraud, monitor transactions, and investigate AML risks in real time using explainable risk intelligence.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {metrics.map((m) => (
              <div key={m.label} className="stat-card p-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-foreground tracking-tight">{m.value}</span>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px] text-xs">
                      {m.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="relative z-10 space-y-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Compliance</p>
          <div className="flex flex-wrap gap-2">
            {complianceBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs text-muted-foreground font-medium"
              >
                <CheckCircle className="h-3 w-3 text-success" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Authentication */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <img src={snapnetLogo} alt="Snapnet" className="h-9 w-auto" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-px bg-border" />
              <h1 className="font-bold text-foreground tracking-tight text-base">SnapFort</h1>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground tracking-tight">Sign in to SnapFort</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="analyst@institution.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Sign in to SnapFort
                </>
              )}
            </Button>
          </form>

          {/* SSO placeholder */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>
            <Button variant="outline" className="w-full text-sm" disabled>
              Sign in with SSO (SAML / Azure AD / Okta)
            </Button>
          </div>

          {/* Security microcopy */}
          <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-muted/30">
            <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All access is logged and monitored for security and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

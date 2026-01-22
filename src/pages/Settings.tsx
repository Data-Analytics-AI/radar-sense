import { 
  Settings as SettingsIcon, 
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Configure platform preferences and thresholds</p>
      </div>
      
      {/* Risk Thresholds */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Risk Thresholds</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Low Risk Threshold</Label>
            <Input type="number" defaultValue={25} />
            <p className="text-xs text-muted-foreground">Scores 0-25 classified as Low</p>
          </div>
          <div className="space-y-2">
            <Label>Medium Risk Threshold</Label>
            <Input type="number" defaultValue={50} />
            <p className="text-xs text-muted-foreground">Scores 26-50 classified as Medium</p>
          </div>
          <div className="space-y-2">
            <Label>High Risk Threshold</Label>
            <Input type="number" defaultValue={75} />
            <p className="text-xs text-muted-foreground">Scores 51-75 classified as High</p>
          </div>
          <div className="space-y-2">
            <Label>Critical Risk Threshold</Label>
            <Input type="number" defaultValue={100} />
            <p className="text-xs text-muted-foreground">Scores 76-100 classified as Critical</p>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Critical Alerts</p>
              <p className="text-sm text-muted-foreground">Notify immediately for critical risk transactions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">High Risk Alerts</p>
              <p className="text-sm text-muted-foreground">Notify for high risk transactions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Case Escalations</p>
              <p className="text-sm text-muted-foreground">Notify when cases are escalated</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sound Alerts</p>
              <p className="text-sm text-muted-foreground">Play sound for critical notifications</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
      
      {/* Data Retention */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Data Retention</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Transaction History</Label>
            <Select defaultValue="7y">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="3y">3 Years</SelectItem>
                <SelectItem value="5y">5 Years</SelectItem>
                <SelectItem value="7y">7 Years (Regulatory)</SelectItem>
                <SelectItem value="10y">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Audit Logs</Label>
            <Select defaultValue="7y">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="3y">3 Years</SelectItem>
                <SelectItem value="5y">5 Years</SelectItem>
                <SelectItem value="7y">7 Years (Regulatory)</SelectItem>
                <SelectItem value="10y">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Display */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Display</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern (EST/EDT)</SelectItem>
                  <SelectItem value="pst">Pacific (PST/PDT)</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact View</p>
              <p className="text-sm text-muted-foreground">Show more data in less space</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
      
      {/* API Configuration */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">API Configuration</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Endpoint</Label>
            <Input defaultValue="https://api.sentinel-ai.example.com/v1" />
          </div>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://your-service.com/webhook" />
          </div>
        </div>
      </div>
      
      {/* Save */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;

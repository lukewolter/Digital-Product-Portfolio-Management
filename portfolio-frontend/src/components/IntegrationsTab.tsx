import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Settings, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

interface Integration {
  id: string;
  integration_type: string;
  config: any;
  enabled: boolean;
  last_sync?: string;
  created_at: string;
}

interface IntegrationsTabProps {
  portfolioId: string;
}

export default function IntegrationsTab({ portfolioId }: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    integration_type: 'salesforce',
    config: {},
    enabled: true
  });

  const integrationTypes = [
    { value: 'salesforce', label: 'Salesforce CRM', icon: '☁️', description: 'Sync leads and opportunities' },
    { value: 'figma', label: 'Figma', icon: '🎨', description: 'Embed design prototypes' },
    { value: 'jira', label: 'Jira', icon: '📋', description: 'Sync issues and tasks' },
    { value: 'slack', label: 'Slack', icon: '💬', description: 'Team notifications' }
  ];

  useEffect(() => {
    loadIntegrations();
  }, [portfolioId]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getIntegrations(portfolioId) as Integration[];
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      await apiClient.createIntegration(portfolioId, newIntegration);
      setNewIntegration({ integration_type: 'salesforce', config: {}, enabled: true });
      setShowForm(false);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;
      
      await apiClient.updateIntegration(integrationId, {
        ...integration,
        enabled
      });
      loadIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      setSyncing(integrationId);
      const result = await apiClient.syncIntegration(integrationId) as any;
      alert(`Sync completed! ${JSON.stringify(result.synced_data)}`);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to sync integration:', error);
      alert('Sync failed. Please check your configuration.');
    } finally {
      setSyncing(null);
    }
  };

  const handleViewLogs = async (integrationId: string) => {
    try {
      const data = await apiClient.getIntegrationLogs(integrationId) as any;
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('Delete this integration?')) return;
    
    try {
      await apiClient.deleteIntegration(integrationId);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const getIntegrationInfo = (type: string) => {
    return integrationTypes.find(t => t.value === type) || integrationTypes[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-gray-600">Connect with external tools and services</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Integration'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Integration Type</label>
              <Select value={newIntegration.integration_type} onValueChange={(value) => setNewIntegration({ ...newIntegration, integration_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {integrationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {getIntegrationInfo(newIntegration.integration_type).description}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable immediately</label>
              <Switch
                checked={newIntegration.enabled}
                onCheckedChange={(checked) => setNewIntegration({ ...newIntegration, enabled: checked })}
              />
            </div>
            <Button onClick={handleCreateIntegration} className="w-full">Add Integration</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Configured connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.some(i => i.last_sync) ? 'Recent' : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">Sync status</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading integrations...</div>
      ) : (
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No integrations configured yet. Add your first integration to connect with external tools.</p>
                  <Button onClick={() => setShowForm(true)}>Add Integration</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            integrations.map((integration) => {
              const info = getIntegrationInfo(integration.integration_type);
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{info.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{info.label}</CardTitle>
                          <CardDescription className="mt-1">{info.description}</CardDescription>
                          {integration.last_sync && (
                            <p className="text-xs text-gray-500 mt-2">
                              Last synced: {new Date(integration.last_sync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.enabled ? 'default' : 'secondary'}>
                          {integration.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncIntegration(integration.id)}
                        disabled={!integration.enabled || syncing === integration.id}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                        {syncing === integration.id ? 'Syncing...' : 'Sync Now'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewLogs(integration.id)}
                      >
                        View Logs
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteIntegration(integration.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Logs</CardTitle>
            <CardDescription>Recent synchronization activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 border rounded">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : log.status === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{log.message}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    {log.records_synced && (
                      <p className="text-xs text-gray-600 mt-1">{log.records_synced} records synced</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect with these popular tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationTypes.map((type) => {
              const isConfigured = integrations.some(i => i.integration_type === type.value);
              return (
                <div key={type.value} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="text-3xl">{type.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                    {isConfigured && (
                      <Badge variant="outline" className="mt-2">Configured</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

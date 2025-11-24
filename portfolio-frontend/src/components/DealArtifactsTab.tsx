import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, GitBranch, Shield, Settings, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface DealArtifactsTabProps {
  portfolioId?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  clause_count: number;
  version_count: number;
}

interface OperatingModel {
  id: string;
  name: string;
  portfolio_id: string;
  template_type: string;
  section_count: number;
  created_at: string;
}

interface SLA {
  id: string;
  name: string;
  status: string;
  portfolio_id: string | null;
  metric_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface ComplianceIssue {
  id: string;
  severity: string;
  description: string;
  artifact_type: string;
  artifact_id: string;
  resolved: boolean;
  created_at: string;
}

export function DealArtifactsTab({ portfolioId }: DealArtifactsTabProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [operatingModels, setOperatingModels] = useState<OperatingModel[]>([]);
  const [slas, setSlas] = useState<SLA[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateSLA, setShowCreateSLA] = useState(false);
  const [showCreateModel, setShowCreateModel] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'NDA',
    content: { text: '' }
  });
  
  const [newSLA, setNewSLA] = useState({
    name: '',
    description: '',
    portfolio_id: portfolioId || null
  });
  
  const [newModel, setNewModel] = useState({
    name: '',
    template_type: 'business_model_canvas',
    portfolio_id: portfolioId || ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchOperatingModels();
    fetchSLAs();
    fetchComplianceIssues();
  }, [portfolioId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/templates`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperatingModels = async () => {
    try {
      const url = portfolioId 
        ? `${import.meta.env.VITE_API_URL}/api/artifacts/operating-models?portfolio_id=${portfolioId}`
        : `${import.meta.env.VITE_API_URL}/api/artifacts/operating-models`;
      
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) throw new Error('Failed to fetch operating models');
      
      const data = await response.json();
      setOperatingModels(data);
    } catch (err) {
      console.error('Error fetching operating models:', err);
    }
  };

  const fetchSLAs = async () => {
    try {
      const url = portfolioId 
        ? `${import.meta.env.VITE_API_URL}/api/artifacts/slas?portfolio_id=${portfolioId}`
        : `${import.meta.env.VITE_API_URL}/api/artifacts/slas`;
      
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) throw new Error('Failed to fetch SLAs');
      
      const data = await response.json();
      setSlas(data);
    } catch (err) {
      console.error('Error fetching SLAs:', err);
    }
  };

  const fetchComplianceIssues = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/compliance/issues`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch compliance issues');
      
      const data = await response.json();
      setComplianceIssues(data);
    } catch (err) {
      console.error('Error fetching compliance issues:', err);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/templates`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTemplate,
          clauses: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create template');
      }
      
      setSuccess('Template created successfully');
      setShowCreateTemplate(false);
      setNewTemplate({ name: '', type: 'NDA', content: { text: '' } });
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  const handleCreateSLA = async () => {
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/slas`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSLA,
          metrics: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create SLA');
      }
      
      setSuccess('SLA created successfully');
      setShowCreateSLA(false);
      setNewSLA({ name: '', description: '', portfolio_id: portfolioId || null });
      fetchSLAs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SLA');
    }
  };

  const handleCreateModel = async () => {
    try {
      setError(null);
      
      if (!newModel.portfolio_id) {
        throw new Error('Please select a portfolio');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/operating-models`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newModel,
          sections: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create operating model');
      }
      
      setSuccess('Operating model created successfully');
      setShowCreateModel(false);
      setNewModel({ name: '', template_type: 'business_model_canvas', portfolio_id: portfolioId || '' });
      fetchOperatingModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create operating model');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/artifacts/templates/${templateId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to delete template');
      
      setSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'archived': return 'bg-red-500';
      case 'active': return 'bg-green-500';
      case 'breached': return 'bg-red-500';
      case 'expired': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="operating-models">
            <GitBranch className="w-4 h-4 mr-2" />
            Operating Models
          </TabsTrigger>
          <TabsTrigger value="slas">
            <Shield className="w-4 h-4 mr-2" />
            SLAs
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckCircle className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Settings className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Contract Templates</CardTitle>
                  <CardDescription>
                    Manage standardized contract templates with version control
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateTemplate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No templates yet. Create your first contract template to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{template.name}</h3>
                              <Badge className={getStatusColor(template.status)}>
                                {template.status}
                              </Badge>
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Clauses: {template.clause_count} | Versions: {template.version_count}</div>
                              <div>Created: {new Date(template.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operating-models" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Operating Models</CardTitle>
                  <CardDescription>
                    Build and customize business model canvases for strategic planning
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateModel(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Model
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {operatingModels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No operating models yet. Create a Business Model Canvas to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {operatingModels.map((model) => (
                    <Card key={model.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{model.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Type: {model.template_type.replace('_', ' ')}</div>
                              <div>Sections: {model.section_count}</div>
                              <div>Created: {new Date(model.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Service Level Agreements</CardTitle>
                  <CardDescription>
                    Draft, track, and monitor SLAs with performance metrics
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateSLA(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New SLA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {slas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No SLAs yet. Create your first SLA to track service commitments.
                </div>
              ) : (
                <div className="space-y-4">
                  {slas.map((sla) => (
                    <Card key={sla.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{sla.name}</h3>
                              <Badge className={getStatusColor(sla.status)}>
                                {sla.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Metrics: {sla.metric_count}</div>
                              {sla.start_date && (
                                <div>Start: {new Date(sla.start_date).toLocaleDateString()}</div>
                              )}
                              {sla.end_date && (
                                <div>End: {new Date(sla.end_date).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues</CardTitle>
              <CardDescription>
                AI-powered compliance scanning and issue tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceIssues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No compliance issues found. All artifacts are compliant.
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceIssues.map((issue) => (
                    <Card key={issue.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">{issue.artifact_type}</Badge>
                              {issue.resolved && (
                                <Badge className="bg-green-500">Resolved</Badge>
                              )}
                            </div>
                            <p className="text-sm mb-2">{issue.description}</p>
                            <div className="text-xs text-gray-500">
                              {new Date(issue.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CLM Integrations</CardTitle>
              <CardDescription>
                Connect with Ironclad, DocuSign, and other CLM tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                CLM integrations coming soon. Configure Ironclad and DocuSign connections here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contract Template</DialogTitle>
            <DialogDescription>
              Create a new standardized contract template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Standard NDA"
              />
            </div>
            <div>
              <Label htmlFor="template-type">Template Type</Label>
              <Select
                value={newTemplate.type}
                onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="MSA">MSA</SelectItem>
                  <SelectItem value="SOW">SOW</SelectItem>
                  <SelectItem value="SLA">SLA</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={newTemplate.content.text}
                onChange={(e) => setNewTemplate({ 
                  ...newTemplate, 
                  content: { text: e.target.value } 
                })}
                placeholder="Enter template content..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create SLA Dialog */}
      <Dialog open={showCreateSLA} onOpenChange={setShowCreateSLA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create SLA</DialogTitle>
            <DialogDescription>
              Create a new Service Level Agreement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sla-name">SLA Name</Label>
              <Input
                id="sla-name"
                value={newSLA.name}
                onChange={(e) => setNewSLA({ ...newSLA, name: e.target.value })}
                placeholder="e.g., 99.9% Uptime SLA"
              />
            </div>
            <div>
              <Label htmlFor="sla-description">Description</Label>
              <Textarea
                id="sla-description"
                value={newSLA.description}
                onChange={(e) => setNewSLA({ ...newSLA, description: e.target.value })}
                placeholder="Describe the SLA terms..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSLA(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSLA}>Create SLA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Operating Model Dialog */}
      <Dialog open={showCreateModel} onOpenChange={setShowCreateModel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Operating Model</DialogTitle>
            <DialogDescription>
              Create a new Business Model Canvas or Lean Canvas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                placeholder="e.g., Q1 2025 Business Model"
              />
            </div>
            <div>
              <Label htmlFor="model-type">Template Type</Label>
              <Select
                value={newModel.template_type}
                onValueChange={(value) => setNewModel({ ...newModel, template_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_model_canvas">Business Model Canvas</SelectItem>
                  <SelectItem value="lean_canvas">Lean Canvas</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModel}>Create Model</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

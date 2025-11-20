import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

interface Workspace {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  parent_id: string | null;
  level: string;
  portfolios: string[];
  custom_terms: CustomTerm[];
  created_at: string;
  updated_at: string;
}

interface CustomTerm {
  key: string;
  value: string;
}

interface SettingsTabProps {
  portfolioId: string;
}

export default function SettingsTab({ portfolioId }: SettingsTabProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [customTerms, setCustomTerms] = useState<CustomTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    level: 'portfolio',
    parent_id: null as string | null
  });
  const [newTerm, setNewTerm] = useState({ key: '', value: '' });

  useEffect(() => {
    loadWorkspaces();
    loadCustomTerms();
  }, [portfolioId]);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workspaces`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomTerms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portfolios/${portfolioId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setCustomTerms(data.custom_terms || []);
    } catch (error) {
      console.error('Failed to load custom terms:', error);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkspace)
      });
      const workspace = await response.json();
      setWorkspaces([...workspaces, workspace]);
      setShowAddWorkspace(false);
      setNewWorkspace({ name: '', description: '', level: 'portfolio', parent_id: null });
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/workspaces/${id}`, {
        method: 'DELETE'
      });
      setWorkspaces(workspaces.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  const handleAddCustomTerm = async () => {
    if (!newTerm.key.trim() || !newTerm.value.trim()) return;

    try {
      const updatedTerms = [...customTerms, newTerm];
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portfolios/${portfolioId}/custom-terms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_terms: updatedTerms })
      });
      const data = await response.json();
      setCustomTerms(data.custom_terms);
      setShowAddTerm(false);
      setNewTerm({ key: '', value: '' });
    } catch (error) {
      console.error('Failed to add custom term:', error);
    }
  };

  const handleDeleteCustomTerm = async (key: string) => {
    try {
      const updatedTerms = customTerms.filter(t => t.key !== key);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/portfolios/${portfolioId}/custom-terms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_terms: updatedTerms })
      });
      const data = await response.json();
      setCustomTerms(data.custom_terms);
    } catch (error) {
      console.error('Failed to delete custom term:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workspace Hierarchies</CardTitle>
              <CardDescription>
                Create nested workspaces to organize your products (e.g., programs, portfolios, products)
              </CardDescription>
            </div>
            <Dialog open={showAddWorkspace} onOpenChange={setShowAddWorkspace}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Add a new workspace to your hierarchy
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      placeholder="e.g., Enterprise Program"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-desc">Description</Label>
                    <Textarea
                      id="workspace-desc"
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-level">Level</Label>
                    <Select
                      value={newWorkspace.level}
                      onValueChange={(value) => setNewWorkspace({ ...newWorkspace, level: value })}
                    >
                      <SelectTrigger id="workspace-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workspace-parent">Parent Workspace (Optional)</Label>
                    <Select
                      value={newWorkspace.parent_id || 'none'}
                      onValueChange={(value) => setNewWorkspace({ ...newWorkspace, parent_id: value === 'none' ? null : value })}
                    >
                      <SelectTrigger id="workspace-parent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {workspaces.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} ({w.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddWorkspace(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkspace}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workspaces yet. Create your first workspace to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map(workspace => (
                <div
                  key={workspace.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{workspace.name}</div>
                    <div className="text-sm text-gray-500">
                      Level: {workspace.level} | {workspace.description}
                    </div>
                    {workspace.parent_id && (
                      <div className="text-xs text-gray-400 mt-1">
                        Parent: {workspaces.find(w => w.id === workspace.parent_id)?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Terminology</CardTitle>
              <CardDescription>
                Customize terms to match your organization's language (e.g., rename "Milestone" to "Epic")
              </CardDescription>
            </div>
            <Dialog open={showAddTerm} onOpenChange={setShowAddTerm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Term
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Term</DialogTitle>
                  <DialogDescription>
                    Define a custom term for your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="term-key">Original Term</Label>
                    <Input
                      id="term-key"
                      value={newTerm.key}
                      onChange={(e) => setNewTerm({ ...newTerm, key: e.target.value })}
                      placeholder="e.g., milestone, portfolio, kpi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="term-value">Custom Term</Label>
                    <Input
                      id="term-value"
                      value={newTerm.value}
                      onChange={(e) => setNewTerm({ ...newTerm, value: e.target.value })}
                      placeholder="e.g., Epic, Product, Metric"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddTerm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomTerm}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {customTerms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No custom terms defined. Add terms to customize the interface language.
            </div>
          ) : (
            <div className="space-y-2">
              {customTerms.map(term => (
                <div
                  key={term.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{term.key}</div>
                    <div className="text-sm text-gray-500">Renamed to: {term.value}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCustomTerm(term.key)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

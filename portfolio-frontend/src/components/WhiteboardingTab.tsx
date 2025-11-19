import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Download, Sparkles, Plus } from 'lucide-react';
import apiClient from '@/lib/api';

interface Whiteboard {
  id: string;
  name: string;
  canvas_data: any;
  linked_items: Array<{ type: string; id: string }>;
  created_at: string;
}

interface WhiteboardingTabProps {
  portfolioId: string;
}

export default function WhiteboardingTab({ portfolioId }: WhiteboardingTabProps) {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<Whiteboard | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newWhiteboard, setNewWhiteboard] = useState({
    name: '',
    canvas_data: {},
    linked_items: []
  });

  useEffect(() => {
    loadWhiteboards();
  }, [portfolioId]);

  const loadWhiteboards = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getWhiteboards(portfolioId) as Whiteboard[];
      setWhiteboards(data);
    } catch (error) {
      console.error('Failed to load whiteboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWhiteboard = async () => {
    if (!newWhiteboard.name.trim()) return;
    
    try {
      await apiClient.createWhiteboard(portfolioId, newWhiteboard);
      setNewWhiteboard({ name: '', canvas_data: {}, linked_items: [] });
      setShowForm(false);
      loadWhiteboards();
    } catch (error) {
      console.error('Failed to create whiteboard:', error);
    }
  };

  const handleDeleteWhiteboard = async (whiteboardId: string) => {
    if (!confirm('Delete this whiteboard?')) return;
    
    try {
      await apiClient.deleteWhiteboard(whiteboardId);
      loadWhiteboards();
      if (selectedWhiteboard?.id === whiteboardId) {
        setSelectedWhiteboard(null);
      }
    } catch (error) {
      console.error('Failed to delete whiteboard:', error);
    }
  };

  const handleGetSuggestions = async (whiteboardId: string) => {
    try {
      const data = await apiClient.getWhiteboardSuggestions(whiteboardId) as any;
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleExport = () => {
    alert('Export functionality would download the whiteboard as PNG/PDF');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Whiteboarding</h2>
          <p className="text-gray-600">Visual collaboration and design</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Whiteboard'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Whiteboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Whiteboard Name</label>
              <Input
                value={newWhiteboard.name}
                onChange={(e) => setNewWhiteboard({ ...newWhiteboard, name: e.target.value })}
                placeholder="e.g., User Flow Diagram"
              />
            </div>
            <Button onClick={handleCreateWhiteboard} className="w-full">Create Whiteboard</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Whiteboards</CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{whiteboards.length}</div>
            <p className="text-xs text-muted-foreground">Active canvases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Items</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {whiteboards.reduce((sum, wb) => sum + wb.linked_items.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Connected to features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
            <p className="text-xs text-muted-foreground">Optimization tips</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading whiteboards...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whiteboards.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="py-12">
                <div className="text-center">
                  <Pencil className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No whiteboards yet. Create your first whiteboard to start visualizing ideas.</p>
                  <Button onClick={() => setShowForm(true)}>Create Whiteboard</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            whiteboards.map((whiteboard) => (
              <Card key={whiteboard.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{whiteboard.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Created {new Date(whiteboard.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {whiteboard.linked_items.length} links
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <Pencil className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Canvas Preview</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Full Excalidraw integration would be available in production
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWhiteboard(whiteboard);
                          handleGetSuggestions(whiteboard.id);
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        AI Suggestions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWhiteboard(whiteboard.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {suggestions.length > 0 && selectedWhiteboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Suggestions for "{selectedWhiteboard.name}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded">
                  <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Whiteboarding Features</CardTitle>
          <CardDescription>Available in full implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                <Pencil className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Drawing Tools</h4>
                <p className="text-sm text-gray-600">Shapes, lines, arrows, and freehand drawing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Sticky Notes</h4>
                <p className="text-sm text-gray-600">Add text notes and organize ideas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Real-time Collaboration</h4>
                <p className="text-sm text-gray-600">Work together with team members live</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Export Options</h4>
                <p className="text-sm text-gray-600">Download as PNG, PDF, or SVG</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

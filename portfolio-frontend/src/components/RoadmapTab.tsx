import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { apiClient } from '../lib/api';

interface Milestone {
  id: string;
  title: string;
  date: string;
  dependencies: string[];
  status: string;
}

interface RoadmapTabProps {
  portfolioId: string;
  milestones: Milestone[];
  onUpdate: () => void;
}

export function RoadmapTab({ portfolioId, milestones, onUpdate }: RoadmapTabProps) {
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '', status: 'planned' });

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.date) return;
    
    try {
      await apiClient.addMilestone(portfolioId, {
        ...newMilestone,
        dependencies: []
      });
      setNewMilestone({ title: '', date: '', status: 'planned' });
      setShowAddMilestone(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await apiClient.deleteMilestone(portfolioId, milestoneId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'planned': return 'Planned';
      default: return 'Planned';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Roadmap</CardTitle>
            <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Milestone</DialogTitle>
                  <DialogDescription>
                    Create a new milestone for your product roadmap
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Milestone Title</Label>
                    <Input
                      id="title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      placeholder="e.g., MVP Launch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Target Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMilestone.date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newMilestone.status}
                      onChange={(e) => setNewMilestone({ ...newMilestone, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMilestone(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMilestone}>Add Milestone</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sortedMilestones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No milestones yet. Add your first milestone to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline View */}
              <div className="relative">
                {sortedMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative pb-8">
                    {index < sortedMilestones.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center text-white font-semibold z-10`}>
                        {index + 1}
                      </div>
                      <Card className="flex-1">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg">{milestone.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(milestone.status)}`}>
                                  {getStatusLabel(milestone.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(milestone.date).toLocaleDateString()}</span>
                              </div>
                              {milestone.dependencies && milestone.dependencies.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Dependencies:</span> {milestone.dependencies.join(', ')}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

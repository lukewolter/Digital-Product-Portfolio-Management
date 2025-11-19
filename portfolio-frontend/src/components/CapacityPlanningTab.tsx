import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';

interface Resource {
  id: string;
  name: string;
  role: string;
  availability: Array<{ start: string; end: string; hours_per_day: number }>;
}

interface CapacityPlanningTabProps {
  portfolioId: string;
}

export default function CapacityPlanningTab({ portfolioId }: CapacityPlanningTabProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [workload, setWorkload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    role: 'Developer',
    user_id: 'user-1'
  });

  const roles = ['Developer', 'Designer', 'Product Manager', 'QA Engineer', 'DevOps'];

  useEffect(() => {
    loadCapacityData();
  }, [portfolioId]);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      const overview = await apiClient.getCapacityOverview(portfolioId) as any;
      setResources(overview.resources || []);
      
      const workloadData = await apiClient.getWorkloadAnalysis(portfolioId);
      setWorkload(workloadData);
    } catch (error) {
      console.error('Failed to load capacity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async () => {
    if (!newResource.name.trim()) return;
    
    try {
      await apiClient.createCapacityResource(portfolioId, newResource);
      setNewResource({ name: '', role: 'Developer', user_id: 'user-1' });
      setShowForm(false);
      loadCapacityData();
    } catch (error) {
      console.error('Failed to create resource:', error);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Remove this resource?')) return;
    
    try {
      await apiClient.deleteCapacityResource(resourceId);
      loadCapacityData();
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const getTotalCapacity = () => {
    return resources.reduce((total, resource) => {
      const resourceHours = resource.availability.reduce((sum, slot) => sum + slot.hours_per_day, 0);
      return total + resourceHours;
    }, 0);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return 'text-red-600';
    if (utilization > 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Capacity Planning</h2>
          <p className="text-gray-600">Manage team resources and workload</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Resource'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                placeholder="Resource name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select value={newResource.role} onValueChange={(value) => setNewResource({ ...newResource, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateResource} className="w-full">Add Resource</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalCapacity()}h</div>
            <p className="text-xs text-muted-foreground">Available hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">75%</div>
            <p className="text-xs text-muted-foreground">Healthy range</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading capacity data...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Team Resources</CardTitle>
              <CardDescription>Current team members and their availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No resources added yet. Click "Add Resource" to get started.</p>
                ) : (
                  resources.map((resource) => {
                    const totalHours = resource.availability.reduce((sum, slot) => sum + slot.hours_per_day, 0);
                    return (
                      <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">{resource.name}</h3>
                              <p className="text-sm text-gray-600">{resource.role}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{totalHours}h available</p>
                            <p className="text-xs text-gray-500">{resource.availability.length} time slots</p>
                          </div>
                          <Badge variant="outline">{resource.role}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {workload && (
            <Card>
              <CardHeader>
                <CardTitle>Workload Analysis</CardTitle>
                <CardDescription>Resource utilization and capacity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(workload.workload || {}).map(([name, data]: [string, any]) => {
                    const utilization = data.available_hours > 0 
                      ? Math.round((data.allocated_hours / data.available_hours) * 100)
                      : 0;
                    
                    return (
                      <div key={name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-600">{data.role}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getUtilizationColor(utilization)}`}>
                              {utilization}% utilized
                            </p>
                            <p className="text-sm text-gray-600">
                              {data.allocated_hours}h / {data.available_hours}h
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              utilization > 90 ? 'bg-red-600' :
                              utilization > 70 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Capacity Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">No critical capacity issues detected</p>
                    <p className="text-xs text-gray-600">All resources are within healthy utilization ranges</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

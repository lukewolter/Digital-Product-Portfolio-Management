import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { apiClient } from '../lib/api';

interface KPI {
  id: string;
  metric: string;
  value: number;
  target: number;
}

interface Lifecycle {
  current_stage: string;
  stages: string[];
}

interface LifecycleTabProps {
  portfolioId: string;
  lifecycle: Lifecycle;
  kpis: KPI[];
  onUpdate: () => void;
}

const LIFECYCLE_STAGES = [
  'Ideation',
  'Development',
  'Launch',
  'Growth',
  'Maturity',
  'Decline',
  'Retirement'
];

export function LifecycleTab({ portfolioId, lifecycle, kpis, onUpdate }: LifecycleTabProps) {
  const [newKPI, setNewKPI] = useState({ metric: '', value: 0, target: 0 });

  const handleUpdateStage = async (stage: string) => {
    try {
      await apiClient.updateLifecycleStage(portfolioId, stage);
      onUpdate();
    } catch (error) {
      console.error('Failed to update lifecycle stage:', error);
    }
  };

  const handleAddKPI = async () => {
    if (!newKPI.metric.trim()) return;
    
    try {
      await apiClient.addKPI(portfolioId, newKPI);
      setNewKPI({ metric: '', value: 0, target: 0 });
      onUpdate();
    } catch (error) {
      console.error('Failed to add KPI:', error);
    }
  };

  const handleDeleteKPI = async (kpiId: string) => {
    try {
      await apiClient.deleteKPI(portfolioId, kpiId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete KPI:', error);
    }
  };

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(lifecycle.current_stage);
  const progressPercentage = ((currentStageIndex + 1) / LIFECYCLE_STAGES.length) * 100;

  return (
    <div className="space-y-6">
      {/* Lifecycle Stage Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Product Lifecycle Stage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Stage: {lifecycle.current_stage}</span>
              <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stage Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LIFECYCLE_STAGES.map((stage, index) => {
              const isActive = stage === lifecycle.current_stage;
              const isPast = index < currentStageIndex;
              
              return (
                <button
                  key={stage}
                  onClick={() => handleUpdateStage(stage)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : isPast
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm">{stage}</div>
                  {isActive && (
                    <div className="text-xs mt-1">Current</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage Description */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">About {lifecycle.current_stage} Stage</h4>
            <p className="text-sm text-gray-600">
              {getStageDescription(lifecycle.current_stage)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Metric Name</Label>
              <Input
                value={newKPI.metric}
                onChange={(e) => setNewKPI({ ...newKPI, metric: e.target.value })}
                placeholder="e.g., Monthly Active Users"
              />
            </div>
            <div>
              <Label>Current Value</Label>
              <Input
                type="number"
                value={newKPI.value}
                onChange={(e) => setNewKPI({ ...newKPI, value: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                value={newKPI.target}
                onChange={(e) => setNewKPI({ ...newKPI, target: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddKPI}>
            <Plus className="w-4 h-4 mr-2" />
            Add KPI
          </Button>

          {kpis.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpis.map((kpi) => {
                const percentage = kpi.target > 0 ? (kpi.value / kpi.target) * 100 : 0;
                const isOnTrack = percentage >= 80;
                
                return (
                  <Card key={kpi.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-5 h-5 ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`} />
                          <h4 className="font-semibold">{kpi.metric}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteKPI(kpi.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Current</span>
                          <span className="font-semibold">{kpi.value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Target</span>
                          <span className="font-semibold">{kpi.target.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOnTrack ? 'bg-green-600' : 'bg-orange-600'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 text-right">
                          {percentage.toFixed(0)}% of target
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    'Ideation': 'Brainstorming and validating product concepts. Focus on market research and defining the value proposition.',
    'Development': 'Building the product MVP. Focus on core features, technical architecture, and initial testing.',
    'Launch': 'Releasing the product to market. Focus on go-to-market strategy, initial user acquisition, and feedback collection.',
    'Growth': 'Scaling the product and user base. Focus on feature expansion, marketing, and optimizing conversion.',
    'Maturity': 'Product has reached market saturation. Focus on retention, optimization, and incremental improvements.',
    'Decline': 'Product usage is decreasing. Focus on cost reduction, exploring pivots, or planning sunset.',
    'Retirement': 'Product is being phased out. Focus on user migration, data archival, and graceful shutdown.'
  };
  
  return descriptions[stage] || 'Select a lifecycle stage to see its description.';
}

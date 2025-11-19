import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, DollarSign, Sparkles } from 'lucide-react';
import { apiClient } from '../lib/api';

interface FundingSource {
  id: string;
  source: string;
  amount: number;
}

interface Investment {
  budget: number;
  revenue: number;
  roi: number;
  npv: number;
}

interface InvestmentTabProps {
  portfolioId: string;
  investment: Investment;
  funding: FundingSource[];
  onUpdate: () => void;
}

export function InvestmentTab({ portfolioId, investment, funding, onUpdate }: InvestmentTabProps) {
  const [newFunding, setNewFunding] = useState({ source: '', amount: 0 });
  const [localInvestment, setLocalInvestment] = useState(investment);
  const [showROIScenarios, setShowROIScenarios] = useState(false);
  const [roiScenarios, setROIScenarios] = useState<any[]>([]);

  const handleUpdateInvestment = async (field: string, value: number) => {
    const updated = { ...localInvestment, [field]: value };
    
    if (field === 'budget' || field === 'revenue') {
      const budget = field === 'budget' ? value : updated.budget;
      const revenue = field === 'revenue' ? value : updated.revenue;
      if (budget > 0) {
        updated.roi = ((revenue - budget) / budget) * 100;
      }
    }
    
    setLocalInvestment(updated);
    
    try {
      await apiClient.updateInvestment(portfolioId, updated);
      onUpdate();
    } catch (error) {
      console.error('Failed to update investment:', error);
    }
  };

  const handleAddFunding = async () => {
    if (!newFunding.source.trim() || newFunding.amount <= 0) return;
    
    try {
      await apiClient.addFunding(portfolioId, newFunding);
      setNewFunding({ source: '', amount: 0 });
      onUpdate();
    } catch (error) {
      console.error('Failed to add funding:', error);
    }
  };

  const handleDeleteFunding = async (fundingId: string) => {
    try {
      await apiClient.deleteFunding(portfolioId, fundingId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete funding:', error);
    }
  };

  const handleGetROIScenarios = async () => {
    try {
      const response = await apiClient.getROIScenarios(portfolioId) as any;
      setROIScenarios(response.scenarios || []);
      setShowROIScenarios(true);
    } catch (error) {
      console.error('Failed to get ROI scenarios:', error);
    }
  };

  const totalFunding = funding.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      {/* Financial Calculators */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Overview</CardTitle>
            <Button variant="outline" onClick={handleGetROIScenarios}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI ROI Scenarios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={localInvestment.budget}
                onChange={(e) => handleUpdateInvestment('budget', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="revenue">Projected Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                value={localInvestment.revenue}
                onChange={(e) => handleUpdateInvestment('revenue', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="roi">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                value={localInvestment.roi.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Calculated automatically</p>
            </div>
            <div>
              <Label htmlFor="npv">NPV ($)</Label>
              <Input
                id="npv"
                type="number"
                value={localInvestment.npv}
                onChange={(e) => handleUpdateInvestment('npv', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-3">Financial Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Budget</div>
                <div className="text-xl font-bold text-blue-600">
                  ${localInvestment.budget.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Projected Revenue</div>
                <div className="text-xl font-bold text-green-600">
                  ${localInvestment.revenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600">ROI</div>
                <div className={`text-xl font-bold ${localInvestment.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {localInvestment.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Funding Source</Label>
              <Input
                value={newFunding.source}
                onChange={(e) => setNewFunding({ ...newFunding, source: e.target.value })}
                placeholder="e.g., Seed Round, VC Investment"
              />
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={newFunding.amount}
                onChange={(e) => setNewFunding({ ...newFunding, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddFunding}>
            <Plus className="w-4 h-4 mr-2" />
            Add Funding Source
          </Button>

          {funding.length > 0 && (
            <div className="mt-6">
              <div className="space-y-2">
                {funding.map((fund) => (
                  <div key={fund.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">{fund.source}</div>
                        <div className="text-sm text-gray-600">${fund.amount.toLocaleString()}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFunding(fund.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Funding</span>
                  <span className="text-xl font-bold text-green-600">
                    ${totalFunding.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showROIScenarios} onOpenChange={setShowROIScenarios}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Generated ROI Scenarios</DialogTitle>
            <DialogDescription>
              Different revenue scenarios based on your budget and projected revenue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {roiScenarios.map((scenario, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{scenario.name}</h4>
                    <span className="text-sm text-gray-600">
                      {scenario.multiplier}x multiplier
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Revenue</div>
                      <div className="text-lg font-semibold text-blue-600">
                        ${scenario.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">ROI</div>
                      <div className={`text-lg font-semibold ${scenario.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.roi.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">NPV</div>
                      <div className={`text-lg font-semibold ${scenario.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${scenario.npv.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowROIScenarios(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

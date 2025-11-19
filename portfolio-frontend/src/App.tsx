import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Download, Moon, Sun } from 'lucide-react';
import { apiClient } from './lib/api';
import { MarketResearchTab } from './components/MarketResearchTab';
import { RoadmapTab } from './components/RoadmapTab';
import { InvestmentTab } from './components/InvestmentTab';
import { LifecycleTab } from './components/LifecycleTab';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  business_case: any;
  market_research: any;
  roadmap: any;
  investment: any;
  lifecycle: any;
  health_score: number;
  created_at: string;
  updated_at: string;
}

function App() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPortfolios() as Portfolio[];
      setPortfolios(data);
      if (data.length > 0 && !currentPortfolio) {
        setCurrentPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;
    
    try {
      const portfolio = await apiClient.createPortfolio({
        name: newPortfolioName,
        description: newPortfolioDesc
      }) as Portfolio;
      setPortfolios([...portfolios, portfolio]);
      setCurrentPortfolio(portfolio);
      setShowAddPortfolio(false);
      setNewPortfolioName('');
      setNewPortfolioDesc('');
    } catch (error) {
      console.error('Failed to create portfolio:', error);
    }
  };

  const handleUpdateBusinessCase = async (field: string, value: any) => {
    if (!currentPortfolio) return;
    
    try {
      const updated = await apiClient.updateBusinessCase(currentPortfolio.id, {
        [field]: value
      }) as Portfolio;
      setCurrentPortfolio(updated);
      setPortfolios(portfolios.map(p => p.id === updated.id ? updated : p));
    } catch (error) {
      console.error('Failed to update business case:', error);
    }
  };

  const handleExportSummary = () => {
    if (!currentPortfolio) return;
    
    const summary = {
      portfolio: currentPortfolio.name,
      health_score: currentPortfolio.health_score,
      business_case: currentPortfolio.business_case,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPortfolio.name}-summary.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolio Management v2.0
              </h1>
              
              <div className="flex items-center gap-4">
                {portfolios.length > 0 && (
                  <Select
                    value={currentPortfolio?.id}
                    onValueChange={(id) => {
                      const portfolio = portfolios.find(p => p.id === id);
                      if (portfolio) setCurrentPortfolio(portfolio);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select portfolio" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Dialog open={showAddPortfolio} onOpenChange={setShowAddPortfolio}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Portfolio
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Portfolio</DialogTitle>
                      <DialogDescription>
                        Add a new product portfolio to manage
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Portfolio Name</Label>
                        <Input
                          id="name"
                          value={newPortfolioName}
                          onChange={(e) => setNewPortfolioName(e.target.value)}
                          placeholder="e.g., SaaS Product Line"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newPortfolioDesc}
                          onChange={(e) => setNewPortfolioDesc(e.target.value)}
                          placeholder="Brief description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddPortfolio(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePortfolio}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {portfolios.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Portfolio Management v2.0</CardTitle>
                <CardDescription>
                  Get started by creating your first portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAddPortfolio(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Portfolio
                </Button>
              </CardContent>
            </Card>
          ) : currentPortfolio && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{currentPortfolio.name}</CardTitle>
                  <CardDescription>{currentPortfolio.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Health Score</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {currentPortfolio.health_score}%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save All
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportSummary}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="business-case" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="business-case">Business Case</TabsTrigger>
                  <TabsTrigger value="market-research">Market Research</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  <TabsTrigger value="investment">Investment</TabsTrigger>
                  <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                </TabsList>

                <TabsContent value="business-case">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Case</CardTitle>
                      <CardDescription>
                        Define the problem, value proposition, and SWOT analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="problem">Problem Statement</Label>
                        <Textarea
                          id="problem"
                          value={currentPortfolio.business_case.problem}
                          onChange={(e) => handleUpdateBusinessCase('problem', e.target.value)}
                          placeholder="What problem does this product solve?"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="value_prop">Value Proposition</Label>
                        <Textarea
                          id="value_prop"
                          value={currentPortfolio.business_case.value_prop}
                          onChange={(e) => handleUpdateBusinessCase('value_prop', e.target.value)}
                          placeholder="What unique value does this product provide?"
                          rows={4}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-4">SWOT Analysis</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Strengths</Label>
                            <Textarea
                              value={currentPortfolio.business_case.swot.strengths}
                              onChange={(e) => handleUpdateBusinessCase('swot', {
                                ...currentPortfolio.business_case.swot,
                                strengths: e.target.value
                              })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label>Weaknesses</Label>
                            <Textarea
                              value={currentPortfolio.business_case.swot.weaknesses}
                              onChange={(e) => handleUpdateBusinessCase('swot', {
                                ...currentPortfolio.business_case.swot,
                                weaknesses: e.target.value
                              })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label>Opportunities</Label>
                            <Textarea
                              value={currentPortfolio.business_case.swot.opportunities}
                              onChange={(e) => handleUpdateBusinessCase('swot', {
                                ...currentPortfolio.business_case.swot,
                                opportunities: e.target.value
                              })}
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label>Threats</Label>
                            <Textarea
                              value={currentPortfolio.business_case.swot.threats}
                              onChange={(e) => handleUpdateBusinessCase('swot', {
                                ...currentPortfolio.business_case.swot,
                                threats: e.target.value
                              })}
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="market-research">
                  <MarketResearchTab
                    portfolioId={currentPortfolio.id}
                    competitors={currentPortfolio.market_research.competitors}
                    personas={currentPortfolio.market_research.personas}
                    onUpdate={loadPortfolios}
                  />
                </TabsContent>

                <TabsContent value="roadmap">
                  <RoadmapTab
                    portfolioId={currentPortfolio.id}
                    milestones={currentPortfolio.roadmap.milestones}
                    onUpdate={loadPortfolios}
                  />
                </TabsContent>

                <TabsContent value="investment">
                  <InvestmentTab
                    portfolioId={currentPortfolio.id}
                    investment={currentPortfolio.investment}
                    funding={currentPortfolio.investment.funding}
                    onUpdate={loadPortfolios}
                  />
                </TabsContent>

                <TabsContent value="lifecycle">
                  <LifecycleTab
                    portfolioId={currentPortfolio.id}
                    lifecycle={currentPortfolio.lifecycle}
                    kpis={currentPortfolio.lifecycle.kpis}
                    onUpdate={loadPortfolios}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App

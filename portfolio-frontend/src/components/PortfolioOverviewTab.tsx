import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import apiClient from '../lib/api';

interface OverviewData {
  total_portfolios: number;
  average_health_score: number;
  total_milestones: number;
  total_kpis: number;
  stage_distribution: Record<string, number>;
  total_budget: number;
  total_revenue: number;
  average_roi: number;
  portfolios: Array<{
    id: string;
    name: string;
    health_score: number;
    stage: string;
    milestones: number;
    roi: number;
  }>;
}

export default function PortfolioOverviewTab() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPortfolioOverview();
      setOverview(data as OverviewData);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading overview...</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Overview</h2>
        <Button onClick={loadOverview} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-3xl">{overview.total_portfolios}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Health Score</CardDescription>
            <CardTitle className="text-3xl">{overview.average_health_score}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Milestones</CardDescription>
            <CardTitle className="text-3xl">{overview.total_milestones}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average ROI</CardDescription>
            <CardTitle className="text-3xl">{overview.average_roi}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Budget:</span>
              <span className="font-semibold">${overview.total_budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold">${overview.total_revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total KPIs:</span>
              <span className="font-semibold">{overview.total_kpis}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(overview.stage_distribution).map(([stage, count]) => (
              <div key={stage} className="flex justify-between items-center">
                <span className="text-gray-600">{stage}:</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600">Stage: {portfolio.stage}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Health</div>
                    <div className="font-semibold">{portfolio.health_score}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Milestones</div>
                    <div className="font-semibold">{portfolio.milestones}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">ROI</div>
                    <div className="font-semibold">{portfolio.roi.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

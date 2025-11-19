import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Download, Sparkles, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface Report {
  id: string;
  name: string;
  report_type: string;
  config: any;
  created_at: string;
}

interface CustomReportingTabProps {
  portfolioId: string;
}

export default function CustomReportingTab({ portfolioId }: CustomReportingTabProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    report_type: 'chart',
    config: {}
  });

  const reportTypes = [
    { value: 'chart', label: 'Chart Report' },
    { value: 'pivot', label: 'Pivot Table' },
    { value: 'list', label: 'List Report' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadReports();
  }, [portfolioId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getReports(portfolioId);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.name.trim()) return;
    
    try {
      await apiClient.createReport(portfolioId, newReport);
      setNewReport({ name: '', report_type: 'chart', config: {} });
      setShowForm(false);
      loadReports();
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const handleExecuteReport = async (report: Report) => {
    try {
      setLoading(true);
      const data = await apiClient.executeReport(report.id);
      setReportData(data);
      setSelectedReport(report);
    } catch (error) {
      console.error('Failed to execute report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async (reportId: string) => {
    try {
      const data = await apiClient.getReportInsights(reportId);
      setInsights(data.insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Delete this report?')) return;
    
    try {
      await apiClient.deleteReport(reportId);
      loadReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
        setReportData(null);
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const renderChart = () => {
    if (!reportData || !reportData.data) return null;

    if (reportData.type === 'chart' && reportData.data.datasets) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.data.labels.map((label: string, idx: number) => ({
            name: label,
            ...reportData.data.datasets.reduce((acc: any, dataset: any) => ({
              ...acc,
              [dataset.label]: dataset.data[idx]
            }), {})
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {reportData.data.datasets.map((dataset: any, idx: number) => (
              <Line key={idx} type="monotone" dataKey={dataset.label} stroke={COLORS[idx % COLORS.length]} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (reportData.type === 'pivot' && reportData.data.rows) {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Stage</th>
                <th className="border p-2 text-right">Count</th>
                <th className="border p-2 text-right">Health Score</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.rows.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border p-2">{row.stage}</td>
                  <td className="border p-2 text-right">{row.count}</td>
                  <td className="border p-2 text-right">
                    <Badge variant={row.health > 80 ? 'default' : 'secondary'}>
                      {row.health}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <p className="text-gray-500">No data to display</p>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custom Reporting</h2>
          <p className="text-gray-600">Create and analyze custom reports</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Report'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Name</label>
              <Input
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                placeholder="e.g., Q4 Performance Report"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={newReport.report_type} onValueChange={(value) => setNewReport({ ...newReport, report_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateReport} className="w-full">Create Report</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Custom reports created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Fields</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100+</div>
            <p className="text-xs text-muted-foreground">Available data points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">Generated insights</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {reportTypes.find(t => t.value === report.report_type)?.label}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{report.report_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleExecuteReport(report)}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Execute
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateInsights(report.id)}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Insights
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reportData && selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{reportData.name}</CardTitle>
                <CardDescription>Generated at {new Date(reportData.generated_at).toLocaleString()}</CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return this.request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async getPortfolios() {
    return this.request('/api/portfolios');
  }

  async createPortfolio(data: { name: string; description?: string }) {
    return this.request('/api/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPortfolio(id: string) {
    return this.request(`/api/portfolios/${id}`);
  }

  async updatePortfolio(id: string, data: { name: string; description?: string }) {
    return this.request(`/api/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePortfolio(id: string) {
    return this.request(`/api/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  async updateBusinessCase(portfolioId: string, data: any) {
    return this.request(`/api/portfolios/${portfolioId}/business-case`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addCompetitor(portfolioId: string, competitor: any) {
    return this.request(`/api/portfolios/${portfolioId}/competitors`, {
      method: 'POST',
      body: JSON.stringify(competitor),
    });
  }

  async deleteCompetitor(portfolioId: string, competitorId: string) {
    return this.request(`/api/portfolios/${portfolioId}/competitors/${competitorId}`, {
      method: 'DELETE',
    });
  }

  async addPersona(portfolioId: string, persona: any) {
    return this.request(`/api/portfolios/${portfolioId}/personas`, {
      method: 'POST',
      body: JSON.stringify(persona),
    });
  }

  async deletePersona(portfolioId: string, personaId: string) {
    return this.request(`/api/portfolios/${portfolioId}/personas/${personaId}`, {
      method: 'DELETE',
    });
  }

  async addMilestone(portfolioId: string, milestone: any) {
    return this.request(`/api/portfolios/${portfolioId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestone),
    });
  }

  async deleteMilestone(portfolioId: string, milestoneId: string) {
    return this.request(`/api/portfolios/${portfolioId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  }

  async updateInvestment(portfolioId: string, data: any) {
    return this.request(`/api/portfolios/${portfolioId}/investment`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addFunding(portfolioId: string, funding: any) {
    return this.request(`/api/portfolios/${portfolioId}/funding`, {
      method: 'POST',
      body: JSON.stringify(funding),
    });
  }

  async deleteFunding(portfolioId: string, fundingId: string) {
    return this.request(`/api/portfolios/${portfolioId}/funding/${fundingId}`, {
      method: 'DELETE',
    });
  }

  async updateLifecycleStage(portfolioId: string, stage: string) {
    return this.request(`/api/portfolios/${portfolioId}/lifecycle/stage?stage=${stage}`, {
      method: 'PUT',
    });
  }

  async addKPI(portfolioId: string, kpi: any) {
    return this.request(`/api/portfolios/${portfolioId}/kpis`, {
      method: 'POST',
      body: JSON.stringify(kpi),
    });
  }

  async deleteKPI(portfolioId: string, kpiId: string) {
    return this.request(`/api/portfolios/${portfolioId}/kpis/${kpiId}`, {
      method: 'DELETE',
    });
  }

  async getHealthScore(portfolioId: string) {
    return this.request(`/api/analytics/health-score/${portfolioId}`);
  }

  async getMilestonePriorities(portfolioId: string) {
    return this.request(`/api/ai/prioritize-milestones/${portfolioId}`);
  }

  async getROIScenarios(portfolioId: string) {
    return this.request(`/api/ai/roi-scenarios/${portfolioId}`);
  }

  async addFeedback(portfolioId: string, feedback: any) {
    return this.request(`/api/portfolios/${portfolioId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async deleteFeedback(portfolioId: string, feedbackId: string) {
    return this.request(`/api/portfolios/${portfolioId}/feedback/${feedbackId}`, {
      method: 'DELETE',
    });
  }

  async getPortfolioVersions(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/versions`);
  }

  async savePortfolioVersion(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/versions/save`, {
      method: 'POST',
    });
  }

  async restorePortfolioVersion(portfolioId: string, versionId: string) {
    return this.request(`/api/portfolios/${portfolioId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  }

  async getPortfolioOverview() {
    return this.request('/api/analytics/overview');
  }

  async exportPortfolioCSV(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/export/csv`);
  }

  async exportPortfolioJSON(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/export/json`);
  }

  async getNotifications() {
    return this.request('/api/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async createIdea(portfolioId: string, idea: any) {
    return this.request(`/api/portfolios/${portfolioId}/ideas`, {
      method: 'POST',
      body: JSON.stringify(idea),
    });
  }

  async getIdeas(portfolioId: string, category?: string, status?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/portfolios/${portfolioId}/ideas${query}`);
  }

  async getIdea(ideaId: string) {
    return this.request(`/api/ideas/${ideaId}`);
  }

  async updateIdea(ideaId: string, idea: any) {
    return this.request(`/api/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify(idea),
    });
  }

  async deleteIdea(ideaId: string) {
    return this.request(`/api/ideas/${ideaId}`, {
      method: 'DELETE',
    });
  }

  async voteIdea(ideaId: string, voterEmail: string) {
    return this.request(`/api/ideas/${ideaId}/vote?voter_email=${voterEmail}`, {
      method: 'POST',
    });
  }

  async unvoteIdea(ideaId: string, voterEmail: string) {
    return this.request(`/api/ideas/${ideaId}/vote?voter_email=${voterEmail}`, {
      method: 'DELETE',
    });
  }

  async addIdeaComment(ideaId: string, comment: any) {
    return this.request(`/api/ideas/${ideaId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async deleteIdeaComment(ideaId: string, commentId: string) {
    return this.request(`/api/ideas/${ideaId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async promoteIdea(ideaId: string) {
    return this.request(`/api/ideas/${ideaId}/promote`, {
      method: 'POST',
    });
  }

  async getCapacityOverview(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/capacity`);
  }

  async createCapacityResource(portfolioId: string, resource: any) {
    return this.request(`/api/portfolios/${portfolioId}/capacity/resources`, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  async updateCapacityResource(resourceId: string, resource: any) {
    return this.request(`/api/capacity/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
  }

  async deleteCapacityResource(resourceId: string) {
    return this.request(`/api/capacity/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  async updateMilestoneEffort(milestoneId: string, effort: any) {
    return this.request(`/api/milestones/${milestoneId}/effort`, {
      method: 'PUT',
      body: JSON.stringify(effort),
    });
  }

  async getWorkloadAnalysis(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/capacity/workload`);
  }

  async createReport(portfolioId: string, report: any) {
    return this.request(`/api/portfolios/${portfolioId}/reports`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async getReports(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/reports`);
  }

  async getReport(reportId: string) {
    return this.request(`/api/reports/${reportId}`);
  }

  async updateReport(reportId: string, report: any) {
    return this.request(`/api/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(report),
    });
  }

  async deleteReport(reportId: string) {
    return this.request(`/api/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async executeReport(reportId: string) {
    return this.request(`/api/reports/${reportId}/execute`, {
      method: 'POST',
    });
  }

  async getReportInsights(reportId: string) {
    return this.request(`/api/reports/${reportId}/ai-insights`, {
      method: 'POST',
    });
  }

  async createWhiteboard(portfolioId: string, whiteboard: any) {
    return this.request(`/api/portfolios/${portfolioId}/whiteboards`, {
      method: 'POST',
      body: JSON.stringify(whiteboard),
    });
  }

  async getWhiteboards(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/whiteboards`);
  }

  async getWhiteboard(whiteboardId: string) {
    return this.request(`/api/whiteboards/${whiteboardId}`);
  }

  async updateWhiteboard(whiteboardId: string, whiteboard: any) {
    return this.request(`/api/whiteboards/${whiteboardId}`, {
      method: 'PUT',
      body: JSON.stringify(whiteboard),
    });
  }

  async deleteWhiteboard(whiteboardId: string) {
    return this.request(`/api/whiteboards/${whiteboardId}`, {
      method: 'DELETE',
    });
  }

  async getWhiteboardSuggestions(whiteboardId: string) {
    return this.request(`/api/whiteboards/${whiteboardId}/ai-suggestions`, {
      method: 'POST',
    });
  }

  async createIntegration(portfolioId: string, integration: any) {
    return this.request(`/api/portfolios/${portfolioId}/integrations`, {
      method: 'POST',
      body: JSON.stringify(integration),
    });
  }

  async getIntegrations(portfolioId: string) {
    return this.request(`/api/portfolios/${portfolioId}/integrations`);
  }

  async getIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}`);
  }

  async updateIntegration(integrationId: string, integration: any) {
    return this.request(`/api/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(integration),
    });
  }

  async deleteIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async syncIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  async getIntegrationLogs(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/logs`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

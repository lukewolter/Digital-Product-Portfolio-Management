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
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
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
}

export const apiClient = new ApiClient();
export default apiClient;

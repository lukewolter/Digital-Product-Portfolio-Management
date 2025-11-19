export interface Portfolio {
  id: string;
  name: string;
  description: string;
  businessCase: BusinessCase;
  marketResearch: MarketResearch;
  roadmap: Roadmap;
  investment: Investment;
  lifecycle: Lifecycle;
  healthScore: number;
}

export interface BusinessCase {
  problem: string;
  valueProp: string;
  swot: {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
  };
}

export interface Competitor {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
}

export interface Persona {
  id: string;
  demographics: string;
  painPoints: string;
}

export interface MarketResearch {
  competitors: Competitor[];
  personas: Persona[];
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  dependencies: string[];
}

export interface Roadmap {
  milestones: Milestone[];
}

export interface FundingSource {
  id: string;
  source: string;
  amount: number;
}

export interface Investment {
  budget: number;
  revenue: number;
  roi: number;
  npv: number;
  funding: FundingSource[];
  scenarios: {
    multiplier: number;
  };
}

export interface KPI {
  id: string;
  metric: string;
  value: number;
}

export interface Lifecycle {
  currentStage: string;
  kpis: KPI[];
  reminders: string[];
}

export type LifecycleStage = 'Ideation' | 'Development' | 'Launch' | 'Growth' | 'Maturity' | 'Retirement';

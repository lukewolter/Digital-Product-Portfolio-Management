export const calculateROI = (revenue: number, budget: number): number => {
  if (budget === 0) return 0;
  return ((revenue - budget) / budget) * 100;
};

export const calculateNPV = (
  revenue: number,
  budget: number,
  discountRate: number = 0.1,
  years: number = 5
): number => {
  let npv = -budget;
  const annualCashFlow = revenue / years;
  
  for (let year = 1; year <= years; year++) {
    npv += annualCashFlow / Math.pow(1 + discountRate, year);
  }
  
  return npv;
};

export const calculateHealthScore = (
  businessCaseFilled: boolean,
  competitorsCount: number,
  personasCount: number,
  milestonesCount: number,
  budgetSet: boolean,
  kpisCount: number
): number => {
  let score = 0;
  
  if (businessCaseFilled) score += 20;
  if (competitorsCount > 0) score += 15;
  if (personasCount > 0) score += 15;
  if (milestonesCount > 0) score += 20;
  if (budgetSet) score += 15;
  if (kpisCount > 0) score += 15;
  
  return Math.min(score, 100);
};

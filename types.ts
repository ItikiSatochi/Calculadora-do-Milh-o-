
export type CalculationMode = 'TIME_TO_MILLION' | 'CONTRIBUTION_FOR_MILLION';

export interface FinancialInputs {
  initialValue: number | string;
  monthlyContribution: number | string;
  annualInterestRate: number | string;
  years: number | string;
  mode: CalculationMode;
}

export interface YearData {
  year: number;
  annualContribution: number;
  annualInterest: number;
  totalInvested: number;
  totalInterest: number;
  totalAccumulated: number;
}

export interface MonthData {
  month: number;
  total: number;
  invested: number;
  interest: number;
}

export interface CalculationResult {
  finalTotal: number;
  totalInvested: number;
  totalInterest: number;
  history: MonthData[];
  yearlyBreakdown: YearData[];
  targetReachedInMonths: number;
  requiredMonthlyAporte?: number;
  powerFactor: number; // Percentage of interest over invested
}

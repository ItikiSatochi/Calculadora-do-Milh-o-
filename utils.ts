
import { FinancialInputs, CalculationResult, MonthData, YearData } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateFinancials = (inputs: FinancialInputs, tool: 'MILLION' | 'COMPOUND'): CalculationResult => {
  const initialValue = Number(inputs.initialValue) || 0;
  const monthlyContribution = Number(inputs.monthlyContribution) || 0;
  const annualInterestRate = Number(inputs.annualInterestRate) || 0;
  const years = Number(inputs.years) || 0;
  
  // Para Juros Compostos
  const periodValue = Number(inputs.periodValue) || 0;
  const isMonthlyRate = inputs.rateType === 'MONTHLY';
  const isMonthlyPeriod = inputs.periodType === 'MONTHS';

  // Normalização da Taxa Mensal
  let monthlyRate: number;
  if (tool === 'MILLION') {
    monthlyRate = Math.pow(1 + (annualInterestRate / 100), 1 / 12) - 1;
  } else {
    if (isMonthlyRate) {
      monthlyRate = annualInterestRate / 100;
    } else {
      monthlyRate = Math.pow(1 + (annualInterestRate / 100), 1 / 12) - 1;
    }
  }

  // Normalização do Período
  const totalMonths = tool === 'MILLION' 
    ? (inputs.mode === 'TIME_TO_MILLION' ? 1200 : years * 12) 
    : (isMonthlyPeriod ? periodValue : periodValue * 12);

  const target = 1000000;
  let resultMonthlyContribution = monthlyContribution;

  // Cálculo de Aporte para o Milhão
  if (tool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION') {
    const n = years * 12;
    const fvInitial = initialValue * Math.pow(1 + monthlyRate, n);
    const neededFromAportes = target - fvInitial;
    if (neededFromAportes <= 0) {
      resultMonthlyContribution = 0;
    } else {
      const factor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
      resultMonthlyContribution = neededFromAportes / factor;
    }
  }

  const history: MonthData[] = [{ month: 0, total: initialValue, invested: initialValue, interest: 0, interestThisMonth: 0 }];
  const yearlyBreakdown: YearData[] = [];
  
  let currentTotal = initialValue;
  let currentInvested = initialValue;
  let targetMonth = -1;

  for (let m = 1; m <= totalMonths; m++) {
    const interestThisMonth = currentTotal * monthlyRate;
    currentTotal += interestThisMonth;
    currentTotal += resultMonthlyContribution;
    currentInvested += resultMonthlyContribution;

    history.push({
      month: m,
      total: currentTotal,
      invested: currentInvested,
      interest: currentTotal - currentInvested,
      interestThisMonth: interestThisMonth
    });

    if (currentTotal >= target && targetMonth === -1) {
      targetMonth = m;
      if (tool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION') break;
    }

    if (m % 12 === 0 || m === totalMonths) {
      const yearNum = Math.ceil(m / 12);
      const isFullYear = m % 12 === 0;
      
      if (isFullYear || m === totalMonths) {
          const prevTotal = history[m - (m % 12 || 12)].total;
          const prevInvested = history[m - (m % 12 || 12)].invested;
          
          yearlyBreakdown.push({
            year: yearNum,
            annualContribution: resultMonthlyContribution * (m % 12 || 12),
            annualInterest: (currentTotal - currentInvested) - (prevTotal - prevInvested),
            totalInvested: currentInvested,
            totalInterest: currentTotal - currentInvested,
            totalAccumulated: currentTotal
          });
      }
    }
  }

  return {
    finalTotal: currentTotal,
    totalInvested: currentInvested,
    totalInterest: currentTotal - currentInvested,
    history,
    yearlyBreakdown,
    targetReachedInMonths: targetMonth === -1 ? totalMonths : targetMonth,
    requiredMonthlyAporte: resultMonthlyContribution,
    powerFactor: currentInvested > 0 ? ((currentTotal - currentInvested) / currentInvested) * 100 : 0
  };
};

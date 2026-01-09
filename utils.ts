
import { FinancialInputs, CalculationResult, MonthData, YearData } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const calculateFinancials = (inputs: FinancialInputs): CalculationResult => {
  const initialValue = Number(inputs.initialValue) || 0;
  const monthlyContribution = Number(inputs.monthlyContribution) || 0;
  const annualInterestRate = Number(inputs.annualInterestRate) || 0;
  const years = Number(inputs.years) || 0;
  const mode = inputs.mode;

  // TAXA EQUIVALENTE MENSAL (Padrão Bancário/Investimentos)
  // Fórmula: (1 + i_anual)^(1/12) - 1
  const monthlyRate = Math.pow(1 + (annualInterestRate / 100), 1 / 12) - 1;
  const target = 1000000;
  
  let resultMonthlyContribution = monthlyContribution;

  // Cálculo de Aporte Necessário (Postecipado)
  if (mode === 'CONTRIBUTION_FOR_MILLION') {
    const n = years * 12;
    const fvInitial = initialValue * Math.pow(1 + monthlyRate, n);
    const neededFromAportes = target - fvInitial;
    
    if (neededFromAportes <= 0) {
      resultMonthlyContribution = 0;
    } else {
      // PMT = FV / [ ((1+i)^n - 1) / i ]
      const factor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
      resultMonthlyContribution = neededFromAportes / factor;
    }
  }

  const history: MonthData[] = [{ month: 0, total: initialValue, invested: initialValue, interest: 0 }];
  const yearlyBreakdown: YearData[] = [];
  
  let currentTotal = initialValue;
  let currentInvested = initialValue;
  let targetMonth = -1;

  // Simulação mês a mês (Modelo Postecipado)
  const maxMonths = mode === 'TIME_TO_MILLION' ? 1200 : Math.ceil(years * 12);

  for (let m = 1; m <= maxMonths; m++) {
    // 1. O saldo anterior rende juros
    const interestThisMonth = currentTotal * monthlyRate;
    currentTotal += interestThisMonth;

    // 2. O aporte é feito no FINAL do mês
    currentTotal += resultMonthlyContribution;
    currentInvested += resultMonthlyContribution;

    history.push({
      month: m,
      total: currentTotal,
      invested: currentInvested,
      interest: currentTotal - currentInvested
    });

    if (currentTotal >= target && targetMonth === -1) {
      targetMonth = m;
      if (mode === 'TIME_TO_MILLION') break; 
    }

    // Fechamento anual
    if (m % 12 === 0) {
      const prevYearTotal = m === 12 ? initialValue : history[m - 12].total;
      const prevYearInvested = m === 12 ? initialValue : history[m - 12].invested;
      
      yearlyBreakdown.push({
        year: m / 12,
        annualContribution: resultMonthlyContribution * 12,
        annualInterest: (currentTotal - currentInvested) - (prevYearTotal - prevYearInvested),
        totalInvested: currentInvested,
        totalInterest: currentTotal - currentInvested,
        totalAccumulated: currentTotal
      });
    }
  }

  return {
    finalTotal: currentTotal,
    totalInvested: currentInvested,
    totalInterest: currentTotal - currentInvested,
    history,
    yearlyBreakdown,
    targetReachedInMonths: targetMonth,
    requiredMonthlyAporte: mode === 'CONTRIBUTION_FOR_MILLION' ? resultMonthlyContribution : undefined,
    powerFactor: currentInvested > 0 ? ((currentTotal - currentInvested) / currentInvested) * 100 : 0
  };
};

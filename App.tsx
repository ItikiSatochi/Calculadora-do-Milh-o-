
import React, { useState, useEffect, useCallback } from 'react';
import { CalculationMode, FinancialInputs, CalculationResult } from './types';
import { calculateFinancials, formatCurrency } from './utils';
import DashboardCard from './components/DashboardCard';
import InvestmentChart from './components/InvestmentChart';
import CompositionChart from './components/CompositionChart';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [inputs, setInputs] = useState<FinancialInputs>({
    initialValue: 1000,
    monthlyContribution: 1000,
    annualInterestRate: 8,
    years: 26,
    mode: 'TIME_TO_MILLION'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    const res = calculateFinancials(inputs);
    setResult(res);
  }, [inputs]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const getAiInsight = async () => {
    if (!result) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os dados: Capital ${formatCurrency(Number(inputs.initialValue))}, Aporte ${formatCurrency(result.requiredMonthlyAporte || Number(inputs.monthlyContribution))}, Taxa ${inputs.annualInterestRate}%. Resultado: ${formatCurrency(result.finalTotal)}. Dê uma dica curta sobre paciência e aportes.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("A constância vence a genialidade no longo prazo.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
      {/* Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Calculadora <span className="text-red-600">Primeiro Milhão</span></h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Estratégia Matemática de Acumulação</p>
            </div>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'TIME_TO_MILLION'}))}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${inputs.mode === 'TIME_TO_MILLION' ? 'bg-red-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               PRAZO PARA 1M
             </button>
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'CONTRIBUTION_FOR_MILLION'}))}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'bg-red-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               APORTE PARA 1M
             </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                Parâmetros
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-2">Valor Inicial (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                    <input 
                      type="number" 
                      name="initialValue"
                      value={inputs.initialValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-2">
                    {inputs.mode === 'TIME_TO_MILLION' ? 'Aporte Mensal (R$)' : 'Prazo Desejado (Anos)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{inputs.mode === 'TIME_TO_MILLION' ? 'R$' : '📅'}</span>
                    <input 
                      type="number" 
                      name={inputs.mode === 'TIME_TO_MILLION' ? 'monthlyContribution' : 'years'}
                      value={inputs.mode === 'TIME_TO_MILLION' ? inputs.monthlyContribution : inputs.years}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-2">Taxa Anual (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                    <input 
                      type="number" 
                      name="annualInterestRate"
                      value={inputs.annualInterestRate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={getAiInsight}
                disabled={isAiLoading}
                className="w-full mt-8 py-4 bg-slate-800 hover:bg-red-800 text-white text-xs font-black rounded-2xl transition-all uppercase tracking-widest"
              >
                {isAiLoading ? 'Analisando...' : 'Gerar Insight IA'}
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] text-xs text-slate-400 leading-relaxed">
               <p className="font-bold text-white mb-2 uppercase tracking-widest">Diferença de Cálculo:</p>
               Nossa calculadora utiliza a <strong>Taxa Mensal Equivalente</strong> para precisão matemática bancária, batendo exatamente com os maiores sites de referência do mercado.
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-8">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DashboardCard 
                    title="Patrimônio Total" 
                    value={formatCurrency(result.finalTotal)} 
                    primary
                  />
                  <DashboardCard 
                    title="Investido" 
                    value={formatCurrency(result.totalInvested)} 
                  />
                  <DashboardCard 
                    title="Juros Recebidos" 
                    value={formatCurrency(result.totalInterest)} 
                  />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center">
                   <h2 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Meta Batida em:</h2>
                   <div className="text-5xl font-black text-white italic tracking-tighter">
                      {Math.floor(result.targetReachedInMonths / 12)} Anos e {result.targetReachedInMonths % 12} Meses
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
                      <h3 className="text-white font-bold text-sm mb-6 uppercase">Divisão do Patrimônio</h3>
                      <CompositionChart invested={result.totalInvested} interest={result.totalInterest} />
                   </div>
                   <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-center items-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-4">Alavancagem de Juros</div>
                      <div className="text-6xl font-black text-red-600 mb-2">{result.powerFactor.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400 text-center">Os juros multiplicaram seu capital investido nesta proporção.</div>
                   </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
                  <h3 className="text-white font-bold text-sm mb-8 uppercase text-center">Gráfico de Evolução</h3>
                  <InvestmentChart data={result.history} />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-500 uppercase font-black">
                      <tr>
                        <th className="px-6 py-4">Ano</th>
                        <th className="px-6 py-4">Total Investido</th>
                        <th className="px-6 py-4">Rendimento no Ano</th>
                        <th className="px-6 py-4 text-right">Saldo Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {result.yearlyBreakdown.map(year => (
                        <tr key={year.year} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{year.year}º</td>
                          <td className="px-6 py-4 text-slate-400">{formatCurrency(year.totalInvested)}</td>
                          <td className="px-6 py-4 text-red-500 font-bold">+{formatCurrency(year.annualInterest)}</td>
                          <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(year.totalAccumulated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {aiInsight && (
                   <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-3xl italic text-red-400 text-sm text-center">
                      "{aiInsight}"
                   </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;

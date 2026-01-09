
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Glow Effects - Cores mais suaves e modernas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Millennium <span className="text-emerald-400">Pro</span></h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Inteligência Patrimonial</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'TIME_TO_MILLION'}))}
               className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${inputs.mode === 'TIME_TO_MILLION' ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
             >
               PRAZO PARA 1M
             </button>
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'CONTRIBUTION_FOR_MILLION'}))}
               className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
             >
               APORTE PARA 1M
             </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
              <h2 className="text-sm font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                <div className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                Parâmetros
              </h2>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2 group-focus-within:text-emerald-400 transition-colors">Valor Inicial</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-bold">R$</span>
                    <input 
                      type="number" 
                      name="initialValue"
                      value={inputs.initialValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all group-hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2 group-focus-within:text-emerald-400 transition-colors">
                    {inputs.mode === 'TIME_TO_MILLION' ? 'Aporte Mensal' : 'Prazo Desejado'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">{inputs.mode === 'TIME_TO_MILLION' ? 'R$' : '📅'}</span>
                    <input 
                      type="number" 
                      name={inputs.mode === 'TIME_TO_MILLION' ? 'monthlyContribution' : 'years'}
                      value={inputs.mode === 'TIME_TO_MILLION' ? inputs.monthlyContribution : inputs.years}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all group-hover:border-white/20"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2 group-focus-within:text-emerald-400 transition-colors">Taxa Anual (%)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">%</span>
                    <input 
                      type="number" 
                      name="annualInterestRate"
                      value={inputs.annualInterestRate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all group-hover:border-white/20"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={getAiInsight}
                disabled={isAiLoading}
                className="w-full mt-10 py-4 bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-white text-[10px] font-black rounded-2xl transition-all duration-500 uppercase tracking-[0.2em] border border-white/10 hover:border-emerald-500 shadow-lg hover:shadow-emerald-500/20"
              >
                {isAiLoading ? 'Processando dados...' : 'Gerar Insight IA ✨'}
              </button>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] text-[11px] text-slate-400 leading-relaxed italic">
               <p className="font-bold text-emerald-400 mb-2 uppercase tracking-widest not-italic">Nota Técnica:</p>
               Algoritmo ajustado para <strong>Regime de Capitalização Anual</strong> com aportes postecipados, garantindo paridade com as principais ferramentas do mercado financeiro.
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-10">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DashboardCard 
                    title="Patrimônio Projetado" 
                    value={formatCurrency(result.finalTotal)} 
                    primary
                  />
                  <DashboardCard 
                    title="Capital Investido" 
                    value={formatCurrency(result.totalInvested)} 
                  />
                  <DashboardCard 
                    title="Rendimento (Juros)" 
                    value={formatCurrency(result.totalInterest)} 
                  />
                </div>

                <div className="bg-indigo-500/5 border border-white/5 p-12 rounded-[3rem] text-center shadow-inner relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   <h2 className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Horizonte de Conquista</h2>
                   <div className="text-5xl md:text-6xl font-black text-white italic tracking-tighter">
                      {Math.floor(result.targetReachedInMonths / 12)} <span className="text-emerald-400">Anos</span> e {result.targetReachedInMonths % 12} <span className="text-emerald-400">Meses</span>
                   </div>
                   <p className="mt-4 text-slate-500 text-xs font-medium">Distância temporal estimada para atingir a meta de R$ 1.000.000,00</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="text-white font-bold text-[10px] mb-8 uppercase tracking-widest text-center">Divisão de Capital</h3>
                      <CompositionChart invested={result.totalInvested} interest={result.totalInterest} />
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Multiplicador Financeiro</div>
                      <div className="text-7xl font-black text-emerald-500 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{result.powerFactor.toFixed(0)}%</div>
                      <div className="text-[11px] text-slate-400 max-w-[200px]">Os juros superaram o seu capital investido em quase <span className="text-emerald-400 font-bold">{(result.powerFactor/100).toFixed(1)}x</span>.</div>
                   </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem]">
                  <h3 className="text-white font-bold text-[10px] mb-10 uppercase tracking-widest text-center">Projeção de Curva Patrimonial</h3>
                  <InvestmentChart data={result.history} />
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">Extrato de Evolução Anual</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-500 uppercase font-black text-[9px]">
                        <tr>
                          <th className="px-8 py-5">Ano de Acúmulo</th>
                          <th className="px-8 py-5">Total Investido</th>
                          <th className="px-8 py-5">Rendimento Anual</th>
                          <th className="px-8 py-5 text-right">Patrimônio Líquido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.yearlyBreakdown.map(year => (
                          <tr key={year.year} className="hover:bg-white/[0.03] transition-colors duration-200">
                            <td className="px-8 py-5 font-bold text-white tracking-widest">{year.year.toString().padStart(2, '0')}º CICLO</td>
                            <td className="px-8 py-5 text-slate-400 font-mono">{formatCurrency(year.totalInvested)}</td>
                            <td className="px-8 py-5 text-emerald-400 font-bold font-mono">+{formatCurrency(year.annualInterest)}</td>
                            <td className="px-8 py-5 text-right font-black text-white font-mono">{formatCurrency(year.totalAccumulated)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {aiInsight && (
                   <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-700">
                      <p className="text-emerald-400 text-sm text-center leading-relaxed">
                        <span className="text-2xl mr-2">💡</span>
                        <span className="italic">"{aiInsight}"</span>
                      </p>
                   </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="relative z-10 py-12 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.4em]">
            Millennium Pro • Intelligent Wealth Projection
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;


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
      // Usando fallback para evitar crash se o process.env não estiver disponível
      const apiKey = process?.env?.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analise: Capital ${formatCurrency(Number(inputs.initialValue))}, Aporte ${formatCurrency(result.requiredMonthlyAporte || Number(inputs.monthlyContribution))}, Taxa ${inputs.annualInterestRate}%. Resultado Final: ${formatCurrency(result.finalTotal)}. Dê um conselho financeiro muito curto.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("O tempo é o melhor amigo dos juros compostos.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Luzes de fundo para estética premium */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-3xl py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Millennium <span className="text-emerald-400">Pro</span></h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Arquitetura de Riqueza</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'TIME_TO_MILLION'}))}
               className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-500 ${inputs.mode === 'TIME_TO_MILLION' ? 'bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
             >
               PRAZO PARA 1M
             </button>
             <button 
               onClick={() => setInputs(p => ({...p, mode: 'CONTRIBUTION_FOR_MILLION'}))}
               className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-500 ${inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'bg-emerald-500 text-slate-950 shadow-2xl shadow-emerald-500/40' : 'text-slate-400 hover:text-white'}`}
             >
               APORTE PARA 1M
             </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Configuração</h2>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-slate-500 text-[9px] font-black uppercase mb-3 tracking-widest group-focus-within:text-emerald-400 transition-colors">Patrimônio Inicial</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-black">R$</span>
                    <input 
                      type="number" 
                      name="initialValue"
                      value={inputs.initialValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-lg focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-slate-500 text-[9px] font-black uppercase mb-3 tracking-widest group-focus-within:text-emerald-400 transition-colors">
                    {inputs.mode === 'TIME_TO_MILLION' ? 'Investimento Mensal' : 'Janela de Tempo (Anos)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-sm">{inputs.mode === 'TIME_TO_MILLION' ? 'R$' : '📅'}</span>
                    <input 
                      type="number" 
                      name={inputs.mode === 'TIME_TO_MILLION' ? 'monthlyContribution' : 'years'}
                      value={inputs.mode === 'TIME_TO_MILLION' ? inputs.monthlyContribution : inputs.years}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-lg focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-slate-500 text-[9px] font-black uppercase mb-3 tracking-widest group-focus-within:text-emerald-400 transition-colors">Taxa de Rentabilidade Anual</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-sm">%</span>
                    <input 
                      type="number" 
                      name="annualInterestRate"
                      value={inputs.annualInterestRate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white font-mono text-lg focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={getAiInsight}
                disabled={isAiLoading}
                className="w-full mt-12 py-5 bg-gradient-to-r from-emerald-600/10 to-emerald-400/10 hover:from-emerald-500 hover:to-emerald-400 hover:text-slate-950 text-emerald-400 text-[10px] font-black rounded-2xl transition-all duration-700 uppercase tracking-[0.3em] border border-emerald-500/20 hover:border-emerald-500 shadow-xl"
              >
                {isAiLoading ? 'Analisando Fluxo...' : 'Consultar Oráculo IA ✨'}
              </button>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-12">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <DashboardCard 
                    title="Montante Acumulado" 
                    value={formatCurrency(result.finalTotal)} 
                    primary
                  />
                  <DashboardCard 
                    title="Total Aportado" 
                    value={formatCurrency(result.totalInvested)} 
                  />
                  <DashboardCard 
                    title="Lucro em Juros" 
                    value={formatCurrency(result.totalInterest)} 
                  />
                </div>

                <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-16 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                   <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6">Tempo de Maturação</h2>
                   <div className="text-6xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      {Math.floor(result.targetReachedInMonths / 12)} <span className="text-emerald-500">Anos</span> e {result.targetReachedInMonths % 12} <span className="text-emerald-500">Meses</span>
                   </div>
                   <div className="mt-8 flex justify-center">
                      <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                         Meta: R$ 1.000.000,00
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] backdrop-blur-sm">
                      <h3 className="text-white font-black text-[10px] mb-10 uppercase tracking-[0.3em] text-center">Estrutura Patrimonial</h3>
                      <CompositionChart invested={result.totalInvested} interest={result.totalInterest} />
                   </div>
                   <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center backdrop-blur-sm">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-6">Eficiência de Juros</div>
                      <div className="text-8xl font-black text-emerald-500 mb-4 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">{result.powerFactor.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                        Os juros compostos multiplicaram seu capital investido por <span className="text-emerald-400 font-black">{(result.powerFactor/100 + 1).toFixed(1)}x</span> nesta jornada.
                      </div>
                   </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-sm">
                  <h3 className="text-white font-black text-[10px] mb-12 uppercase tracking-[0.3em] text-center">Vetor de Crescimento</h3>
                  <InvestmentChart data={result.history} />
                </div>

                <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Histórico de Evolução Por Ciclo</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950/80 text-slate-500 uppercase font-black text-[9px]">
                        <tr>
                          <th className="px-10 py-6 tracking-widest">Ano</th>
                          <th className="px-10 py-6 tracking-widest">Capital</th>
                          <th className="px-10 py-6 tracking-widest">Rendimento</th>
                          <th className="px-10 py-6 text-right tracking-widest">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.yearlyBreakdown.map(year => (
                          <tr key={year.year} className="hover:bg-emerald-500/[0.03] transition-colors duration-300 group">
                            <td className="px-10 py-6 font-black text-white group-hover:text-emerald-400 transition-colors">{year.year.toString().padStart(2, '0')}º CICLO</td>
                            <td className="px-10 py-6 text-slate-400 font-mono tracking-tighter">{formatCurrency(year.totalInvested)}</td>
                            <td className="px-10 py-6 text-emerald-400 font-black font-mono tracking-tighter">+{formatCurrency(year.annualInterest)}</td>
                            <td className="px-10 py-6 text-right font-black text-white font-mono tracking-tighter">{formatCurrency(year.totalAccumulated)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {aiInsight && (
                   <div className="p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] shadow-2xl shadow-emerald-500/5 animate-in fade-in zoom-in duration-1000">
                      <p className="text-emerald-400 text-sm text-center leading-relaxed">
                        <span className="text-3xl block mb-4">💎</span>
                        <span className="italic font-medium text-lg">"{aiInsight}"</span>
                      </p>
                   </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <footer className="relative z-10 py-20 border-t border-white/5 mt-20 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em] mb-4">
            Millennium Pro • Intelligent Wealth Projection
          </p>
          <div className="w-12 h-1 bg-emerald-500/20 mx-auto rounded-full"></div>
      </footer>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useCallback } from 'react';
import { ToolType, CalculationMode, FinancialInputs, CalculationResult } from './types';
import { calculateFinancials, formatCurrency } from './utils';
import DashboardCard from './components/DashboardCard';
import InvestmentChart from './components/InvestmentChart';
import CompositionChart from './components/CompositionChart';
import { GoogleGenAI } from "@google/genai";

// Switching to named export to resolve "no default export" error in index.tsx
export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('MILLION');
  const [inputs, setInputs] = useState<FinancialInputs>({
    initialValue: 1000,
    monthlyContribution: 1000,
    annualInterestRate: 8,
    years: 26,
    mode: 'TIME_TO_MILLION',
    periodType: 'YEARS',
    rateType: 'ANNUAL',
    periodValue: 10
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Configuração de cores baseada no tema ativo
  const isMillion = activeTool === 'MILLION';
  const themeColor = isMillion ? 'emerald' : 'indigo';
  const themeHex = isMillion ? '#10b981' : '#6366f1';

  const handleCalculate = useCallback(() => {
    const res = calculateFinancials(inputs, activeTool);
    setResult(res);
  }, [inputs, activeTool]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Added type assertion to fix potential "Spread types may only be created from object types" or index signature issues
    setInputs(prev => ({ ...prev, [name]: value } as FinancialInputs));
  };

  const getAiInsight = async () => {
    if (!result) return;
    setIsAiLoading(true);
    try {
      // Fix: Creating GoogleGenAI instance directly with process.env.API_KEY as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = `Analise financeiramente: Capital R$ ${inputs.initialValue}, aporte R$ ${result.requiredMonthlyAporte}, taxa ${inputs.annualInterestRate}%. Resultado: ${formatCurrency(result.finalTotal)}. Dê um insight curto e profissional para um investidor.`;
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: promptText 
      });
      // Correctly accessing the .text property of GenerateContentResponse
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("O tempo e a disciplina são os maiores multiplicadores de riqueza. Mantenha o foco no longo prazo.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Glows Dinâmicos conforme o Tema */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 transition-all duration-1000">
        <div className={`absolute top-[-10%] left-[-5%] w-[50%] h-[50%] ${isMillion ? 'bg-emerald-600/30' : 'bg-indigo-600/30'} rounded-full blur-[140px] animate-pulse`}></div>
        <div className={`absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] ${isMillion ? 'bg-cyan-600/20' : 'bg-violet-600/20'} rounded-full blur-[140px] animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="relative z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-3xl py-4 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${isMillion ? 'from-emerald-400 to-teal-600 shadow-emerald-500/20' : 'from-indigo-400 to-violet-600 shadow-indigo-500/20'} rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">Millennium <span className={isMillion ? 'text-emerald-400' : 'text-indigo-400'}>Pro</span></h1>
              <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.3em]">Investidor Sardinha • Inteligência Financeira</p>
            </div>
          </div>

          <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
             <button 
               onClick={() => setActiveTool('MILLION')}
               className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${isMillion ? 'bg-emerald-500 text-slate-950 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}
             >
               PRIMEIRO MILHÃO
             </button>
             <button 
               onClick={() => setActiveTool('COMPOUND')}
               className={`px-6 py-2 rounded-xl text-[9px] font-black transition-all ${!isMillion ? 'bg-indigo-500 text-slate-950 shadow-xl scale-105' : 'text-slate-400 hover:text-white'}`}
             >
               JUROS COMPOSTOS
             </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-[1920px] mx-auto px-6 md:px-16 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <aside className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
            <div className="bg-slate-900/40 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 ${isMillion ? 'bg-emerald-500/5' : 'bg-indigo-500/5'} rounded-full blur-3xl -mr-16 -mt-16`}></div>
              
              <h2 className="text-white font-black text-[10px] uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isMillion ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]'} animate-pulse`}></div>
                Configurações da Ferramenta
              </h2>
              
              {isMillion && (
                <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 mb-8 shadow-inner">
                  <button 
                    onClick={() => setInputs(p => ({...p, mode: 'TIME_TO_MILLION'}))}
                    className={`flex-1 py-2.5 text-[8px] font-black rounded-xl transition-all ${inputs.mode === 'TIME_TO_MILLION' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600'}`}
                  >
                    PRAZO
                  </button>
                  <button 
                    onClick={() => setInputs(p => ({...p, mode: 'CONTRIBUTION_FOR_MILLION'}))}
                    className={`flex-1 py-2.5 text-[8px] font-black rounded-xl transition-all ${inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600'}`}
                  >
                    APORTE
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest flex justify-between">
                    Valor Inicial <span>(R$)</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isMillion ? 'text-emerald-500' : 'text-indigo-500'} font-bold text-xs`}>R$</span>
                    <input type="number" name="initialValue" value={inputs.initialValue} onChange={handleInputChange} className={`w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white text-sm font-mono focus:border-${themeColor}-500 outline-none transition-all shadow-inner`} />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest flex justify-between">
                    Aporte Mensal <span>(R$)</span>
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isMillion ? 'text-emerald-500' : 'text-indigo-500'} font-bold text-xs`}>R$</span>
                    <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className={`w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white text-sm font-mono focus:border-${themeColor}-500 outline-none transition-all shadow-inner disabled:opacity-30`} disabled={isMillion && inputs.mode === 'CONTRIBUTION_FOR_MILLION'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest">Taxa (%)</label>
                    <input type="number" name="annualInterestRate" value={inputs.annualInterestRate} onChange={handleInputChange} className={`w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-4 text-white text-sm font-mono focus:border-${themeColor}-500 outline-none transition-all`} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest">Tipo</label>
                    <select name="rateType" value={inputs.rateType} onChange={handleInputChange} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-4 text-white text-[9px] font-black focus:border-emerald-500 outline-none cursor-pointer appearance-none">
                      <option value="ANNUAL">Anual</option>
                      <option value="MONTHLY">Mensal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest">Período</label>
                    <input type="number" name={isMillion && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'years' : 'periodValue'} value={isMillion && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? inputs.years : inputs.periodValue} onChange={handleInputChange} className={`w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-4 text-white text-sm font-mono focus:border-${themeColor}-500 outline-none transition-all disabled:opacity-30`} disabled={isMillion && inputs.mode === 'TIME_TO_MILLION'} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[8px] font-black uppercase mb-2 tracking-widest">Escala</label>
                    <select name="periodType" value={inputs.periodType} onChange={handleInputChange} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-4 text-white text-[9px] font-black focus:border-emerald-500 outline-none cursor-pointer appearance-none disabled:opacity-30" disabled={isMillion}>
                      <option value="YEARS">Anos</option>
                      <option value="MONTHS">Meses</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={getAiInsight}
                disabled={isAiLoading}
                className={`w-full mt-10 py-5 bg-gradient-to-r ${isMillion ? 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20' : 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/20'} text-slate-950 text-[10px] font-black rounded-2xl transition-all uppercase tracking-[0.2em] shadow-2xl active:scale-[0.97]`}
              >
                {isAiLoading ? 'Processando...' : 'Obter Visão Estratégica ✨'}
              </button>
            </div>

            {aiInsight && (
              <div className={`p-6 ${isMillion ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'} border rounded-[2rem] text-[11px] italic leading-relaxed animate-in fade-in zoom-in duration-500 shadow-xl`}>
                <span className="text-white font-black uppercase not-italic block mb-2 text-[9px]">Insight Profissional:</span>
                "{aiInsight}"
              </div>
            )}
          </aside>

          <section className="lg:col-span-9 space-y-8 animate-in fade-in duration-700">
            {result && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DashboardCard 
                    title={isMillion ? 'Objetivo Principal' : 'Projeção Total'} 
                    value={formatCurrency(result.finalTotal)} 
                    variant={isMillion ? 'emerald' : 'indigo'}
                    primary 
                  />
                  <DashboardCard 
                    title="Patrimônio Próprio" 
                    value={formatCurrency(result.totalInvested)} 
                    variant={isMillion ? 'emerald' : 'indigo'}
                  />
                  <DashboardCard 
                    title="Alavancagem de Juros" 
                    value={formatCurrency(result.totalInterest)} 
                    variant="cyan"
                  />
                </div>

                <div className="bg-slate-900/40 border border-white/10 p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group backdrop-blur-3xl">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${isMillion ? 'via-emerald-500/50' : 'via-indigo-500/50'} to-transparent opacity-50`}></div>
                  
                  <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.6em] mb-6">
                    {isMillion ? 'Horizonte para a Meta:' : 'Volume Acumulado Final:'}
                  </h2>
                  <div className="text-5xl md:text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_15px_45px_rgba(0,0,0,0.6)]">
                      {isMillion 
                        ? <>{Math.floor(result.targetReachedInMonths / 12)} <span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>Anos</span> e {result.targetReachedInMonths % 12} <span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>Meses</span></>
                        : <>{formatCurrency(result.finalTotal)}</>
                      }
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                   <div className="xl:col-span-4 bg-slate-900/20 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center">
                      <h3 className="text-slate-500 font-black text-[9px] mb-8 uppercase tracking-widest text-center">Estrutura do Patrimônio</h3>
                      <div className="w-full max-w-[280px]">
                        <CompositionChart invested={result.totalInvested} interest={result.totalInterest} mainColor={themeHex} />
                      </div>
                   </div>
                   
                   <div className="xl:col-span-8 bg-slate-900/20 border border-white/5 p-8 rounded-[2.5rem] flex flex-col">
                      <h3 className="text-slate-500 font-black text-[9px] mb-8 uppercase tracking-widest text-center">Crescimento Exponencial</h3>
                      <InvestmentChart data={result.history} mainColor={themeHex} />
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                   <div className="xl:col-span-3 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-10 rounded-[2.5rem] flex flex-col justify-center items-center text-center group">
                      <div className={`text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 group-hover:text-${themeColor}-400 transition-colors`}>Fator de Força</div>
                      <div className={`text-7xl font-black ${isMillion ? 'text-emerald-500' : 'text-indigo-500'} mb-4 drop-shadow-2xl transition-transform group-hover:scale-110`}>{result.powerFactor.toFixed(0)}%</div>
                      <p className="text-[10px] text-slate-400 max-w-[160px] leading-relaxed uppercase tracking-tighter">
                        O mercado alavancou seu esforço em <span className={`${isMillion ? 'text-emerald-400' : 'text-indigo-400'} font-bold`}>{(result.powerFactor/100 + 1).toFixed(1)}x</span>.
                      </p>
                   </div>

                   <div className="xl:col-span-9 bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-inner">
                      <div className={`px-8 py-5 border-b border-white/5 bg-white/[0.04] flex justify-between items-center`}>
                        <h3 className="text-white font-black text-[9px] uppercase tracking-widest">Planilha Técnica de Ciclos</h3>
                        <div className="flex gap-2">
                          <div className={`w-2 h-2 rounded-full ${isMillion ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        </div>
                      </div>
                      <div className="overflow-x-auto max-h-[350px]">
                        <table className="w-full text-[11px] text-left whitespace-nowrap">
                          <thead className="bg-slate-950/90 text-slate-500 uppercase font-black sticky top-0 z-10">
                            <tr>
                              <th className="px-8 py-4">Período</th>
                              <th className="px-8 py-4">Patrimônio</th>
                              <th className="px-8 py-4">Acumulado Próprio</th>
                              <th className="px-8 py-4 text-right">Lucro Acumulado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {/* Normalized the data to avoid "Spread types may only be created from object types" and property access errors on unions */}
                            {(inputs.periodType === 'MONTHS' && activeTool === 'COMPOUND' 
                              ? result.history.slice(1, 101).map(m => ({ label: `${m.month}º Mês`, total: m.total, invested: m.invested, interest: m.interest })) 
                              : result.yearlyBreakdown.map(y => ({ label: `${y.year}º Ano`, total: y.totalAccumulated, invested: y.totalInvested, interest: y.totalInterest }))
                            ).map((item, idx) => (
                              <tr key={idx} className={`hover:${isMillion ? 'bg-emerald-500' : 'bg-indigo-500'}/[0.04] transition-colors group`}>
                                <td className="px-8 py-4 font-black text-white group-hover:text-emerald-400">{item.label}</td>
                                <td className="px-8 py-4 font-black text-slate-300 font-mono">{formatCurrency(item.total)}</td>
                                <td className={`px-8 py-4 ${isMillion ? 'text-emerald-600' : 'text-indigo-600'} font-mono opacity-60`}>{formatCurrency(item.invested)}</td>
                                <td className={`px-8 py-4 text-right font-bold ${isMillion ? 'text-emerald-400' : 'text-indigo-400'} font-mono`}>+{formatCurrency(item.interest)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-24 space-y-24 border-t border-white/5 pt-20">
          <div className="max-w-7xl mx-auto">
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-12 text-center">
                Metodologia de <span className={isMillion ? 'text-emerald-400' : 'text-indigo-400'}>Trabalho</span>
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { step: "01", title: "Fundação", desc: "Defina sua base de capital." },
                  { step: "02", title: "Consistência", desc: "Aportes são o combustível." },
                  { step: "03", title: "Inteligência", desc: "Busque a melhor taxa." },
                  { step: "04", title: "Paciência", desc: "Deixe o tempo atuar." },
                  { step: "05", title: "Liberdade", desc: "Colha os frutos do plano." }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-slate-400/20 transition-all text-center">
                    <span className={`text-5xl font-black opacity-5 absolute -top-2 -left-2 ${isMillion ? 'group-hover:text-emerald-500' : 'group-hover:text-indigo-500'} transition-colors`}>{item.step}</span>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 relative z-10">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed relative z-10">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-white/10 p-12 md:p-20 rounded-[4rem] max-w-[1600px] mx-auto overflow-hidden relative shadow-2xl">
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500 opacity-20`}></div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      A Lógica do <br /><span className={`${isMillion ? 'text-emerald-400' : 'text-indigo-400'} italic`}>Enriquecimento Geométrico</span>
                   </h3>
                   <p className="text-slate-400 text-sm leading-relaxed">
                      {isMillion 
                        ? 'O "Primeiro Milhão" não é linear. É uma jornada onde a paciência nos primeiros anos é testada pela baixa visibilidade, mas que explode exponencialmente no terço final do prazo, quando os juros rendem mais que seu salário.'
                        : 'A capitalização composta é o princípio fundamental das finanças modernas. Ao não retirar o lucro e permitir que ele se torne base para o novo lucro, você cria uma engrenagem de geração de valor perpétua.'
                      }
                   </p>
                   
                   <div className="grid grid-cols-1 gap-4">
                      <h4 className="text-white font-black text-[9px] uppercase tracking-[0.2em] mb-4 text-slate-500">Benchmark de Performance</h4>
                      {[
                        { period: "Curto Prazo", simple: "R$ 11.000", compound: "R$ 16.501", color: "cyan" },
                        { period: "Médio Prazo", simple: "R$ 17.000", compound: "R$ 54.462", color: isMillion ? "emerald" : "indigo" },
                        { period: "Longo Prazo", simple: "R$ 23.000", compound: "R$ 179.748", color: "white" }
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-950/80 border border-white/5 rounded-3xl group transition-all">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{row.period}</span>
                           <div className="flex gap-10 font-mono text-xs">
                              <span className="text-slate-600 text-[9px] font-bold">Simples: {row.simple}</span>
                              <span className={`text-${row.color === 'emerald' ? 'emerald-500' : row.color === 'indigo' ? 'indigo-500' : 'white'} font-bold`}>Composto: {row.compound}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative">
                   <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-8 text-center">Fundamentação Matemática</h4>
                   <div className={`p-8 rounded-3xl border ${isMillion ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-indigo-500/10 border-indigo-500/20'} mb-10 shadow-inner`}>
                      <p className={`${isMillion ? 'text-emerald-400' : 'text-indigo-400'} font-mono text-3xl tracking-[0.2em] text-center drop-shadow-lg`}>M = C (1 + i)ᵗ</p>
                   </div>
                   <div className="grid grid-cols-2 gap-8 text-[10px] text-slate-400 uppercase font-black tracking-widest px-4">
                      <div className="flex flex-col gap-2"><span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>M:</span> Montante</div>
                      <div className="flex flex-col gap-2"><span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>C:</span> Capital</div>
                      <div className="flex flex-col gap-2"><span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>i:</span> Rentabilidade</div>
                      <div className="flex flex-col gap-2"><span className={isMillion ? 'text-emerald-500' : 'text-indigo-500'}>t:</span> Tempo</div>
                   </div>
                   <div className="mt-12 pt-12 border-t border-white/5 text-center">
                     <p className="italic text-slate-500 text-[10px] leading-relaxed max-w-[280px] mx-auto mb-4">
                       "Juros compostos são a maior força do universo."
                     </p>
                     <span className={`${isMillion ? 'text-emerald-500' : 'text-indigo-500'} not-italic font-black text-[10px] tracking-widest uppercase">— Albert Einstein</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

      </main>

      <footer className="relative z-20 py-16 border-t border-white/5 mt-20 bg-slate-950/80 backdrop-blur-3xl">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
               <div className={`w-10 h-10 ${isMillion ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-xl flex items-center justify-center text-slate-950 font-black text-xs italic transition-colors`}>MS</div>
               <div>
                  <p className="text-white text-[10px] font-black uppercase tracking-[0.5em]">Millennium Pro</p>
                  <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.3em]">Investidor Sardinha • 2024</p>
               </div>
            </div>
            <p className="text-slate-600 text-[9px] uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Ferramenta educacional de apoio estratégico. As projeções são estimativas baseadas em cálculos matemáticos puros e não constituem garantia de ganhos.
            </p>
          </div>
      </footer>
    </div>
  );
};

export default App;

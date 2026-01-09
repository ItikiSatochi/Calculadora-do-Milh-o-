import React, { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FinancialInputs, CalculationResult, ToolType } from './types';
import { calculateFinancials, formatCurrency } from './utils';
import DashboardCard from './components/DashboardCard';
import InvestmentChart from './components/InvestmentChart';
import CompositionChart from './components/CompositionChart';
import YearlyTable from './components/YearlyTable';

// Componentes Auxiliares para a Seção Educativa
const GuideStep = ({ number, title, description, accentColor = 'text-slate-700' }: { number: string; title: string; description: string; accentColor?: string; }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col group hover:border-slate-700 transition-all">
    <span className={`text-4xl md:text-5xl font-black ${accentColor} group-hover:scale-110 transition-transform duration-500`}>{number}</span>
    <h3 className="font-extrabold text-white mt-4 mb-2 uppercase text-[10px] md:text-xs tracking-wider">{title}</h3>
    <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const EvolutionExample = ({ period, simple, compound, themeColor }: { period: string; simple: string; compound: string; themeColor: string }) => (
  <div className="bg-slate-800/40 rounded-lg p-3 md:p-4 flex justify-between items-center text-xs md:text-sm border border-transparent hover:border-slate-700 transition-all">
    <span className="font-bold text-slate-300 uppercase tracking-tighter">{period}</span>
    <div className="text-right">
      <span className="text-[9px] md:text-[10px] text-slate-500 block uppercase font-bold">Simples: {simple}</span>
      <span className={`font-black block tracking-tight ${themeColor}`}>Compostos: {compound}</span>
    </div>
  </div>
);

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm flex flex-col items-center text-center group hover:bg-slate-900/80 transition-all duration-500">
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
      {icon}
    </div>
    <h3 className="font-extrabold text-white uppercase tracking-wider mb-3 text-xs md:text-sm">{title}</h3>
    <p className="text-[10px] md:text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
  </div>
);

const WelcomeCard = ({ icon, title, description, themeColor }: { icon: React.ReactNode; title: string; description: string; themeColor: string }) => (
  <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center text-center group hover:border-slate-700 transition-all">
    <div className={`mb-4 ${themeColor} opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
    <h4 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">{title}</h4>
    <p className="text-[10px] text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const inputBaseStyle = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-3 text-white font-bold text-sm md:text-base focus:ring-2 outline-none transition duration-300 h-[48px] md:h-[54px]";

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('COMPOUND');
  const [inputs, setInputs] = useState<FinancialInputs>({
    initialValue: '1000',
    monthlyContribution: '500',
    annualInterestRate: '8',
    periodValue: '30',
    periodType: 'YEARS',
    rateType: 'ANNUAL',
    years: '30',
    mode: 'TIME_TO_MILLION'
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  // UI Theme based on active tool
  const theme = useMemo(() => {
    return activeTool === 'COMPOUND' 
      ? { color: '#10b981', ring: 'focus:ring-emerald-500', border: 'focus:border-emerald-500', bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-500', text: 'text-emerald-500', dashboard: 'emerald' as const }
      : { color: '#6366f1', ring: 'focus:ring-indigo-500', border: 'focus:border-indigo-500', bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-500', text: 'text-indigo-500', dashboard: 'indigo' as const };
  }, [activeTool]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    setResult(null);
    setAiAnalysis('');
  }

  const handleCalculate = useCallback(() => {
    setIsLoading(true);
    setResult(null);
    setAiAnalysis('');
    setTimeout(() => {
      const calculationData = calculateFinancials(inputs, activeTool);
      setResult(calculationData);
      setIsLoading(false);
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  }, [inputs, activeTool]);
  
  const handleAiAnalysis = async () => {
    if (!result) return;
    setIsAiLoading(true);
    setAiAnalysis('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Aja como um consultor financeiro especialista chamado Fluxo Financeiro IA. Analise a seguinte projeção de investimentos e forneça dicas simples.
        
        Dados da Simulação:
        - Ferramenta Usada: ${activeTool === 'COMPOUND' ? 'Juros Compostos' : 'Caminho do Milhão'}
        - Valor Final: ${formatCurrency(result.finalTotal)}
        - Total Investido: ${formatCurrency(result.totalInvested)}
        - Total em Juros: ${formatCurrency(result.totalInterest)}

        Sua análise deve ser curta, amigável e fácil de entender por alguém que não entende de finanças, dividida em:
        1. **Como está seu plano**
        2. **O que pode melhorar**
        3. **Dica de ouro**`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        setAiAnalysis(response.text);
    } catch (error) {
      console.error("AI analysis failed:", error);
      setAiAnalysis("Ops! Não conseguimos analisar seus números agora. Tente de novo em instantes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const powerFactorText = result ? (result.powerFactor > 0 ? `${result.powerFactor.toFixed(1)}%` : '---') : '0%';
  
  const resultTitle = activeTool === 'COMPOUND' 
    ? "Dinheiro Total no Final" 
    : (inputs.mode === 'TIME_TO_MILLION' ? "Quanto tempo vai levar" : "Quanto guardar por mês");
    
  const resultValue = activeTool === 'COMPOUND' 
    ? formatCurrency(result?.finalTotal || 0) 
    : (inputs.mode === 'TIME_TO_MILLION' ? `${Math.floor((result?.targetReachedInMonths || 0) / 12)} anos e ${(result?.targetReachedInMonths || 0) % 12} meses` : formatCurrency(result?.requiredMonthlyAporte || 0));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-emerald-500/30">
       <div className="fixed inset-0 bg-[url('https://tailwindcss.com/_next/static/media/hero-dark@90.dba36cdf.jpg')] bg-cover bg-center opacity-5 pointer-events-none"></div>
       <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950 backdrop-blur-sm"></div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24">
        {/* HEADER */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase">Fluxo <span className={theme.text}>Financeiro</span></h1>
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">Planeje seu futuro com inteligência e veja seu patrimônio crescer mês a mês.</p>
        </header>

        {/* SELECTOR */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1.5 max-w-md mx-auto mb-8 md:mb-10 backdrop-blur-sm shadow-2xl animate-fade-in">
            <button onClick={() => handleToolChange('COMPOUND')} className={`flex-1 rounded-xl py-2.5 md:py-3 text-[10px] md:text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-tighter ${activeTool === 'COMPOUND' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Juros Compostos
            </button>
            <button onClick={() => handleToolChange('MILLION')} className={`flex-1 rounded-xl py-2.5 md:py-3 text-[10px] md:text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-tighter ${activeTool === 'MILLION' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 17V7m0 10c-1.11 0-2.08-.407-2.67-1M12 17V7" /></svg>
              Caminho do Milhão
            </button>
        </div>

        {/* INPUT SECTION */}
        <section className={`bg-slate-900/50 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 backdrop-blur-lg shadow-2xl mb-8 md:mb-12 transition-all duration-700 ${activeTool === 'MILLION' ? 'border-indigo-500/20 ring-1 ring-indigo-500/10' : 'border-emerald-500/20 ring-1 ring-emerald-500/10'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Campo 1 */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quanto você tem hoje?</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs md:text-sm">R$</span>
                <input type="number" name="initialValue" value={inputs.initialValue} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pl-10`} />
              </div>
            </div>
            {/* Campo 2 */}
            <div className={`flex flex-col gap-2.5 transition-opacity ${activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quanto vai guardar/mês?</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs md:text-sm">R$</span>
                <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pl-10`} disabled={activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION'} />
              </div>
            </div>
            {/* Campo 3 */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ganho esperado? {activeTool === 'COMPOUND' ? '' : '(ANO)'}</label>
               <div className="flex gap-2">
                 <div className="relative flex-1">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs md:text-sm">%</span>
                    <input type="number" name="annualInterestRate" value={inputs.annualInterestRate} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pr-10`} />
                 </div>
                {activeTool === 'COMPOUND' && (
                  <select name="rateType" value={inputs.rateType} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} w-28 md:w-36 text-[10px] md:text-xs uppercase tracking-tighter leading-none`}>
                    <option value="ANNUAL">Ao Ano</option>
                    <option value="MONTHLY">Ao Mês</option>
                  </select>
                )}
              </div>
            </div>
            {/* Campo 4 */}
            <div className={`flex flex-col gap-2.5 transition-opacity ${activeTool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION' ? 'opacity-30' : 'opacity-100'}`}>
               <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Por quanto tempo?</label>
               <div className="flex gap-2">
                 <input type="number" name={activeTool === 'COMPOUND' ? 'periodValue' : 'years'} value={activeTool === 'COMPOUND' ? inputs.periodValue : inputs.years} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} flex-1`} disabled={activeTool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION'}/>
                 {activeTool === 'COMPOUND' ? (
                   <select name="periodType" value={inputs.periodType} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} w-28 md:w-36 text-[10px] md:text-xs uppercase tracking-tighter leading-none`}>
                     <option value="YEARS">Anos</option>
                     <option value="MONTHS">Meses</option>
                   </select>
                 ) : (
                   <span className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 text-white font-black text-[10px] md:text-xs flex items-center justify-center uppercase w-28 md:w-36 h-[48px] md:h-[54px]">Anos</span>
                 )}
               </div>
            </div>
          </div>

          {activeTool === 'MILLION' && (
              <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 animate-fade-in">
                <label className="flex items-center gap-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group">
                    <input type="radio" name="mode" value="TIME_TO_MILLION" checked={inputs.mode === 'TIME_TO_MILLION'} onChange={handleInputChange} className="accent-indigo-500 w-5 h-5"/>
                    <span>Quanto tempo leva?</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group">
                    <input type="radio" name="mode" value="CONTRIBUTION_FOR_MILLION" checked={inputs.mode === 'CONTRIBUTION_FOR_MILLION'} onChange={handleInputChange} className="accent-indigo-500 w-5 h-5"/>
                    <span>Quanto devo guardar?</span>
                </label>
              </div>
          )}

          <div className="mt-10">
            <button onClick={handleCalculate} disabled={isLoading} className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-black py-4 md:py-5 rounded-2xl text-base md:text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3 group uppercase tracking-[0.2em]`}>
              {isLoading ? 'Calculando...' : 'Ver meu Crescimento'}
              {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </button>
          </div>
        </section>

        {/* RESULTS SECTION / PLACEHOLDER */}
        <div id="results-section" className="min-h-[100px] mb-12 md:mb-24 scroll-mt-20">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-64 md:h-96 gap-6">
                <div className={`animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-t-4 border-r-4 border-slate-800`} style={{ borderTopColor: theme.color }}></div>
                <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-[10px]">Processando dados...</p>
            </div>
          )}

          {!isLoading && !result && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in py-10">
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Poder do Tempo"
                description="Entenda como juros sobre juros agem no seu dinheiro."
               />
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Clareza de Metas"
                description="Planeje sua liberdade financeira com dados reais e precisos."
               />
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Dicas de IA"
                description="Receba orientações exclusivas baseadas na sua simulação."
               />
            </div>
          )}

          {!isLoading && result && (
            <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 backdrop-blur-lg animate-fade-in space-y-12 md:space-y-16 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  <DashboardCard primary variant={theme.dashboard} title={resultTitle} value={resultValue} />
                  <DashboardCard variant={activeTool === 'COMPOUND' ? 'indigo' : 'cyan'} title="Total Investido" value={formatCurrency(result.totalInvested)} />
                  <DashboardCard variant={activeTool === 'COMPOUND' ? 'cyan' : 'emerald'} title="Ganhos de Juros" value={formatCurrency(result.totalInterest)} />
                  <DashboardCard title="Multiplicador" value={powerFactorText} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12 items-center border-t border-slate-800 pt-12 md:pt-16">
                  <div className="lg:col-span-2 overflow-x-hidden">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 text-center mb-6 uppercase tracking-[0.4em]">Evolução Patrimonial</h3>
                    <InvestmentChart data={result.history} mainColor={theme.color} />
                  </div>
                  <div className="lg:col-span-1">
                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 text-center mb-6 uppercase tracking-[0.4em]">Origem do Patrimônio</h3>
                    <CompositionChart invested={result.totalInvested} interest={result.totalInterest} mainColor={theme.color} />
                  </div>
              </div>
              
              <div className="border-t border-slate-800 pt-12 md:pt-16 text-center">
                 <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 bg-slate-800/50 ${theme.text}`}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.color }}></div>
                    Consultor Inteligente
                 </div>
                 <h3 className="text-xl md:text-3xl font-black text-white tracking-tight mb-2 uppercase">Dicas para seu Futuro</h3>
                 <p className="text-xs md:text-sm text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">Nossa IA analisou seus números para recomendar os melhores passos para você.</p>
                 <button onClick={handleAiAnalysis} disabled={isAiLoading} className="bg-white text-slate-950 hover:bg-slate-200 font-black py-3.5 md:py-4 px-8 md:px-10 rounded-2xl text-[11px] md:text-sm transition-all active:scale-[0.95] disabled:opacity-50 flex items-center justify-center gap-3 mx-auto shadow-xl uppercase tracking-wider">
                    {isAiLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>Analisando...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" /></svg>Receber Consultoria</>)}
                 </button>

                 {aiAnalysis && (
                    <div className="mt-10 text-left max-w-3xl mx-auto bg-slate-950/60 border border-slate-800 p-6 md:p-10 rounded-[2rem] shadow-2xl backdrop-blur-xl animate-fade-in text-[10px] md:text-sm">
                        {aiAnalysis.split('\n').map((line, index) => {
                            const parts = line.split('**');
                            return (<p key={index} className="mb-4 last:mb-0 leading-relaxed text-slate-400">{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-black uppercase tracking-tighter text-[9px] md:text-xs" style={{ color: theme.color }}>{part}</strong> : part)}</p>);
                        })}
                    </div>
                 )}
              </div>

              <div className="border-t border-slate-800 pt-12 md:pt-16">
                 <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center mb-8">Extrato Detalhado</h3>
                 <YearlyTable data={result.yearlyBreakdown} themeColor={theme.color} />
              </div>
            </section>
          )}
        </div>

        {/* --- SEÇÃO EDUCATIVA --- */}
        <section className="text-center mb-12 mt-16 md:mt-32">
          <h2 className="text-sm md:text-2xl font-black text-slate-400 tracking-[0.3em] uppercase">
            {activeTool === 'COMPOUND' ? 'Como funciona seu ' : 'Seu Plano: '}
            <span className="text-white">{activeTool === 'COMPOUND' ? 'Crescimento' : 'Rumo ao Milhão'}</span>
          </h2>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-16 md:mb-28">
          <GuideStep number="01" title="Valor Inicial" description="O ponto de partida da sua jornada." />
          <GuideStep number="02" title="Aportes" description="Sua disciplina mensal em investir." />
          <GuideStep number="03" title="Taxa" description="A força do rendimento do mercado." />
          <GuideStep number="04" title="Tempo" description="A variável que cria as fortunas." />
          <GuideStep 
            number="05" 
            title="Destino" 
            description="Seu patrimônio acumulado final." 
            accentColor={`${activeTool === 'COMPOUND' ? 'text-emerald-900/50' : 'text-indigo-900/50'}`}
          />
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 backdrop-blur-sm grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-16 mb-16 md:mb-28 shadow-inner overflow-hidden">
          <div className="lg:col-span-3">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-tight uppercase">
              {activeTool === 'COMPOUND' ? 'A Mágica dos Juros' : 'O Plano do Milhão'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mb-8 md:mb-10 max-w-2xl leading-relaxed">
              {activeTool === 'COMPOUND' 
                ? "Nos juros compostos, cada lucro novo passa a render também. É como uma bola de neve: no começo demora a crescer, mas depois de um tempo, ela ganha um tamanho imenso sem que você precise fazer mais esforço."
                : "Atingir um milhão é um jogo de paciência e constância. Com o planejamento certo do Fluxo Financeiro, você visualiza quanto tempo precisa para sair do zero e chegar ao topo do seu primeiro patrimônio milionário."}
            </p>
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-[0.3em] mb-6 uppercase">Simulação de Crescimento Exponencial</h4>
            
            <div className="space-y-3 md:space-y-4">
              <EvolutionExample period="2 Anos" simple="R$ 8.600" compound="R$ 9.692" themeColor={theme.text} />
              <EvolutionExample period="10 Anos" simple="R$ 17.000" compound="R$ 38.657" themeColor={theme.text} />
              <EvolutionExample period="20 Anos" simple="R$ 29.000" compound="R$ 95.482" themeColor={theme.text} />
              <EvolutionExample period="35 Anos" simple="R$ 50.000" compound="R$ 776.743" themeColor={theme.text} />
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div>
              <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-[0.3em] mb-8 uppercase text-center">Processo de Evolução</h4>
              
              <div className="space-y-6 md:space-y-8 mb-10">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-sm md:text-lg shadow-lg border border-white/5 flex-shrink-0 ${theme.text}`}>1</div>
                  <div>
                    <h5 className="text-white font-black text-[10px] md:text-xs uppercase tracking-tighter mb-1">Semear (Capital)</h5>
                    <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight">Comece com o que tem hoje.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-sm md:text-lg shadow-lg border border-white/5 flex-shrink-0 ${theme.text}`}>+</div>
                  <div>
                    <h5 className="text-white font-black text-[10px] md:text-xs uppercase tracking-tighter mb-1">Regar (Ganhos)</h5>
                    <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight">Os juros fazem o trabalho duro.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-sm md:text-lg shadow-lg border border-white/5 flex-shrink-0 ${theme.text}`}>×</div>
                  <div>
                    <h5 className="text-white font-black text-[10px] md:text-xs uppercase tracking-tighter mb-1">Colher (Tempo)</h5>
                    <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight">A recompensa vem com os anos.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 md:p-6 text-center border border-white/10 shadow-inner group-hover:border-emerald-500/20 transition-all duration-500">
                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Patrimônio Almejado</p>
                <p className={`font-black text-base md:text-xl tracking-tight uppercase ${theme.text}`}>Independência</p>
              </div>
            </div>

            <div className="mt-8 md:mt-12 text-center border-t border-slate-700/50 pt-8 md:pt-10">
              <p className="italic text-slate-300 text-[10px] md:text-xs leading-relaxed">"Juros compostos são a força mais poderosa do universo."</p>
              <p className={`font-black mt-4 text-[9px] md:text-[10px] uppercase tracking-widest ${theme.text}`}>— Albert Einstein</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 md:h-8 md:w-8 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            title="Investir"
            description="Faça o dinheiro trabalhar sozinho 24h por dia."
          />
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title="Pagar-se Primeiro"
            description="Guarde sua parte antes de pagar os boletos."
          />
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Consistência"
            description="A constância vale mais que grandes valores isolados."
          />
        </section>

        <footer className="text-center py-10 md:py-12 border-t border-slate-900">
           <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2025 Fluxo Financeiro • Inteligência para seu patrimônio</p>
        </footer>
      </main>
    </div>
  );
};

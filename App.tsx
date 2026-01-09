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
    <span className={`text-5xl font-black ${accentColor} group-hover:scale-110 transition-transform duration-500`}>{number}</span>
    <h3 className="font-extrabold text-white mt-4 mb-2 uppercase text-sm tracking-wider">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const EvolutionExample = ({ period, simple, compound, themeColor }: { period: string; simple: string; compound: string; themeColor: string }) => (
  <div className="bg-slate-800/40 rounded-lg p-4 flex justify-between items-center text-sm border border-transparent hover:border-slate-700 transition-all">
    <span className="font-bold text-slate-300 uppercase tracking-tighter">{period}</span>
    <div className="text-right">
      <span className="text-[10px] text-slate-500 block uppercase font-bold">Simples: {simple}</span>
      <span className={`font-black block tracking-tight ${themeColor}`}>Compostos: {compound}</span>
    </div>
  </div>
);

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center text-center group hover:bg-slate-900/80 transition-all duration-500">
    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
      {icon}
    </div>
    <h3 className="font-extrabold text-white uppercase tracking-wider mb-3 text-sm">{title}</h3>
    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
  </div>
);

const WelcomeCard = ({ icon, title, description, themeColor }: { icon: React.ReactNode; title: string; description: string; themeColor: string }) => (
  <div className="bg-slate-900/30 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-md flex flex-col items-center text-center group hover:border-slate-700 transition-all">
    <div className={`mb-4 ${themeColor} opacity-50 group-hover:opacity-100 transition-opacity`}>{icon}</div>
    <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">{title}</h4>
    <p className="text-[10px] text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const inputBaseStyle = "w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white font-bold text-base focus:ring-2 outline-none transition duration-300";

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

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* HEADER */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-4">Fluxo <span className={theme.text}>Financeiro</span></h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">A maneira mais simples de planejar seu futuro e ver seu dinheiro crescer.</p>
        </header>

        {/* SELECTOR */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 max-w-md mx-auto mb-10 backdrop-blur-sm shadow-2xl animate-fade-in">
            <button onClick={() => handleToolChange('COMPOUND')} className={`w-1/2 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTool === 'COMPOUND' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Juros Compostos
            </button>
            <button onClick={() => handleToolChange('MILLION')} className={`w-1/2 rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTool === 'MILLION' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 17V7m0 10c-1.11 0-2.08-.407-2.67-1M12 17V7" /></svg>
              Caminho do Milhão
            </button>
        </div>

        {/* INPUT SECTION */}
        <section className={`bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-lg shadow-2xl mb-12 transition-all duration-700 ${activeTool === 'MILLION' ? 'border-indigo-500/20 ring-1 ring-indigo-500/10' : 'border-emerald-500/20 ring-1 ring-emerald-500/10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quanto você tem hoje?</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span><input type="number" name="initialValue" value={inputs.initialValue} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pl-10`} /></div>
            </div>
            <div className={`flex flex-col gap-3 transition-opacity ${activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quanto vai guardar por mês?</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span><input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pl-10`} disabled={activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION'} /></div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Qual o ganho esperado? {activeTool === 'COMPOUND' ? '' : '(POR ANO)'}</label>
               <div className="flex gap-2">
                 <div className="relative w-full"><span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">%</span><input type="number" name="annualInterestRate" value={inputs.annualInterestRate} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} pr-10`} /></div>
                {activeTool === 'COMPOUND' && (
                  <select name="rateType" value={inputs.rateType} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} w-36 text-xs uppercase tracking-tighter`}>
                    <option value="ANNUAL">Ao Ano</option>
                    <option value="MONTHLY">Ao Mês</option>
                  </select>
                )}
              </div>
            </div>
            <div className={`flex flex-col gap-3 transition-opacity ${activeTool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION' ? 'opacity-30' : 'opacity-100'}`}>
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Por quanto tempo?</label>
               <div className="flex gap-2">
                 <input type="number" name={activeTool === 'COMPOUND' ? 'periodValue' : 'years'} value={activeTool === 'COMPOUND' ? inputs.periodValue : inputs.years} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border}`} disabled={activeTool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION'}/>
                 {activeTool === 'COMPOUND' ? (
                   <select name="periodType" value={inputs.periodType} onChange={handleInputChange} className={`${inputBaseStyle} ${theme.ring} ${theme.border} w-36 text-xs uppercase tracking-tighter`}>
                     <option value="YEARS">Anos</option>
                     <option value="MONTHS">Meses</option>
                   </select>
                 ) : (
                   <span className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white font-bold text-xs flex items-center justify-center uppercase w-36">Anos</span>
                 )}
               </div>
            </div>
          </div>
          {activeTool === 'MILLION' && (
              <div className="mt-8 border-t border-slate-800 pt-8 flex justify-center gap-10 animate-fade-in">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"><input type="radio" name="mode" value="TIME_TO_MILLION" checked={inputs.mode === 'TIME_TO_MILLION'} onChange={handleInputChange} className="accent-indigo-500 w-5 h-5"/><span>Quanto tempo leva?</span></label>
                <label className="flex items-center gap-3 cursor-pointer text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors group"><input type="radio" name="mode" value="CONTRIBUTION_FOR_MILLION" checked={inputs.mode === 'CONTRIBUTION_FOR_MILLION'} onChange={handleInputChange} className="accent-indigo-500 w-5 h-5"/><span>Quanto devo guardar?</span></label>
              </div>
          )}
          <div className="mt-10">
            <button onClick={handleCalculate} disabled={isLoading} className={`w-full ${theme.bg} ${theme.hoverBg} text-white font-black py-5 rounded-2xl text-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3 group uppercase tracking-widest`}>
              {isLoading ? 'Calculando seu Futuro...' : 'Ver meu Crescimento'}
              {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </button>
          </div>
        </section>

        {/* RESULTS SECTION / PLACEHOLDER */}
        <div id="results-section" className="min-h-[100px] mb-24 scroll-mt-20">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-96 gap-6">
                <div className={`animate-spin rounded-full h-20 w-20 border-t-4 border-r-4 border-slate-800`} style={{ borderTopColor: theme.color }}></div>
                <p className="font-black text-slate-500 uppercase tracking-[0.5em] text-xs">Desenhando seu Destino...</p>
            </div>
          )}

          {!isLoading && !result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in py-10">
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Poder do Tempo"
                description="Descubra como o tempo multiplica seu esforço através dos juros compostos."
               />
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Clareza de Metas"
                description="Simule cenários reais e saiba exatamente quanto falta para sua independência."
               />
               <WelcomeCard 
                themeColor={theme.text}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Dicas de IA"
                description="Nossa inteligência artificial analisa sua projeção e sugere os melhores caminhos."
               />
            </div>
          )}

          {!isLoading && result && (
            <section className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 md:p-12 backdrop-blur-lg animate-fade-in space-y-16 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <DashboardCard primary variant={theme.dashboard} title={resultTitle} value={resultValue} />
                  <DashboardCard variant={activeTool === 'COMPOUND' ? 'indigo' : 'cyan'} title="Total que Você Colocou" value={formatCurrency(result.totalInvested)} />
                  <DashboardCard variant={activeTool === 'COMPOUND' ? 'cyan' : 'emerald'} title="Total Ganho de Juros" value={formatCurrency(result.totalInterest)} />
                  <DashboardCard title="Impacto dos Juros" value={powerFactorText} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center border-t border-slate-800 pt-16">
                  <div className="lg:col-span-2">
                    <h3 className="text-[10px] font-black text-slate-500 text-center mb-6 uppercase tracking-[0.4em]">Gráfico de Crescimento do seu Dinheiro</h3>
                    <InvestmentChart data={result.history} mainColor={theme.color} />
                  </div>
                  <div className="lg:col-span-1">
                    <h3 className="text-[10px] font-black text-slate-500 text-center mb-6 uppercase tracking-[0.4em]">De onde vem seu Dinheiro</h3>
                    <CompositionChart invested={result.totalInvested} interest={result.totalInterest} mainColor={theme.color} />
                  </div>
              </div>
              
              <div className="border-t border-slate-800 pt-16 text-center">
                 <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 bg-slate-800/50 ${theme.text}`}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.color }}></div>
                    Consultor Inteligente Fluxo Financeiro
                 </div>
                 <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Dicas para seu Futuro</h3>
                 <p className="text-sm text-slate-400 mb-8">Nossa inteligência artificial analisou seus números para te ajudar.</p>
                 <button onClick={handleAiAnalysis} disabled={isAiLoading} className="bg-white text-slate-950 hover:bg-slate-200 font-black py-4 px-10 rounded-2xl text-sm transition-all active:scale-[0.95] disabled:opacity-50 flex items-center justify-center gap-3 mx-auto shadow-xl">
                    {isAiLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>Pensando nas Dicas...</>) : (<><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" /></svg>Receber Dicas da IA</>)}
                 </button>

                 {aiAnalysis && (
                    <div className="mt-10 text-left max-w-3xl mx-auto bg-slate-950/60 border border-slate-800 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl animate-fade-in prose prose-invert prose-p:text-slate-400 prose-strong:text-white prose-strong:font-black prose-strong:uppercase prose-strong:tracking-tighter">
                        {aiAnalysis.split('\n').map((line, index) => {
                            const parts = line.split('**');
                            return (<p key={index} className="mb-4 last:mb-0 leading-relaxed">{parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-black uppercase tracking-tighter text-xs" style={{ color: theme.color }}>{part}</strong> : part)}</p>);
                        })}
                    </div>
                 )}
              </div>

              <div className="border-t border-slate-800 pt-16">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center mb-8">Tabela de Crescimento Ano a Ano</h3>
                 <YearlyTable data={result.yearlyBreakdown} themeColor={theme.color} />
              </div>
            </section>
          )}
        </div>

        {/* --- SEÇÃO EDUCATIVA DINÂMICA --- */}
        <section className="text-center mb-20 mt-32">
          <h2 className="text-xl md:text-2xl font-black text-slate-400 tracking-[0.3em] uppercase">
            {activeTool === 'COMPOUND' ? 'Como funciona seu ' : 'Seu Plano: '}
            <span className="text-white">{activeTool === 'COMPOUND' ? 'Crescimento' : 'Rumo ao Milhão'}</span>
          </h2>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-28">
          <GuideStep 
            number="01" 
            title="Valor Inicial" 
            description={activeTool === 'COMPOUND' ? "O dinheiro que você já tem para começar sua jornada hoje." : "Quanto você já tem guardado? Se estiver começando do zero, use R$ 0."} 
          />
          <GuideStep 
            number="02" 
            title="Sua Economia" 
            description={activeTool === 'COMPOUND' ? "A constância é a alma do negócio. Pequenos valores mensais fazem uma diferença enorme no futuro." : "Quanto você consegue guardar e investir todos os meses sem falta?"} 
          />
          <GuideStep 
            number="03" 
            title="Rentabilidade" 
            description={activeTool === 'COMPOUND' ? "O ganho que seu dinheiro terá. Quanto maior o juro, mais rápido seu dinheiro trabalha por você." : "Qual ganho você espera? Entre 8% e 12% por ano é um valor comum no mercado."} 
          />
          <GuideStep 
            number="04" 
            title="Paciência" 
            description={activeTool === 'COMPOUND' ? "O tempo é o segredo de quem fica rico. Quanto mais tempo você deixa o dinheiro rendendo, maior o lucro." : "Por quantos anos você quer ver seu dinheiro rendendo? O tempo é seu melhor amigo."} 
          />
          <GuideStep 
            number="05" 
            title="Seu Futuro" 
            description={activeTool === 'COMPOUND' ? "O resultado final de todo o seu esforço e paciência transformados em patrimônio." : "Veja como guardar um pouco por mês pode te levar ao seu primeiro milhão de reais."} 
            accentColor={`${activeTool === 'COMPOUND' ? 'text-emerald-900/50' : 'text-indigo-900/50'}`}
          />
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-sm grid grid-cols-1 lg:grid-cols-5 gap-16 mb-28 shadow-inner transition-all duration-700">
          <div className="lg:col-span-3">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight uppercase">
              {activeTool === 'COMPOUND' ? 'O Segredo da Riqueza' : 'A Jornada do Milhão'}
            </h2>
            <p className="text-sm text-slate-400 mb-10 max-w-2xl leading-relaxed">
              {activeTool === 'COMPOUND' 
                ? "Diferente de guardar dinheiro no colchão, nos juros compostos os seus ganhos também rendem. É como uma bola de neve que começa pequena e vai ficando gigante conforme desce a montanha. Com o tempo, o lucro passa a ser muito maior do que o valor que você guarda mensalmente."
                : "Chegar ao primeiro milhão não é impossível, é questão de planejamento. Com disciplina para guardar todo mês e paciência para o tempo agir, qualquer pessoa pode atingir essa meta. Veja no gráfico como a curva de crescimento fica cada vez mais íngreme."}
            </p>
            <h4 className="text-[10px] font-black text-slate-500 tracking-[0.3em] mb-6 uppercase">
              EXEMPLO DE CRESCIMENTO (GUARDANDO R$ 5.000 + 1% AO MÊS)
            </h4>
            
            <div className="space-y-4">
              <EvolutionExample period="2 Anos" simple="R$ 8.600" compound="R$ 9.692" themeColor={theme.text} />
              <EvolutionExample period="10 Anos" simple="R$ 17.000" compound="R$ 38.657" themeColor={theme.text} />
              <EvolutionExample period="20 Anos" simple="R$ 29.000" compound="R$ 95.482" themeColor={theme.text} />
              <EvolutionExample period="35 Anos" simple="R$ 50.000" compound="R$ 776.743" themeColor={theme.text} />
            </div>
          </div>

          {/* SEÇÃO SIMPLIFICADA "O FLUXO DA EVOLUÇÃO" */}
          <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div>
              <h4 className="text-[10px] font-black text-slate-500 tracking-[0.3em] mb-8 uppercase text-center">Os 3 Passos da Riqueza</h4>
              
              <div className="space-y-8 mb-10">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-lg shadow-lg border border-white/5 ${theme.text}`}>1</div>
                  <div>
                    <h5 className="text-white font-black text-xs uppercase tracking-tighter mb-1">Plantar (Capital)</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">É o valor inicial. Sem a semente, nada cresce.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-lg shadow-lg border border-white/5 ${theme.text}`}>+</div>
                  <div>
                    <h5 className="text-white font-black text-xs uppercase tracking-tighter mb-1">Cuidar (Rendimentos)</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Os juros fazem sua planta crescer mais rápido a cada dia.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-lg shadow-lg border border-white/5 ${theme.text}`}>×</div>
                  <div>
                    <h5 className="text-white font-black text-xs uppercase tracking-tighter mb-1">Esperar (Tempo)</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Tenha paciência. É o tempo que cria a fortuna de verdade.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-6 text-center border border-white/10 shadow-inner group-hover:border-emerald-500/20 transition-all duration-500">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">O Destino</p>
                <p className={`font-black text-xl tracking-tight uppercase ${theme.text}`}>Sua Independência</p>
              </div>
            </div>

            <div className="mt-12 text-center border-t border-slate-700/50 pt-10">
              <p className="italic text-slate-300 text-xs leading-relaxed">"Os juros compostos são a oitava maravilha do mundo. Quem entende, ganha; quem não entende, paga."</p>
              <p className={`font-black mt-4 text-[10px] uppercase tracking-widest ${theme.text}`}>— Albert Einstein</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            title="Investimentos"
            description="Ao investir com sabedoria, o dinheiro trabalha para você 24 horas por dia, rendendo mesmo enquanto você dorme."
          />
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title="Dicas de Gasto"
            description="Evite parcelas que cobram juros altos. O que parece barato hoje pode tirar sua liberdade financeira no futuro."
          />
          <InfoCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Cuidado com Dívidas"
            description="Se você não pagar o cartão em dia, os juros trabalham contra você. Tente sempre quitar as dívidas primeiro."
          />
        </section>

        <footer className="text-center py-12 border-t border-slate-900">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">© 2025 Fluxo Financeiro Inteligência • Todos os direitos reservados</p>
        </footer>
      </main>
    </div>
  );
};

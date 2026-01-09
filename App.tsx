
import React, { useState, useEffect, useCallback } from 'react';
import { ToolType, CalculationMode, FinancialInputs, CalculationResult, RateType, PeriodType } from './types';
import { calculateFinancials, formatCurrency } from './utils';
import DashboardCard from './components/DashboardCard';
import InvestmentChart from './components/InvestmentChart';
import CompositionChart from './components/CompositionChart';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
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

  const handleCalculate = useCallback(() => {
    const res = calculateFinancials(inputs, activeTool);
    setResult(res);
  }, [inputs, activeTool]);

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
      const apiKey = process?.env?.API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analise estes dados e dê um conselho financeiro curto e motivacional: Capital inicial R$ ${inputs.initialValue}, aporte R$ ${result.requiredMonthlyAporte}, taxa ${inputs.annualInterestRate}%. Resultado: ${formatCurrency(result.finalTotal)}.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("O tempo é o segredo dos milionários. Mantenha a constância.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]"></div>
      </div>

      <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl py-6 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Millennium <span className="text-emerald-400">Pro</span></h1>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">Investidor Sardinha • Inteligência Financeira</p>
            </div>
          </div>

          <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
             <button 
               onClick={() => setActiveTool('MILLION')}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTool === 'MILLION' ? 'bg-emerald-500 text-slate-950 shadow-xl' : 'text-slate-400 hover:text-white'}`}
             >
               PRIMEIRO MILHÃO
             </button>
             <button 
               onClick={() => setActiveTool('COMPOUND')}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTool === 'COMPOUND' ? 'bg-emerald-500 text-slate-950 shadow-xl' : 'text-slate-400 hover:text-white'}`}
             >
               JUROS COMPOSTOS
             </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-10">
        
        {/* Hero Dinâmico */}
        <div className="mb-12 text-center md:text-left max-w-4xl animate-in fade-in slide-in-from-left duration-700">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight uppercase">
            {activeTool === 'MILLION' ? 'Rumo ao seu ' : 'A mágica dos '}
            <span className="text-emerald-400 italic">{activeTool === 'MILLION' ? 'Primeiro Milhão' : 'Juros Compostos'}</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            {activeTool === 'MILLION' 
              ? 'Descubra quanto tempo falta para você se tornar um milionário ou quanto precisa investir hoje para chegar lá no prazo que deseja.'
              : 'Veja o seu dinheiro trabalhando por você. Entenda como o reinvestimento dos lucros cria uma bola de neve imparável no seu patrimônio.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* Painel de Inputs */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
              
              {activeTool === 'MILLION' && (
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 mb-8">
                  <button 
                    onClick={() => setInputs(p => ({...p, mode: 'TIME_TO_MILLION'}))}
                    className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${inputs.mode === 'TIME_TO_MILLION' ? 'bg-white/10 text-white' : 'text-slate-600'}`}
                  >
                    CALCULAR PRAZO
                  </button>
                  <button 
                    onClick={() => setInputs(p => ({...p, mode: 'CONTRIBUTION_FOR_MILLION'}))}
                    className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'bg-white/10 text-white' : 'text-slate-600'}`}
                  >
                    CALCULAR APORTE
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Valor Inicial (R$)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">R$</span>
                    <input 
                      type="number" 
                      name="initialValue"
                      value={inputs.initialValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Aporte Mensal (R$)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">R$</span>
                    <input 
                      type="number" 
                      name="monthlyContribution"
                      value={inputs.monthlyContribution}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                      disabled={activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Taxa de Juros</label>
                    <input 
                      type="number" 
                      name="annualInterestRate"
                      value={inputs.annualInterestRate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-4 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Periodicidade</label>
                    <select 
                      name="rateType"
                      value={inputs.rateType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-4 text-white text-[10px] font-bold focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="ANNUAL">Anual</option>
                      <option value="MONTHLY">Mensal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Período</label>
                    <input 
                      type="number" 
                      name={activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? 'years' : 'periodValue'}
                      value={activeTool === 'MILLION' && inputs.mode === 'CONTRIBUTION_FOR_MILLION' ? inputs.years : inputs.periodValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-4 text-white font-mono focus:border-emerald-500 outline-none transition-all"
                      disabled={activeTool === 'MILLION' && inputs.mode === 'TIME_TO_MILLION'}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-500 text-[9px] font-bold uppercase mb-2 tracking-widest">Tempo</label>
                    <select 
                      name="periodType"
                      value={inputs.periodType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-4 text-white text-[10px] font-bold focus:border-emerald-500 outline-none cursor-pointer"
                      disabled={activeTool === 'MILLION'}
                    >
                      <option value="YEARS">Anos</option>
                      <option value="MONTHS">Meses</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={getAiInsight}
                disabled={isAiLoading}
                className="w-full mt-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                {isAiLoading ? 'Sincronizando...' : 'Consultar Insight ✨'}
              </button>
            </div>
          </aside>

          {/* Painel de Resultados */}
          <section className="lg:col-span-8 space-y-8 animate-in fade-in zoom-in duration-500">
            {result && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <DashboardCard title="Valor Total Final" value={formatCurrency(result.finalTotal)} primary />
                  <DashboardCard title="Valor Total Investido" value={formatCurrency(result.totalInvested)} />
                  <DashboardCard title="Total em Juros" value={formatCurrency(result.totalInterest)} />
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-indigo-500/5 border border-white/5 p-8 md:p-12 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden group">
                  <h2 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                    {activeTool === 'MILLION' ? 'Meta atingida em:' : 'Projeção para o período:'}
                  </h2>
                  <div className="text-4xl md:text-7xl font-black text-white italic tracking-tighter drop-shadow-2xl">
                      {activeTool === 'MILLION' 
                        ? <>{Math.floor(result.targetReachedInMonths / 12)} <span className="text-emerald-500">Anos</span> e {result.targetReachedInMonths % 12} <span className="text-emerald-500">Meses</span></>
                        : <>{formatCurrency(result.finalTotal)}</>
                      }
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="text-white font-bold text-[10px] mb-8 uppercase tracking-widest text-center">Origem do Capital</h3>
                      <CompositionChart invested={result.totalInvested} interest={result.totalInterest} />
                   </div>
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Multiplicador de Patrimônio</div>
                      <div className="text-7xl font-black text-emerald-500 mb-2 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">{result.powerFactor.toFixed(0)}%</div>
                      <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-tighter">
                        Seus juros renderam <span className="text-emerald-400 font-bold">{(result.powerFactor/100 + 1).toFixed(1)}x</span> o valor que você tirou do bolso.
                      </p>
                   </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-6 md:p-10 rounded-[2.5rem]">
                  <h3 className="text-white font-bold text-[10px] mb-8 uppercase tracking-widest text-center">Evolução no Tempo</h3>
                  <InvestmentChart data={result.history} />
                </div>

                {aiInsight && (
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-center italic text-emerald-400 text-sm animate-pulse">
                    "{aiInsight}"
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* GUIA DE UTILIZAÇÃO PADRONIZADO */}
        <section className="mt-12 space-y-16 border-t border-white/5 pt-20">
          
          <div className="max-w-7xl mx-auto">
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 text-center">
                Guia Simples: <span className="text-emerald-400">Passo a Passo</span>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { step: "01", title: "Patrimônio Atual", desc: "Quanto você já tem investido hoje? Se está começando do zero, coloque R$ 0." },
                  { step: "02", title: "Aporte Mensal", desc: "Quanto você consegue poupar e investir todos os meses?" },
                  { step: "03", title: "Taxa de Juros", desc: "Qual a rentabilidade esperada? Uma taxa de 8% a 10% ao ano é comum no mercado." },
                  { step: "04", title: "O Prazo", desc: "Por quanto tempo você pretende manter o investimento rendendo?" },
                  { step: "05", title: "Resultado", desc: "Clique em calcular e veja a mágica acontecer em tempo real." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <span className="text-4xl font-black text-emerald-500/10 absolute -top-1 -left-1 group-hover:text-emerald-500/20 transition-all">{item.step}</span>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 relative z-10">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed relative z-10">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* EXPLICAÇÕES DIDÁTICAS PADRONIZADAS */}
          <div className="bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 border border-white/5 p-12 rounded-[3.5rem] max-w-7xl mx-auto overflow-hidden relative">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">
                      {activeTool === 'MILLION' ? 'O Caminho para o Milhão' : 'A Força da Capitalização'}
                   </h3>
                   <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      {activeTool === 'MILLION' 
                        ? 'Chegar ao primeiro milhão não é sobre sorte, é sobre estratégia. Nossa calculadora usa o modelo de juros compostos para mostrar que, com disciplina e tempo, qualquer pessoa pode atingir essa meta histórica.'
                        : 'Juros compostos são juros calculados sobre o capital inicial e também sobre os juros acumulados de períodos anteriores. É o efeito "bola de neve" que acelera seu enriquecimento.'
                      }
                   </p>
                   
                   <div className="space-y-4">
                      <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Exemplo de Evolução (Investindo R$ 5.000 + 1% ao mês)</h4>
                      {[
                        { years: 5, simple: "R$ 8.000", compound: "R$ 9.083" },
                        { years: 10, simple: "R$ 11.000", compound: "R$ 16.501" },
                        { years: 20, simple: "R$ 17.000", compound: "R$ 54.462" },
                        { years: 30, simple: "R$ 23.000", compound: "R$ 179.748" }
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.years} Anos</span>
                           <div className="flex gap-8">
                              <span className="text-[10px] font-bold text-slate-600">Simples: {row.simple}</span>
                              <span className="text-[10px] font-black text-emerald-400">Compostos: {row.compound}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-950 p-10 rounded-3xl border border-white/10 shadow-inner">
                   <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6 text-center">Fórmula Matemática</h4>
                   <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 mb-8">
                      <p className="text-emerald-400 font-mono text-xl text-center">M = C (1 + i)ᵗ</p>
                   </div>
                   <div className="grid grid-cols-2 gap-6 text-[10px] text-slate-400 uppercase font-bold">
                      <div><span className="text-emerald-500">M:</span> Montante Final</div>
                      <div><span className="text-emerald-500">C:</span> Capital Inicial</div>
                      <div><span className="text-emerald-500">i:</span> Taxa de Juros</div>
                      <div><span className="text-emerald-500">t:</span> Tempo (Meses/Anos)</div>
                   </div>
                   <div className="mt-10 pt-10 border-t border-white/5 italic text-slate-500 text-xs text-center">
                     "Juros compostos são a oitava maravilha do mundo. Quem entende, ganha; quem não entende, paga." <br />
                     <span className="text-emerald-500 not-italic font-black mt-2 block">— Albert Einstein</span>
                   </div>
                </div>
             </div>
          </div>

          {/* ONDE SE APLICA */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white/[0.01] p-10 rounded-[3rem] border border-white/5 hover:bg-white/[0.02] transition-all">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 shadow-lg shadow-emerald-500/5">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                   </svg>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-4">Investimentos</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Em CDBs, Tesouro Direto ou Ações, os juros trabalham a seu favor, multiplicando seu patrimônio enquanto você dorme.</p>
             </div>
             <div className="bg-white/[0.01] p-10 rounded-[3rem] border border-white/5 hover:bg-white/[0.02] transition-all">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-lg shadow-indigo-500/5">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                   </svg>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-4">Compras Parceladas</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Fique atento! Juros embutidos em parcelas de longo prazo podem fazer você pagar o dobro pelo mesmo produto.</p>
             </div>
             <div className="bg-white/[0.01] p-10 rounded-[3rem] border border-white/5 hover:bg-white/[0.02] transition-all">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-lg shadow-red-500/5">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tighter mb-4">Dívidas e Cartão</h4>
                <p className="text-xs text-slate-500 leading-relaxed">O perigo mora aqui. Quando você não paga o total, os juros sobre juros fazem a dívida crescer exponencialmente.</p>
             </div>
          </div>
        </section>

      </main>

      <footer className="relative z-10 py-20 border-t border-white/5 mt-20 text-center bg-slate-950/60 backdrop-blur-3xl">
          <p className="text-slate-600 text-[9px] uppercase tracking-[0.6em] mb-4">Millennium Pro • Investidor Sardinha • 2024</p>
          <p className="text-slate-400 text-xs max-w-2xl mx-auto px-6 leading-relaxed">
            Nossa calculadora é uma ferramenta educativa. Recomendamos sempre a consulta a um profissional certificado (CFP® ou Consultor CVM) antes de tomar decisões financeiras complexas.
          </p>
      </footer>
    </div>
  );
};

export default App;

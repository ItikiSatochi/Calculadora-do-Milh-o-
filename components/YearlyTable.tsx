import React from 'react';
import { YearData } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  data: YearData[];
  themeColor?: string;
}

const YearlyTable: React.FC<Props> = ({ data, themeColor = '#10b981' }) => {
  if (data.length === 0) {
    return null;
  }
  
  return (
    <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl md:rounded-[2rem] mt-6 shadow-inner">
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
        <table className="w-full text-[10px] md:text-xs text-left text-slate-400 border-collapse">
          <thead className="sticky top-0 z-20 text-[8px] md:text-[10px] text-slate-400 uppercase bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
            <tr>
              <th scope="col" className="px-3 md:px-4 py-4 md:py-5 text-center font-black tracking-widest min-w-[50px]">Ano</th>
              <th scope="col" className="px-3 md:px-4 py-4 md:py-5 text-right font-black tracking-widest min-w-[100px] md:min-w-[140px]">Aportado</th>
              <th scope="col" className="px-3 md:px-4 py-4 md:py-5 text-right font-black tracking-widest min-w-[100px] md:min-w-[140px]">Juros/Ano</th>
              <th scope="col" className="px-3 md:px-4 py-4 md:py-5 text-right font-black tracking-widest min-w-[110px] md:min-w-[140px]">Investido</th>
              <th scope="col" className="px-3 md:px-4 py-4 md:py-5 text-right font-black tracking-widest min-w-[110px] md:min-w-[140px]">Total Juros</th>
              <th scope="col" className="px-4 md:px-6 py-4 md:py-5 text-right font-black tracking-widest min-w-[130px] md:min-w-[160px] text-white bg-slate-800/20">Patrimônio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((yearData, index) => (
              <tr 
                key={yearData.year} 
                className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'} hover:bg-slate-800/50`}
              >
                <td className="px-3 md:px-4 py-3 md:py-4 text-center font-bold text-white border-r border-slate-800/30">
                  {yearData.year}
                </td>
                <td className="px-3 md:px-4 py-3 md:py-4 text-right font-mono opacity-80 whitespace-nowrap">
                  {formatCurrency(yearData.annualContribution)}
                </td>
                <td className="px-3 md:px-4 py-3 md:py-4 text-right font-mono font-bold whitespace-nowrap" style={{ color: themeColor }}>
                  {formatCurrency(yearData.annualInterest)}
                </td>
                <td className="px-3 md:px-4 py-3 md:py-4 text-right font-mono opacity-80 whitespace-nowrap">
                  {formatCurrency(yearData.totalInvested)}
                </td>
                <td className="px-3 md:px-4 py-3 md:py-4 text-right font-mono opacity-80 whitespace-nowrap">
                  {formatCurrency(yearData.totalInterest)}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 font-black font-mono text-right bg-slate-800/10 whitespace-nowrap" style={{ color: themeColor }}>
                  {formatCurrency(yearData.totalAccumulated)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Indicador de rolagem para tabelas longas */}
      {data.length > 8 && (
        <div className="absolute bottom-0 left-0 right-0 h-6 md:h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none opacity-50"></div>
      )}
    </div>
  );
};

export default YearlyTable;

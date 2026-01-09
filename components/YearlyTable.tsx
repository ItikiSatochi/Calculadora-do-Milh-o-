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
    <div className="overflow-x-auto bg-slate-900/50 border border-slate-800 rounded-2xl mt-6">
      <table className="w-full text-sm text-left text-slate-400">
        <thead className="text-[10px] text-slate-400 uppercase bg-slate-800/50">
          <tr>
            <th scope="col" className="px-6 py-4 tracking-wider">Ano</th>
            <th scope="col" className="px-6 py-4 text-right tracking-wider">Aportado no Ano</th>
            <th scope="col" className="px-6 py-4 text-right tracking-wider">Juros no Ano</th>
            <th scope="col" className="px-6 py-4 text-right tracking-wider">Total Investido</th>
            <th scope="col" className="px-6 py-4 text-right tracking-wider">Total Juros</th>
            <th scope="col" className="px-6 py-4 text-right font-bold text-white tracking-wider">Patrimônio Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((yearData) => (
            <tr key={yearData.year} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
              <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{yearData.year}</td>
              <td className="px-6 py-4 text-right font-mono">{formatCurrency(yearData.annualContribution)}</td>
              <td className="px-6 py-4 text-right font-mono" style={{ color: themeColor }}>{formatCurrency(yearData.annualInterest)}</td>
              <td className="px-6 py-4 text-right font-mono">{formatCurrency(yearData.totalInvested)}</td>
              <td className="px-6 py-4 text-right font-mono" style={{ color: themeColor }}>{formatCurrency(yearData.totalInterest)}</td>
              <td className="px-6 py-4 font-bold font-mono text-right" style={{ color: themeColor }}>{formatCurrency(yearData.totalAccumulated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default YearlyTable;

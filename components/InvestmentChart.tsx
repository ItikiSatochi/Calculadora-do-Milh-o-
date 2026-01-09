
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MonthData } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  data: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">Mês de Evolução: {label}</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-10 items-center">
            <span className="font-bold text-emerald-400">Total:</span>
            <span className="font-mono font-bold text-white">{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex justify-between gap-10 items-center border-t border-white/5 pt-2">
            <span className="text-slate-400">Investido:</span>
            <span className="font-mono text-slate-300">{formatCurrency(payload[1].value)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const InvestmentChart: React.FC<Props> = ({ data }) => {
  const sampledData = data.filter((_, i) => data.length > 240 ? i % 12 === 0 : (data.length > 120 ? i % 6 === 0 : i % 3 === 0));

  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            dataKey="month" 
            stroke="#475569" 
            fontSize={9} 
            tickFormatter={(val) => `ANO ${Math.floor(val/12)}`}
            axisLine={false}
            tickLine={false}
            dy={15}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickFormatter={(val) => `R$ ${val/1000}K`}
            axisLine={false}
            tickLine={false}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 2 }} />
          <Legend 
            wrapperStyle={{ paddingTop: '30px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
            iconType="circle"
          />
          <Area 
            name="Patrimônio Acumulado"
            type="monotone" 
            dataKey="total" 
            stroke="#10b981" 
            strokeWidth={4}
            fill="url(#colorTotal)" 
            animationDuration={1500}
          />
          <Area 
            name="Capital Inicial + Aportes"
            type="monotone" 
            dataKey="invested" 
            stroke="#334155" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="transparent" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentChart;

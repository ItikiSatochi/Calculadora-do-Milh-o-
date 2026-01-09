
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
  mainColor?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">Mês de Evolução: {label}</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-10 items-center">
            <span className="font-bold text-white">Total:</span>
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

const InvestmentChart: React.FC<Props> = ({ data, mainColor = '#10b981' }) => {
  const sampledData = data.filter((_, i) => data.length > 240 ? i % 12 === 0 : (data.length > 120 ? i % 6 === 0 : i % 3 === 0));

  return (
    <div className="h-[300px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: `${mainColor}33`, strokeWidth: 2 }} />
          <Legend 
            verticalAlign="top" 
            align="right"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '8px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
            iconType="circle"
          />
          <Area 
            name="Patrimônio Total"
            type="monotone" 
            dataKey="total" 
            stroke={mainColor} 
            strokeWidth={3}
            fill="url(#colorTotal)" 
            animationDuration={1500}
          />
          <Area 
            name="Capital Investido"
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

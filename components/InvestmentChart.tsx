
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
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl text-slate-200">
        <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Mês {label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-6">
            <span className="font-bold text-red-500">Total:</span>
            <span>{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400">Investido:</span>
            <span>{formatCurrency(payload[1].value)}</span>
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
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampledData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="month" 
            stroke="#475569" 
            fontSize={10} 
            tickFormatter={(val) => `Ano ${Math.floor(val/12)}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={10} 
            tickFormatter={(val) => `R$ ${val/1000}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase' }} />
          <Area 
            name="Total Acumulado"
            type="monotone" 
            dataKey="total" 
            stroke="#ef4444" 
            strokeWidth={3}
            fill="url(#colorTotal)" 
          />
          <Area 
            name="Total Investido"
            type="monotone" 
            dataKey="invested" 
            stroke="#475569" 
            strokeWidth={1}
            fill="transparent" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentChart;

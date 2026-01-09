
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils';

interface Props {
  invested: number;
  interest: number;
  mainColor?: string;
}

const CompositionChart: React.FC<Props> = ({ invested, interest, mainColor = '#10b981' }) => {
  const data = [
    { name: 'Aportes', value: invested, color: '#1e293b' },
    { name: 'Juros', value: interest, color: mainColor },
  ];

  return (
    <div className="h-[260px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: '#020617', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-8 mt-6">
         {data.map(d => (
           <div key={d.name} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ 
                backgroundColor: d.color, 
                boxShadow: d.name === 'Juros' ? `0 0 10px ${mainColor}66` : 'none' 
              }}></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default CompositionChart;

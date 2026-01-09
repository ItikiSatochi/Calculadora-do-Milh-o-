
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils';

interface Props {
  invested: number;
  interest: number;
}

const CompositionChart: React.FC<Props> = ({ invested, interest }) => {
  const data = [
    { name: 'Investido', value: invested, color: '#334155' },
    { name: 'Juros', value: interest, color: '#dc2626' },
  ];

  return (
    <div className="h-[240px] w-full flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-4">
         {data.map(d => (
           <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export default CompositionChart;

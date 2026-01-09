
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  primary?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, primary }) => {
  return (
    <div className={`rounded-[2rem] p-8 border ${primary ? 'bg-red-950/40 border-red-800/50' : 'bg-slate-900/50 border-slate-800'} flex flex-col items-center justify-center text-center shadow-xl`}>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{title}</span>
      <span className={`text-2xl font-black tracking-tighter ${primary ? 'text-red-500' : 'text-white'}`}>{value}</span>
    </div>
  );
};

export default DashboardCard;

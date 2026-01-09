
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  primary?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, primary }) => {
  if (primary) {
    return (
      <div className="rounded-[2.5rem] p-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-500/5 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 relative z-10">Meta Principal</span>
        <span className="text-2xl font-black tracking-tighter text-white relative z-10">{value}</span>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-sm hover:border-white/10 transition-all duration-300">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{title}</span>
      <span className="text-2xl font-black tracking-tighter text-white">{value}</span>
    </div>
  );
};

export default DashboardCard;

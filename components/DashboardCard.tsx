
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  variant?: 'emerald' | 'indigo' | 'cyan';
  primary?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, variant = 'emerald', primary }) => {
  const themes = {
    emerald: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/5',
      gradient: 'from-emerald-500/10 to-emerald-900/10'
    },
    indigo: {
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
      text: 'text-indigo-400',
      glow: 'shadow-indigo-500/5',
      gradient: 'from-indigo-500/10 to-indigo-900/10'
    },
    cyan: {
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/5',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/5',
      gradient: 'from-cyan-500/10 to-cyan-900/10'
    }
  };

  const theme = themes[variant];

  if (primary) {
    return (
      <div className={`rounded-[2rem] p-6 border ${theme.border} bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center text-center shadow-2xl ${theme.glow} backdrop-blur-md relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]`}>
        <div className={`absolute inset-0 ${theme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <span className={`text-[8px] font-black ${theme.text} uppercase tracking-[0.3em] mb-3 relative z-10`}>{title}</span>
        <span className="text-xl md:text-2xl font-black tracking-tighter text-white relative z-10 drop-shadow-md">{value}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-[2rem] p-6 border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-sm hover:border-white/10 transition-all duration-300 group`}>
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 group-hover:text-slate-400 transition-colors">{title}</span>
      <span className={`text-xl md:text-2xl font-black tracking-tighter text-white group-hover:${theme.text} transition-colors`}>{value}</span>
    </div>
  );
};

export default DashboardCard;

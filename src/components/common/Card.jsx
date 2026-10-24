import React from 'react';

export function Card({ children, className = '', glow = false, glowColor = 'emerald' }) {
  const glowStyles = {
    emerald: 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
    amber: 'hover:border-amber-500/40 hover:shadow-glow-amber',
    red: 'hover:border-rose-500/40 hover:shadow-glow-red',
    blue: 'hover:border-blue-500/40 hover:shadow-glow-blue',
  };

  return (
    <div 
      className={`glass-panel rounded-xl p-5 border border-slate-800/80 transition-all duration-300 ${
        glow ? glowStyles[glowColor] || glowStyles.emerald : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, unit = '', subtext, icon: Icon, color = 'emerald', trend }) {
  const colorMap = {
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-glow-emerald'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-glow-amber'
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: 'shadow-glow-red'
    },
    blue: {
      text: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      glow: 'shadow-glow-blue'
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: ''
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.border} border`}>
            <Icon className={`w-5 h-5 ${scheme.text}`} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>{subtext}</span>
          {trend && (
            <span className={`font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

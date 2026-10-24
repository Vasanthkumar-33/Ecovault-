import React from 'react';

export function HealthGradeBadge({ grade, showIcon = true, size = 'md' }) {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1.5 font-semibold' 
      : 'text-xs px-2.5 py-1 font-medium';

  if (grade === 'Green') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
        Grade A (Green ≥80%)
      </span>
    );
  } else if (grade === 'Yellow') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
        Grade B (Yellow 50-79%)
      </span>
    );
  } else {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
        {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>}
        Grade C (Red &lt;50%)
      </span>
    );
  }
}

export function StatusBadge({ status }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Active (Online)
      </span>
    );
  } else if (status === 'Maintenance') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        Maintenance
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium bg-rose-950/60 text-rose-300 border border-rose-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Isolated (Contactor Open)
      </span>
    );
  }
}

export function SeverityBadge({ severity }) {
  if (severity === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
        Critical Interlock
      </span>
    );
  } else if (severity === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
        Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
      System Info
    </span>
  );
}

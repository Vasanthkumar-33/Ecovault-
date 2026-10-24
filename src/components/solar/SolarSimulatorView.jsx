import React from 'react';
import { 
  Sun, 
  Zap, 
  BatteryCharging, 
  ArrowRight, 
  ArrowDown, 
  ArrowUp, 
  Power, 
  ShieldCheck, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useBattery } from '../../context/BatteryContext';

export function SolarSimulatorView() {
  const { 
    simulation, 
    setSimulationDemand, 
    setSimulationSolar, 
    allocationResult, 
    energyBalance,
    metrics,
    setActiveTab 
  } = useBattery();

  const solarPresets = [
    { label: 'Night (0W)', watts: 0 },
    { label: 'Early Morning (800W)', watts: 800 },
    { label: 'Peak Midday (4500W)', watts: 4500 },
    { label: 'Cloudy Afternoon (1800W)', watts: 1800 },
    { label: 'High Solar Array (7000W)', watts: 7000 },
  ];

  const loadPresets = [
    { label: 'Low Facility (1000W)', watts: 1000 },
    { label: 'Standard Shift (3500W)', watts: 3500 },
    { label: 'Peak Afternoon (6000W)', watts: 6000 },
    { label: 'High Surge (9500W)', watts: 9500 },
  ];

  // Microgrid balance comparison chart data
  const comparisonData = [
    {
      name: 'Power Flow',
      'Solar Generation': energyBalance.solarWatts,
      'Facility Demand': energyBalance.loadDemandWatts,
      '2nd-Life Battery Supply': energyBalance.batteryDischargeWatts,
      'Grid Import (Deficit)': energyBalance.gridImportWatts,
      'Grid Export (Surplus)': energyBalance.gridExportWatts,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Solar PV & Second-Life Storage Microgrid Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time balance orchestration between intermittent rooftop solar, facility load, second-life batteries, and grid exchange.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Clean Self-Sufficiency: {energyBalance.greenEnergyPct}%
          </span>
        </div>
      </div>

      {/* 5 Distinct Microgrid Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Solar Generation (Power: Watts) */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold tracking-wider">Solar Generation</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-amber-400">
            {energyBalance.solarWatts.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">W (Power)</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{(energyBalance.solarWatts / 1000).toFixed(2)} kW PV Array</span>
        </div>

        {/* 2. Requested Load (Power: Watts) */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold tracking-wider">Requested Load</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-sky-300">
            {energyBalance.loadDemandWatts.toLocaleString()} <span className="text-xs font-normal text-slate-400 font-sans">W (Power)</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{(energyBalance.loadDemandWatts / 1000).toFixed(2)} kW Facility Demand</span>
        </div>

        {/* 3. Battery Discharge Contribution (Power: Watts) */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold tracking-wider">Battery Power</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-emerald-400">
            {energyBalance.batteryDischargeWatts > 0 ? `-${energyBalance.batteryDischargeWatts.toLocaleString()}` : energyBalance.batteryChargingWatts > 0 ? `+${energyBalance.batteryChargingWatts.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">W (Power)</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {energyBalance.batteryDischargeWatts > 0 ? 'Discharging to cover load' : energyBalance.batteryChargingWatts > 0 ? 'Absorbing solar surplus' : 'Standing by'}
          </span>
        </div>

        {/* 4. Net Unmet Demand or Surplus (Power: Watts) */}
        <div className={`glass-panel rounded-xl p-4 border ${
          energyBalance.gridImportWatts > 0 ? 'border-rose-800/60 bg-rose-950/20' : 'border-emerald-800/60 bg-emerald-950/20'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase font-semibold tracking-wider text-slate-300">
              {energyBalance.gridImportWatts > 0 ? 'Unmet Demand' : 'Surplus Power'}
            </span>
            <Power className={`w-4 h-4 ${energyBalance.gridImportWatts > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className={`mt-2 text-xl font-black font-mono ${
            energyBalance.gridImportWatts > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {energyBalance.gridImportWatts > 0 ? `+${energyBalance.gridImportWatts.toLocaleString()}` : `+${energyBalance.gridExportWatts.toLocaleString()}`}{' '}
            <span className="text-xs font-normal text-slate-400 font-sans">W</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {energyBalance.gridImportWatts > 0 ? 'Grid backup import required' : 'Green export to local grid'}
          </span>
        </div>

        {/* 5. Available Battery Energy (Energy: kWh) */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold tracking-wider">Available Energy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black font-mono text-white">
            {metrics.totalAvailableEnergyKwh} <span className="text-xs font-normal text-slate-400 font-sans">kWh (Energy)</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Across active second-life packs</span>
        </div>
      </div>

      {/* Control Sliders Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Input Slider */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              Simulated Rooftop Solar Generation
            </label>
            <div className="flex items-center gap-1.5 font-mono">
              <input
                type="number"
                min="0"
                max="10000"
                step="100"
                value={simulation.solarGenerationWatts}
                onChange={(e) => setSimulationSolar(e.target.value)}
                className="w-24 px-2.5 py-1 text-right text-base font-bold bg-slate-900 border border-slate-700 rounded-lg text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400 font-semibold">W</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="8000"
            step="100"
            value={simulation.solarGenerationWatts}
            onChange={(e) => setSimulationSolar(e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] text-slate-400 font-medium">Solar Presets:</span>
            {solarPresets.map((p) => (
              <button
                key={p.watts}
                onClick={() => setSimulationSolar(p.watts)}
                className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                  simulation.solarGenerationWatts === p.watts
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Load Demand Slider */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Simulated Facility Load Demand
            </label>
            <div className="flex items-center gap-1.5 font-mono">
              <input
                type="number"
                min="0"
                max="12000"
                step="100"
                value={simulation.loadDemandWatts}
                onChange={(e) => setSimulationDemand(e.target.value)}
                className="w-24 px-2.5 py-1 text-right text-base font-bold bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400 font-semibold">W</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={simulation.loadDemandWatts}
            onChange={(e) => setSimulationDemand(e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-[10px] text-slate-400 font-medium">Load Presets:</span>
            {loadPresets.map((p) => (
              <button
                key={p.watts}
                onClick={() => setSimulationDemand(p.watts)}
                className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                  simulation.loadDemandWatts === p.watts
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Microgrid Power Flow Architecture Diagram */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-sm font-bold text-white tracking-wide mb-4 flex items-center gap-2">
          <Power className="w-4 h-4 text-emerald-400" />
          Interactive Energy Dispatch Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Solar PV Node */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40 mb-2">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Solar Generation</span>
            <span className="text-xl font-black font-mono text-amber-300 mt-1">
              {energyBalance.solarWatts.toLocaleString()} W
            </span>
            <span className="text-[10px] text-amber-400/80 mt-1">
              Rooftop Photovoltaic Array
            </span>
          </div>

          {/* EcoVault BMS Dispatch Router Node */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center flex flex-col items-center shadow-glow-emerald">
            <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 mb-2">
              <BatteryCharging className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">EcoVault Second-Life BESS</span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1">
              {energyBalance.batteryDischargeWatts > 0 
                ? `-${energyBalance.batteryDischargeWatts.toLocaleString()} W (Discharging)` 
                : energyBalance.batteryChargingWatts > 0 
                  ? `+${energyBalance.batteryChargingWatts.toLocaleString()} W (Charging)` 
                  : '0 W (Idle)'
              }
            </span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">
              {metrics.totalAvailableEnergyKwh} kWh available
            </span>
          </div>

          {/* Facility Load Node */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-sky-500/20 border border-sky-500/40 mb-2">
              <Zap className="w-6 h-6 text-sky-400" />
            </div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Facility Load Demand</span>
            <span className="text-xl font-black font-mono text-sky-300 mt-1">
              {energyBalance.loadDemandWatts.toLocaleString()} W
            </span>
            <span className="text-[10px] text-sky-400/80 mt-1">
              Microgrid Power Demand
            </span>
          </div>

          {/* Grid Interconnect Node */}
          <div className={`p-4 rounded-xl border text-center flex flex-col items-center ${
            energyBalance.gridImportWatts > 0
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : energyBalance.gridExportWatts > 0
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <div className={`p-3 rounded-full mb-2 border ${
              energyBalance.gridImportWatts > 0 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold">Utility Grid Intertie</span>
            <span className="text-xl font-black font-mono mt-1">
              {energyBalance.gridImportWatts > 0 
                ? `Import ${energyBalance.gridImportWatts.toLocaleString()} W` 
                : energyBalance.gridExportWatts > 0 
                  ? `Export ${energyBalance.gridExportWatts.toLocaleString()} W` 
                  : '0 W Balanced'
              }
            </span>
            <span className="text-[10px] mt-1">
              {energyBalance.gridImportWatts > 0 ? 'Energy Deficit (Grid Backup)' : 'Surplus Green Feed-in'}
            </span>
          </div>
        </div>

        {/* Real-time Status Explanation Message */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {energyBalance.gridImportWatts > 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {energyBalance.solarWatts >= energyBalance.loadDemandWatts ? (
                <span>
                  <strong>Solar Generation Surplus:</strong> Rooftop generation exceeds facility demand. Excess power ({energyBalance.solarWatts - energyBalance.loadDemandWatts} W) is directed to charge second-life batteries and export to the microgrid.
                </span>
              ) : energyBalance.gridImportWatts > 0 ? (
                <span>
                  <strong>Grid Backup Required:</strong> Combined solar ({energyBalance.solarWatts}W) and second-life battery discharge ({energyBalance.batteryDischargeWatts}W) cannot meet full load ({energyBalance.loadDemandWatts}W). Deficit of {energyBalance.gridImportWatts}W drawn from grid.
                </span>
              ) : (
                <span>
                  <strong>100% Circular Self-Sufficiency:</strong> Second-life batteries are seamlessly covering the {energyBalance.loadDemandWatts - energyBalance.solarWatts}W solar gap. Zero grid power imported!
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h2 className="text-sm font-bold text-white tracking-wide mb-4">
          Instantaneous Power Balance Breakdown (Watts)
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit="W" />
              <RechartsTooltip
                contentStyle={{ 
                  backgroundColor: '#0B132B', 
                  borderColor: '#1e293b', 
                  borderRadius: '8px', 
                  fontSize: '12px' 
                }}
                formatter={(val, name) => [`${val} W`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Solar Generation" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Facility Demand" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2nd-Life Battery Supply" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Grid Import (Deficit)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Grid Export (Surplus)" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

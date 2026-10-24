import React from 'react';
import { 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  HelpCircle, 
  ShieldAlert, 
  TrendingUp, 
  BarChart3,
  Layers
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';
import { getHealthGrade } from '../../utils/bmsAlgorithm';
import { HealthGradeBadge, StatusBadge } from '../common/Badge';

export function AdaptiveBMSView() {
  const { 
    modules, 
    thresholds, 
    simulation, 
    setSimulationDemand, 
    allocationResult,
    updateSimulatedTelemetry,
    isolateModule,
    reconnectModule,
    setActiveTab,
    setSelectedModuleId
  } = useBattery();

  const presets = [
    { label: 'Idle Base Load', watts: 1200 },
    { label: 'Normal Facility', watts: 3200 },
    { label: 'High Afternoon Peak', watts: 5500 },
    { label: 'Grid Outage Stress', watts: 8200 },
    { label: 'Extreme Overload', watts: 11000 },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Adaptive BMS Dispatch Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Deterministic, health-prioritized multi-pack load balancing designed for second-life EV battery banks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Deterministic Dynamic Dispatch
          </span>
        </div>
      </div>

      {/* Main Simulation Control Deck */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-card-dark">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Slider & Numerical Input */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Simulated Microgrid Load Demand
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="15000"
                  step="100"
                  value={simulation.loadDemandWatts}
                  onChange={(e) => setSimulationDemand(e.target.value)}
                  className="w-28 px-3 py-1.5 text-right font-mono text-lg font-black bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs font-mono text-slate-400 font-semibold">Watts</span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="12000"
              step="100"
              value={simulation.loadDemandWatts}
              onChange={(e) => setSimulationDemand(e.target.value)}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.watts}
                  onClick={() => setSimulationDemand(p.watts)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    simulation.loadDemandWatts === p.watts
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-glow-emerald'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.label} ({p.watts}W)
                </button>
              ))}
            </div>
          </div>

          {/* Aggregate Dispatch Summary Badge */}
          <div className="lg:w-80 p-4 rounded-xl bg-[#090F22] border border-slate-800 flex flex-col justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              BMS Dispatch Capacity Status
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Total Rated Power:</span>
              <span className="font-mono text-base font-bold text-white">
                {allocationResult.totalAvailableMaxPower.toLocaleString()} W
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Total Allocated:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {allocationResult.totalAllocatedWatts.toLocaleString()} W
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Unmet Demand:</span>
              <span className={`font-mono text-base font-bold ${
                allocationResult.unmetDemandWatts > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {allocationResult.unmetDemandWatts.toLocaleString()} W
              </span>
            </div>
          </div>
        </div>

        {/* Overload Alert Warning */}
        {allocationResult.isOverloaded && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3 text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-200">System Overload Warning! Demand Exceeds Available Second-Life Power</h4>
                <p className="mt-0.5 text-rose-300/80">
                  Requested load ({allocationResult.requestedDemand.toLocaleString()} W) surpasses the safe maximum capacity of active Green and Yellow modules ({allocationResult.totalAvailableMaxPower.toLocaleString()} W). 
                  Unmet deficit of <strong>{allocationResult.unmetDemandWatts.toLocaleString()} W</strong> must be imported from the grid or shed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('solar')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold whitespace-nowrap self-start sm:self-auto"
            >
              Examine Solar & Grid Balance
            </button>
          </div>
        )}

        {/* Allocation Algorithm Explanation Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Deterministic Health-Weighted Allocation Logic (Transparent Rule-Based BMS)</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            100% deterministic, rule-based mathematical dispatch. No fabricated AI models or statistical estimates. Every Watt is verifiable and strictly clamped within physical inverter power limits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 mt-2">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-emerald-400 block mb-1">1. Priority Weighting (Green)</span>
              <p className="text-[11px] leading-relaxed">
                Modules with SOH &ge; {thresholds.greenHealthMin}% receive priority factor (<code className="text-slate-300">SOH^1.2 × 2.8</code>). They absorb high-demand facility surges while preserving weaker packs.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-amber-400 block mb-1">2. Derated Dispatch (Yellow)</span>
              <p className="text-[11px] leading-relaxed">
                Modules with SOH {thresholds.yellowHealthMin}-{thresholds.greenHealthMin - 1}% receive smaller share factor (<code className="text-slate-300">SOH × 0.75</code>) for gentle, derated base-load discharge.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-rose-400 block mb-1">3. Strict Red Isolation</span>
              <p className="text-[11px] leading-relaxed">
                Modules with SOH &lt; {thresholds.yellowHealthMin}% or marked Isolated/Maintenance receive strictly <strong>0 W</strong>. Inverter contactors open to protect the bus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Modules Dispatch Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Live Module Dispatch & Share Breakdown
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {allocationResult.eligibleCount} eligible modules sharing load
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const alloc = allocationResult.allocations[m.id] || { watts: 0, pctOfDemand: 0, pctOfMaxPower: 0, reason: '' };
            const gradeInfo = getHealthGrade(m.health, thresholds);
            const isRed = gradeInfo.grade === 'Red';
            const isIsolated = m.status === 'Isolated';
            const maxP = Number(m.maxPowerWatts) || 2000;

            return (
              <div 
                key={m.id}
                className={`glass-panel rounded-xl p-5 border flex flex-col justify-between ${
                  isRed || isIsolated
                    ? 'border-rose-950/80 bg-[#090D1C]/80 opacity-90'
                    : gradeInfo.grade === 'Green'
                      ? 'border-emerald-900/50 hover:border-emerald-500/40'
                      : 'border-amber-900/50 hover:border-amber-500/40'
                }`}
              >
                <div>
                  {/* Top: ID & Grade */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-base font-black text-white">
                        {m.id}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {m.originalVehicle || 'EV Donor'}
                      </p>
                    </div>
                    <HealthGradeBadge grade={gradeInfo.grade} size="sm" />
                  </div>

                  {/* Allocation Display */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Assigned Load Power
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-2xl font-black font-mono ${
                        isRed ? 'text-slate-600' : 'text-emerald-400'
                      }`}>
                        {alloc.watts.toLocaleString()} <span className="text-xs text-slate-400 font-sans">W</span>
                      </span>
                      <span className="text-xs font-mono text-slate-300 font-bold">
                        {alloc.pctOfDemand}% <span className="text-[10px] text-slate-500">of demand</span>
                      </span>
                    </div>

                    {/* Capacity load bar */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Load vs Max Inverter Cap ({maxP}W):</span>
                        <span className="font-mono font-semibold text-slate-200">{alloc.pctOfMaxPower}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            alloc.pctOfMaxPower >= 100 
                              ? 'bg-amber-400' 
                              : isRed 
                                ? 'bg-rose-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, alloc.pctOfMaxPower)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SOH and Max Limit info */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">SOH</span>
                      <span className={`font-mono font-bold ${
                        isRed ? 'text-rose-400' : gradeInfo.grade === 'Green' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {m.health}%
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Voltage</span>
                      <span className="font-mono font-bold text-white">{m.voltage}V</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Max Limit</span>
                      <span className="font-mono font-bold text-slate-300">{maxP}W</span>
                    </div>
                  </div>

                  {/* Reason / Status notice */}
                  <p className="mt-2.5 text-[11px] text-slate-400 italic">
                    {alloc.reason}
                  </p>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {isIsolated ? (
                    <button
                      onClick={() => reconnectModule(m.id)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Reconnect Contactor
                    </button>
                  ) : (
                    <button
                      onClick={() => isolateModule(m.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      Isolate Module
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedModuleId(m.id);
                      setActiveTab('passport');
                    }}
                    className="text-slate-300 hover:text-emerald-300 font-medium"
                  >
                    View Passport →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

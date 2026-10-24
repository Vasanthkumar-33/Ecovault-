import React from 'react';
import { 
  Leaf, 
  Cpu, 
  ShieldAlert, 
  FileBadge, 
  SunMedium, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';

export function InnovationImpactView() {
  const { metrics, setActiveTab } = useBattery();

  // Impact calculations based on active fleet capacity
  const totalKwh = metrics.totalCapacityKwh;
  const estimatedCo2AvoidedKg = Math.round(totalKwh * 72); // ~72 kg CO2e / kWh avoided vs new cell fabrication
  const estimatedCapitalSavingsUsd = Math.round(totalKwh * 75); // ~$75 / kWh saved repurposing vs new battery purchase ($140 vs $65)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Technical Innovation & Circular Sustainability Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Architectural principles, circular economy impact model, and hardware boundary definitions.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('bms')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition-all self-start sm:self-auto"
        >
          <span>View BMS Allocation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Software Simulation Scope Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-300 uppercase tracking-wide">
            Prototype Simulation & Engineering Boundary Notice
          </h4>
          <p className="mt-1 leading-relaxed text-amber-200/90 text-[11px]">
            EcoVault is an algorithmic prototype developed for national sustainability competition evaluation. All sensor readings, voltages, temperatures, and carbon savings are simulated using transparent mathematical models. <strong>Real-world deployment requires physical DC contactors, galvanic isolation monitors, fused string combiners, and hardware-validated battery management ICs.</strong>
          </p>
        </div>
      </div>

      {/* 3 Core Technical Innovation Pillars */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Core Technical Innovations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 w-fit text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1. Health-Aware Dynamic Load Dispatch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Second-life batteries suffer from uneven cell aging. Traditional parallel arrays cause weaker packs to overheat. EcoVault uses a deterministic allocation algorithm (<code className="text-emerald-400">SOH^1.2 × 2.8</code> for Green vs <code className="text-amber-400">SOH × 0.75</code> for Yellow) that gently derates degraded packs while letting prime packs absorb rapid facility surges.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              ✓ Prevents premature string failure without expensive cell-level rebuilding.
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-sky-500/15 border border-sky-500/30 w-fit text-sky-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">2. Proactive Anomaly Flagging & Isolation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A dynamic rules engine monitors bus voltage and thermal gradients against configurable thresholds. Out-of-range cells (under-voltage &lt;44V, over-voltage &gt;52V, or thermal runaway &ge;45°C) trigger instant software contactor disconnects to isolate compromised packs before damage propagates.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              ✓ Multi-tier isolation with immediate actionable diagnostic recommendations.
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 w-fit text-purple-400">
              <FileBadge className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3. Digital Passport & Traceability (EU Standard)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aligning with EU Battery Regulation 2023/1542, each pack carries an immutable digital record: first-life vehicle origin, original capacity, repurpose date, internal impedance, and full maintenance history.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              ✓ End-to-end circular accountability for secondary stationary grid deployment.
            </div>
          </div>
        </div>
      </div>

      {/* Environmental & Economic Impact Model */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Circular Sustainability & Economic Benefit Model
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Calculations below dynamically scale with the currently registered fleet in this demonstration ({totalKwh} kWh total capacity).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Environmental Offset Card */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">Estimated Carbon Avoided</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold font-mono">
                ~72 kg CO₂e / kWh
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400">
              ~{estimatedCo2AvoidedKg.toLocaleString()} <span className="text-sm font-sans text-slate-300 font-normal">kg CO₂e</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Underlying Model Assumption:</strong> Cradle-to-gate lifecycle assessment (LCA) data shows manufacturing new stationary Li-ion cells generates 70–85 kg CO₂e per kWh of capacity. Repurposing retired EV packs directly diverts batteries from scrap streams and displaces newly mined lithium, cobalt, and nickel.
            </p>
          </div>

          {/* Economic Savings Card */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">Estimated Capital Savings</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold font-mono">
                ~$75 / kWh saved
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-sky-300">
              ~${estimatedCapitalSavingsUsd.toLocaleString()} <span className="text-sm font-sans text-slate-300 font-normal">USD</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Underlying Model Assumption:</strong> Estimated second-life pack procurement, testing, and rack packaging costs ~$65/kWh versus ~$140/kWh for new stationary utility BESS packs. This reduces clean storage capital expenditure by ~53% for commercial microgrids.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-500 italic">
          * Note: Savings represent transparent mathematical estimates for demonstration purposes, based on published circular economy literature (BloombergNEF and Argonne National Laboratory GREET model). Real-world results will vary by local electricity tariffs and battery testing overhead.
        </div>
      </div>

      {/* Renewable Solar Integration Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <SunMedium className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Synergy with Renewable Energy Integration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Diurnal Solar Smoothing
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Midday solar surpluses are captured by the second-life pack array (up to 2500W charge rate). During cloudy intervals or dusk peaks, the BMS automatically discharges stored clean energy, keeping grid dependency low.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Peak Demand Shaving
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Commercial utility tariffs penalize instantaneous peak surges. EcoVault uses its healthiest Green modules to clip high peaks, significantly reducing utility demand charges for small-to-medium facilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

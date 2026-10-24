import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  Sliders, 
  Settings2, 
  Flame, 
  Zap, 
  Activity, 
  Power, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';
import { SeverityBadge } from '../common/Badge';

export function SafetyCenterView() {
  const { 
    modules, 
    thresholds, 
    updateThresholds, 
    safetyAlerts, 
    updateSimulatedTelemetry, 
    isolateModule, 
    reconnectModule,
    resetDemo, 
    setActiveTab, 
    setSelectedModuleId,
    logEvent 
  } = useBattery();

  // Selected module for fault injection
  const [targetModId, setTargetModId] = useState(modules[0]?.id || 'ECO-001');

  // Local threshold edit state
  const [localThresholds, setLocalThresholds] = useState({ ...thresholds });
  const [thresholdSavedNotice, setThresholdSavedNotice] = useState(false);

  const targetModule = modules.find(m => m.id === targetModId) || modules[0];

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    updateThresholds({
      greenHealthMin: Number(localThresholds.greenHealthMin),
      yellowHealthMin: Number(localThresholds.yellowHealthMin),
      voltageMinNormal: Number(localThresholds.voltageMinNormal),
      voltageMaxNormal: Number(localThresholds.voltageMaxNormal),
      tempMaxNormal: Number(localThresholds.tempMaxNormal),
      tempCritical: Number(localThresholds.tempCritical),
    });
    setThresholdSavedNotice(true);
    setTimeout(() => setThresholdSavedNotice(false), 3000);
  };

  // Preset fault injection scenarios
  const injectScenario = (type) => {
    if (!targetModule) return;

    if (type === 'OVERHEAT') {
      updateSimulatedTelemetry(targetModule.id, { temperature: 51.5 });
      logEvent('FAULT_INJECTION', `Thermal Spike Injected on ${targetModule.id}`, 'Simulated cell temp raised to 51.5°C to test thermal runaway response.', 'CRITICAL', targetModule.id);
    } else if (type === 'UNDER_VOLTAGE') {
      updateSimulatedTelemetry(targetModule.id, { voltage: 41.2 });
      logEvent('FAULT_INJECTION', `Under-Voltage Injected on ${targetModule.id}`, 'Simulated bus voltage dropped to 41.2V to verify deep discharge cutoff.', 'CRITICAL', targetModule.id);
    } else if (type === 'OVER_VOLTAGE') {
      updateSimulatedTelemetry(targetModule.id, { voltage: 54.2 });
      logEvent('FAULT_INJECTION', `Over-Voltage Injected on ${targetModule.id}`, 'Simulated voltage elevated to 54.2V to test overcharge cutoff.', 'CRITICAL', targetModule.id);
    } else if (type === 'DEGRADE_RED') {
      updateSimulatedTelemetry(targetModule.id, { health: 42 });
      logEvent('FAULT_INJECTION', `SOH Degradation Injected on ${targetModule.id}`, 'Simulated SOH dropped to 42% (Red Tier) to verify zero load quarantine.', 'WARNING', targetModule.id);
    } else if (type === 'NORMALIZE') {
      updateSimulatedTelemetry(targetModule.id, { voltage: 48.0, temperature: 28.0, health: 90, status: 'Active' });
      logEvent('FAULT_INJECTION', `Telemetry Normalized on ${targetModule.id}`, 'Simulated readings restored to 48.0V, 28°C, and 90% SOH.', 'INFO', targetModule.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Safety Diagnostics & Anomaly Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time threshold monitoring, abnormal condition flagging, fault simulation, and contactor interlock control.
          </p>
        </div>

        <button
          onClick={resetDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {/* Mandatory Safety Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 uppercase tracking-wide">Prototype Demonstration Notice:</span>{' '}
          <span>
            Simulated safety alerts and demonstration thresholds are designed for prototype evaluation and national sustainability competition demonstration only. <strong>Simulated software alerts do not replace certified hardware-level battery protection circuits, contactor weld detectors, or thermal runaway fire suppression systems.</strong>
          </span>
        </div>
      </div>

      {/* Safety Status Ticker */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        safetyAlerts.length > 0
          ? 'bg-rose-950/20 border-rose-500/40'
          : 'bg-emerald-950/20 border-emerald-500/40'
      }`}>
        <div className="flex items-center gap-3">
          {safetyAlerts.length > 0 ? (
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-white">
              {safetyAlerts.length > 0 
                ? `${safetyAlerts.length} Active Safety Hazard(s) Detected in Fleet`
                : 'All Second-Life Battery Modules Operating Within Thresholds'
              }
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {safetyAlerts.length > 0
                ? 'Automated isolation rules engaged. Inspect anomalous modules below.'
                : 'Voltages, cell temperatures, and health grading compliant with current demonstration rules.'
              }
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono self-end md:self-auto">
          Last Check: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Fault Injection & Telemetry Modifier */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Simulated Telemetry Stress & Fault Injector
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Interactive Testing
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select a module and adjust simulated sensor readings to demonstrate automatic anomaly detection and BMS interlocks.
            </p>

            {/* Target Module Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Simulated Module:
              </label>
              <div className="flex flex-wrap gap-2">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setTargetModId(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      targetModId === m.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-glow-emerald'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {m.id} ({m.health}%)
                  </button>
                ))}
              </div>
            </div>

            {targetModule && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono font-black text-white text-base">
                      {targetModule.id}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({targetModule.originalVehicle})
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                    targetModule.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>
                    Status: {targetModule.status}
                  </span>
                </div>

                {/* Voltage Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-sky-400" />
                      Simulated Bus Voltage (V):
                    </span>
                    <span className={`font-mono text-sm font-bold ${
                      targetModule.voltage < thresholds.voltageMinNormal || targetModule.voltage > thresholds.voltageMaxNormal
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}>
                      {targetModule.voltage} V
                    </span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="58"
                    step="0.5"
                    value={targetModule.voltage}
                    onChange={(e) => updateSimulatedTelemetry(targetModule.id, { voltage: e.target.value })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>36V (Under-voltage)</span>
                    <span className="text-slate-400">Normal Range: {thresholds.voltageMinNormal}V - {thresholds.voltageMaxNormal}V</span>
                    <span>58V (Over-voltage)</span>
                  </div>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Simulated Cell Temperature (°C):
                    </span>
                    <span className={`font-mono text-sm font-bold ${
                      targetModule.temperature >= thresholds.tempCritical
                        ? 'text-rose-400 animate-pulse'
                        : targetModule.temperature > thresholds.tempMaxNormal
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }`}>
                      {targetModule.temperature} °C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="0.5"
                    value={targetModule.temperature}
                    onChange={(e) => updateSimulatedTelemetry(targetModule.id, { temperature: e.target.value })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>15°C (Ambient)</span>
                    <span className="text-slate-400">Warning: &gt;{thresholds.tempMaxNormal}°C | Critical: &ge;{thresholds.tempCritical}°C</span>
                    <span>65°C (Thermal Runaway)</span>
                  </div>
                </div>

                {/* Health Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      State of Health SOH (%):
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {targetModule.health} %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={targetModule.health}
                    onChange={(e) => updateSimulatedTelemetry(targetModule.id, { health: e.target.value })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                    <span>10% (Red)</span>
                    <span className="text-slate-400">Yellow: {thresholds.yellowHealthMin}% | Green: &ge;{thresholds.greenHealthMin}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 1-Click Injection Presets */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    1-Click Hackathon Anomaly Demonstrations:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => injectScenario('OVERHEAT')}
                      className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-[11px] text-rose-300 font-medium text-left"
                    >
                      🔥 Thermal Spike (51.5°C)
                    </button>
                    <button
                      onClick={() => injectScenario('UNDER_VOLTAGE')}
                      className="p-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-[11px] text-rose-300 font-medium text-left"
                    >
                      ⚡ Under-Volt (41.2V)
                    </button>
                    <button
                      onClick={() => injectScenario('DEGRADE_RED')}
                      className="p-2 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 text-[11px] text-amber-300 font-medium text-left"
                    >
                      📉 Red SOH (42%)
                    </button>
                    <button
                      onClick={() => injectScenario('NORMALIZE')}
                      className="p-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-[11px] text-emerald-300 font-medium text-left"
                    >
                      ✅ Reset Safe Norm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Hazards & Interlock Feed */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Active Anomaly & Interlock Log ({safetyAlerts.length})
              </h2>
            </div>

            {safetyAlerts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">No Active Safety Anomalies</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try using the fault injector above to trigger a thermal spike or under-voltage cutoff.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {safetyAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border text-xs ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : 'bg-amber-950/30 border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {alert.severity === 'CRITICAL' ? (
                          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="font-bold text-white text-sm">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{alert.timestamp}</span>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                    </div>

                    <p className="mt-2 text-slate-300 text-xs leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="font-bold text-emerald-400 whitespace-nowrap">Suggested Inspection:</span>
                      <span>{alert.action}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-700/40">
                      <span className="text-[11px] font-mono text-slate-400">
                        Triggered reading: <strong className="text-white">{alert.value}</strong> (Rule: {alert.threshold})
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            updateSimulatedTelemetry(alert.moduleId, { voltage: 48.0, temperature: 28.0, health: 90, status: 'Active' });
                            logEvent('SAFETY_RESOLVE', `Condition Resolved on ${alert.moduleId}`, `Simulated readings normalized to 48.0V and 28°C; alert cleared.`, 'INFO', alert.moduleId);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                          title="Restore nominal voltage and temperature to resolve and clear this alert"
                        >
                          Resolve Condition
                        </button>
                        <button
                          onClick={() => isolateModule(alert.moduleId, `Interlock triggered by ${alert.title}`)}
                          className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-[11px]"
                        >
                          Isolate Contactor
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModuleId(alert.moduleId);
                            setActiveTab('passport');
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px]"
                        >
                          View Passport →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Configurable Demonstration Thresholds */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Configurable Demonstration Rules
                </h2>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 mb-4 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                These rules calibrate the software-defined safety thresholds for the hackathon MVP. Modify them to test boundary behaviors.
              </span>
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
              {/* Green Min SOH */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Green Health Tier Minimum (%):
                </label>
                <input
                  type="number"
                  min="60"
                  max="95"
                  value={localThresholds.greenHealthMin}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, greenHealthMin: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 80% (Modules &ge; this receive priority load)</span>
              </div>

              {/* Yellow Min SOH */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Yellow Health Tier Minimum (%):
                </label>
                <input
                  type="number"
                  min="30"
                  max="79"
                  value={localThresholds.yellowHealthMin}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, yellowHealthMin: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 50% (Below this is classified Red / Quarantined)</span>
              </div>

              {/* Voltage Min Normal */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Voltage Cutoff Minimum (Under-Voltage):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.voltageMinNormal}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, voltageMinNormal: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 44.0V</span>
              </div>

              {/* Voltage Max Normal */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Voltage Cutoff Maximum (Over-Voltage):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={localThresholds.voltageMaxNormal}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, voltageMaxNormal: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 52.0V</span>
              </div>

              {/* Temperature Max Normal */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Elevated Temperature Warning (°C):
                </label>
                <input
                  type="number"
                  step="1"
                  value={localThresholds.tempMaxNormal}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, tempMaxNormal: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 38.0°C</span>
              </div>

              {/* Temperature Critical Runaway */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Thermal Runaway Critical Cutoff (°C):
                </label>
                <input
                  type="number"
                  step="1"
                  value={localThresholds.tempCritical}
                  onChange={(e) => setLocalThresholds(prev => ({ ...prev, tempCritical: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500">Default: 45.0°C (Immediate emergency cutoff)</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const benchmark = {
                      greenHealthMin: 80,
                      yellowHealthMin: 50,
                      voltageMinNormal: 44.0,
                      voltageMaxNormal: 52.0,
                      tempMaxNormal: 38.0,
                      tempCritical: 45.0,
                    };
                    setLocalThresholds(benchmark);
                    updateThresholds(benchmark);
                  }}
                  className="text-slate-400 hover:text-white text-xs underline"
                >
                  Restore Benchmark Rules
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-glow-emerald transition-all"
                >
                  Save Rules
                </button>
              </div>

              {thresholdSavedNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-center font-semibold text-xs border border-emerald-500/40">
                  ✓ Safety threshold configuration updated!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

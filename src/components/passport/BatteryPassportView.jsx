import React, { useState } from 'react';
import { 
  FileBadge, 
  QrCode, 
  Car, 
  Leaf, 
  Activity, 
  Zap, 
  Thermometer, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Calendar, 
  Share2,
  Cpu,
  Power
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';
import { getHealthGrade } from '../../utils/bmsAlgorithm';
import { HealthGradeBadge, StatusBadge } from '../common/Badge';

export function BatteryPassportView() {
  const { 
    modules, 
    thresholds, 
    selectedModuleId, 
    setSelectedModuleId, 
    allocationResult,
    logEvent,
    isolateModule,
    reconnectModule
  } = useBattery();

  const [newEventText, setNewEventText] = useState('');
  const [newEventType, setNewEventType] = useState('MAINTENANCE');
  const [showEventForm, setShowEventForm] = useState(false);

  const activeModule = modules.find(m => m.id === selectedModuleId) || modules[0];

  if (!activeModule) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
        <FileBadge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Modules in Registry</h3>
        <p className="text-xs text-slate-400 mt-1">Please enroll a module first.</p>
      </div>
    );
  }

  const gradeInfo = getHealthGrade(activeModule.health, thresholds);
  const alloc = allocationResult.allocations[activeModule.id] || { watts: 0, pctOfDemand: 0 };
  const isRed = gradeInfo.grade === 'Red';
  const isIsolated = activeModule.status === 'Isolated';

  const handleAddPassportEvent = (e) => {
    e.preventDefault();
    if (!newEventText.trim()) return;

    logEvent(
      newEventType,
      `Passport Audit: ${newEventType}`,
      newEventText.trim(),
      newEventType === 'SAFETY' ? 'CRITICAL' : 'INFO',
      activeModule.id
    );

    setNewEventText('');
    setShowEventForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Module Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Digital Battery Passport (EU Circular Standard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable second-life battery pedigree, first-life provenance, degradation telemetry, and audit trail.
          </p>
        </div>

        {/* Module Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Passport:</label>
          <select
            value={activeModule.id}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — SOH {m.health}% ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Digital Passport Certificate Layout */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Top Passport Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <FileBadge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-mono text-white">
                  {activeModule.id}
                </span>
                <StatusBadge status={activeModule.status} />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Serial: {activeModule.serialNumber || 'SN-EV-99014-NL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HealthGradeBadge grade={gradeInfo.grade} size="lg" />
            {isIsolated ? (
              <button
                onClick={() => reconnectModule(activeModule.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/50"
              >
                Reconnect Contactor
              </button>
            ) : (
              <button
                onClick={() => isolateModule(activeModule.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium hover:text-rose-400"
              >
                Isolate Contactor
              </button>
            )}
          </div>
        </div>

        {/* Passport Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Section: First-Life Provenance + QR Code + Carbon Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left 8 cols: Provenance & Specs */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                First-Life Provenance & Original EV Specification
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Original Donor EV</span>
                  <span className="font-semibold text-white mt-0.5 block truncate">
                    {activeModule.originalVehicle || 'EV Fleet Repurposed'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Cell Chemistry</span>
                  <span className="font-semibold text-white mt-0.5 block truncate">
                    {activeModule.chemistry || 'LiNiMnCoO2 (NMC)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Date Repurposed</span>
                  <span className="font-mono text-white mt-0.5 block">
                    {activeModule.dateRepurposed || '2024-03-15'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">First-Life EV Cycles</span>
                  <span className="font-mono text-white mt-0.5 block">
                    {(activeModule.firstLifeCycles || 1400).toLocaleString()} cycles
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Internal Resistance</span>
                  <span className="font-mono text-white mt-0.5 block">
                    {activeModule.internalResistanceMOhms || 22.4} mΩ
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Repurposed Capacity</span>
                  <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                    {activeModule.capacityKwh} kWh
                  </span>
                </div>
              </div>

              {/* Sustainability Impact Metric */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300">Embodied Carbon Offset</h4>
                    <p className="text-[11px] text-slate-400">
                      Re-using this {activeModule.capacityKwh} kWh pack avoids ~{Math.round(activeModule.capacityKwh * 72)} kg CO₂e greenhouse emissions compared to newly mined lithium cells.
                    </p>
                  </div>
                </div>
                <span className="text-xl font-black font-mono text-emerald-400 ml-3 whitespace-nowrap">
                  +{Math.round(activeModule.capacityKwh * 72)} kg CO₂
                </span>
              </div>
            </div>

            {/* Right 4 cols: Passport QR & Dynamic Telemetry */}
            <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-between text-center">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  EU Circular Battery Passport QR
                </span>

                {/* SVG Visual QR Placeholder */}
                <div className="mt-3 p-3 bg-white rounded-xl inline-block shadow-lg">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="120" fill="white"/>
                    {/* Corners */}
                    <rect x="10" y="10" width="30" height="30" fill="black"/>
                    <rect x="15" y="15" width="20" height="20" fill="white"/>
                    <rect x="20" y="20" width="10" height="10" fill="black"/>

                    <rect x="80" y="10" width="30" height="30" fill="black"/>
                    <rect x="85" y="15" width="20" height="20" fill="white"/>
                    <rect x="90" y="20" width="10" height="10" fill="black"/>

                    <rect x="10" y="80" width="30" height="30" fill="black"/>
                    <rect x="15" y="85" width="20" height="20" fill="white"/>
                    <rect x="20" y="90" width="10" height="10" fill="black"/>

                    {/* Data Pattern */}
                    <rect x="50" y="15" width="6" height="6" fill="black"/>
                    <rect x="62" y="15" width="6" height="6" fill="black"/>
                    <rect x="50" y="27" width="6" height="6" fill="black"/>
                    <rect x="56" y="33" width="6" height="6" fill="black"/>
                    <rect x="15" y="50" width="6" height="6" fill="black"/>
                    <rect x="27" y="56" width="6" height="6" fill="black"/>
                    <rect x="50" y="50" width="20" height="20" fill="black"/>
                    <rect x="55" y="55" width="10" height="10" fill="white"/>
                    <rect x="80" y="50" width="6" height="6" fill="black"/>
                    <rect x="95" y="60" width="8" height="8" fill="black"/>
                    <rect x="50" y="85" width="8" height="8" fill="black"/>
                    <rect x="70" y="90" width="8" height="8" fill="black"/>
                    <rect x="90" y="85" width="15" height="15" fill="black"/>
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 block mt-2 font-mono">
                  URN:BAT-SEC-LIFE:{activeModule.id}
                </span>
              </div>

              <div className="w-full mt-3 pt-3 border-t border-slate-800 text-left text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Current Health:</span>
                  <span className="font-mono font-bold text-white">{activeModule.health}%</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Bus Voltage:</span>
                  <span className="font-mono font-bold text-white">{activeModule.voltage} V</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Cell Temp:</span>
                  <span className="font-mono font-bold text-white">{activeModule.temperature} °C</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Assigned Load:</span>
                  <span className="font-mono font-bold text-emerald-400">{alloc.watts} W</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event History & Audit Log Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Lifecycle Event History & Inspection Trail
                </h3>
              </div>

              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log Maintenance Event</span>
              </button>
            </div>

            {/* Add Event Form Modal/Drawer */}
            {showEventForm && (
              <form onSubmit={handleAddPassportEvent} className="p-4 mb-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-white">Record New Passport Event for {activeModule.id}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Event Category</label>
                    <select
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="MAINTENANCE">Maintenance Inspection</option>
                      <option value="CALIBRATION">Sensor Calibration</option>
                      <option value="SAFETY">Safety Interlock Audit</option>
                      <option value="DISPATCH">Dispatch Retune</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Inspection Notes / Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Cleaned terminal lugs, verified torque at 8.5 Nm, cell impedance nominal."
                      value={newEventText}
                      onChange={(e) => setNewEventText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                  >
                    Save to Passport
                  </button>
                </div>
              </form>
            )}

            {/* Timeline List */}
            {(!activeModule.eventHistory || activeModule.eventHistory.length === 0) ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
                No events recorded yet for this module.
              </div>
            ) : (
              <div className="space-y-3">
                {activeModule.eventHistory.map((evt, idx) => (
                  <div 
                    key={evt.id || idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        evt.severity === 'CRITICAL' 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : evt.severity === 'WARNING' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {evt.severity === 'CRITICAL' ? (
                          <XCircle className="w-4 h-4" />
                        ) : evt.severity === 'WARNING' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{evt.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {evt.type}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap self-end sm:self-auto">
                      {evt.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BatteryCharging, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Power, 
  ArrowRight, 
  Sliders, 
  Thermometer, 
  Zap, 
  Car,
  FileBadge
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';
import { getHealthGrade } from '../../utils/bmsAlgorithm';
import { HealthGradeBadge, StatusBadge } from '../common/Badge';
import { ModuleModal } from './ModuleModal';

export function ModuleRegistryView() {
  const { 
    modules, 
    thresholds, 
    allocationResult, 
    addModule, 
    updateModule, 
    deleteModule, 
    isolateModule, 
    reconnectModule,
    updateSimulatedTelemetry,
    setActiveTab, 
    setSelectedModuleId 
  } = useBattery();

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter modules
  const filteredModules = modules.filter(m => {
    const grade = getHealthGrade(m.health, thresholds).grade;
    const matchesSearch = m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.originalVehicle && m.originalVehicle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGrade = gradeFilter === 'ALL' || grade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleOpenAdd = () => {
    setModuleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mod) => {
    setModuleToEdit(mod);
    setIsModalOpen(true);
  };

  const handleSaveModule = (data) => {
    if (moduleToEdit) {
      updateModule(moduleToEdit.id, data);
    } else {
      addModule(data);
    }
  };

  const handleDelete = (id) => {
    deleteModule(id);
    setDeleteConfirmId(null);
  };

  const handleOpenPassport = (id) => {
    setSelectedModuleId(id);
    setActiveTab('passport');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Second-Life Battery Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Lifecycle tracking, real-time simulated parameters, and contactor isolation for repurposed EV packs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-glow-emerald transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Module</span>
        </button>
      </div>

      {/* Rules Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>BMS Allocation Rules:</strong> Green (&ge;{thresholds.greenHealthMin}%) prioritized; Yellow ({thresholds.yellowHealthMin}-{thresholds.greenHealthMin - 1}%) derated; Red (&lt;{thresholds.yellowHealthMin}%) quarantined.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {modules.length} modules configured in storage
        </span>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search module ID or donor vehicle (e.g. ECO-001, Nissan Leaf)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Grade Filter */}
        <div className="sm:col-span-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Health Grades</option>
            <option value="Green">Green Tier (≥80%)</option>
            <option value="Yellow">Yellow Tier (50-79%)</option>
            <option value="Red">Red Tier (&lt;50%)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active (Online)</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Isolated">Isolated (Safety Cutoff)</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
          <BatteryCharging className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Battery Modules Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No modules match your current search and filter parameters. Try clearing the filters or enroll a new module.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setGradeFilter('ALL'); setStatusFilter('ALL'); }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((m) => {
          const gradeInfo = getHealthGrade(m.health, thresholds);
          const alloc = allocationResult.allocations[m.id] || { watts: 0, pctOfDemand: 0 };
          const isRed = gradeInfo.grade === 'Red';
          const isIsolated = m.status === 'Isolated';

          return (
            <div
              key={m.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isRed || isIsolated
                  ? 'border-rose-900/40 bg-[#0B1020]/90'
                  : gradeInfo.grade === 'Green'
                    ? 'border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-glow-emerald'
                    : 'border-amber-900/40 hover:border-amber-500/50 hover:shadow-glow-amber'
              }`}
            >
              <div>
                {/* Card Top Row: ID, Badges & Action Menu */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-white">
                        {m.id}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="mt-1">
                      <HealthGradeBadge grade={gradeInfo.grade} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit module configuration"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Donor & Chemistry */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                  <Car className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {m.originalVehicle || 'EV Donor Pack'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto font-mono">
                    {m.chemistry?.split(' ')[0] || 'NMC'}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {/* SOH */}
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Health (SOH)</span>
                    <span className={`text-base font-bold font-mono ${
                      isRed ? 'text-rose-400' : gradeInfo.grade === 'Green' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {m.health}%
                    </span>
                  </div>

                  {/* Usable Capacity */}
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                    <span className="text-base font-bold font-mono text-white">
                      {m.capacityKwh} <span className="text-xs text-slate-400">kWh</span>
                    </span>
                  </div>

                  {/* Voltage */}
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Bus Voltage</span>
                    <span className="text-base font-bold font-mono text-white">
                      {m.voltage} <span className="text-xs text-slate-400">V</span>
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
                    <span className={`text-base font-bold font-mono ${
                      m.temperature >= thresholds.tempCritical 
                        ? 'text-rose-400 animate-pulse' 
                        : m.temperature > thresholds.tempMaxNormal 
                          ? 'text-amber-400' 
                          : 'text-white'
                    }`}>
                      {m.temperature} <span className="text-xs text-slate-400">°C</span>
                    </span>
                  </div>
                </div>

                {/* Live Allocated Load */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Allocated BMS Load:</span>
                    <span className="font-mono font-bold text-white">
                      {alloc.watts.toLocaleString()} W
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({alloc.pctOfDemand}% of demand)
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isRed ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, alloc.pctOfMaxPower || 0)}%` }}
                    />
                  </div>

                  {isRed && (
                    <span className="text-[10px] text-rose-400 mt-1 block">
                      ⚠ Red tier safety interlock: Zero load allocated
                    </span>
                  )}
                  {isIsolated && !isRed && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      ⚠ Contactor open: Isolated from bus
                    </span>
                  )}
                </div>

                {/* Quick Simulated Telemetry Sliders */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-emerald-400" />
                      Simulate Sensor Shift
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Real-time update</span>
                  </div>

                  {/* Health Slider */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-[10px] text-slate-400 font-mono">SOH:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                      value={m.health}
                      onChange={(e) => updateSimulatedTelemetry(m.id, { health: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      title="Adjust State of Health to test dynamic grading (Green >= 80%, Yellow 50-79%, Red < 50%)"
                    />
                    <span className="w-10 text-right text-[11px] font-mono text-slate-200">{m.health}%</span>
                  </div>

                  {/* Voltage Slider */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-[10px] text-slate-400 font-mono">Volt:</span>
                    <input
                      type="range"
                      min="38"
                      max="56"
                      step="0.5"
                      value={m.voltage}
                      onChange={(e) => updateSimulatedTelemetry(m.id, { voltage: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="w-10 text-right text-[11px] font-mono text-slate-200">{m.voltage}V</span>
                  </div>

                  {/* Temp Slider */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-[10px] text-slate-400 font-mono">Temp:</span>
                    <input
                      type="range"
                      min="15"
                      max="55"
                      step="0.5"
                      value={m.temperature}
                      onChange={(e) => updateSimulatedTelemetry(m.id, { temperature: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="w-10 text-right text-[11px] font-mono text-slate-200">{m.temperature}°C</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {/* Contactor Isolate / Reconnect */}
                {isIsolated ? (
                  <button
                    onClick={() => reconnectModule(m.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-[11px] font-semibold transition-colors"
                  >
                    <Power className="w-3 h-3" />
                    <span>Reconnect Contactor</span>
                  </button>
                ) : (
                  <button
                    onClick={() => isolateModule(m.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-[11px] font-medium transition-colors"
                  >
                    <Power className="w-3 h-3" />
                    <span>Isolate</span>
                  </button>
                )}

                {/* Inspect Digital Passport */}
                <button
                  onClick={() => handleOpenPassport(m.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FileBadge className="w-3.5 h-3.5" />
                  <span>Passport</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Delete Confirmation Modal Overlay */}
              {deleteConfirmId === m.id && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-xs">
                  <p className="font-semibold text-rose-200">Decommission {m.id}?</p>
                  <p className="text-[11px] text-rose-300/80 mt-0.5">
                    This permanently removes the module from EcoVault simulation.
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[11px]"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <ModuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModule}
        moduleToEdit={moduleToEdit}
        existingIds={modules.map(m => m.id)}
      />
    </div>
  );
}

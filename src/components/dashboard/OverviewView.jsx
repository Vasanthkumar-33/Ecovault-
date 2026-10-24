import React from 'react';
import { 
  BatteryCharging, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  Sun, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useBattery } from '../../context/BatteryContext';
import { StatCard, Card } from '../common/Card';
import { HealthGradeBadge, SeverityBadge } from '../common/Badge';

export function OverviewView({ onStartDemo }) {
  const { 
    modules, 
    metrics, 
    simulation, 
    allocationResult, 
    safetyAlerts, 
    systemEvents, 
    setActiveTab, 
    setSelectedModuleId 
  } = useBattery();

  // Pie chart data: health distribution
  const healthDistributionData = [
    { name: 'Green (≥80%)', count: metrics.greenCount, color: '#10b981' },
    { name: 'Yellow (50-79%)', count: metrics.yellowCount, color: '#f59e0b' },
    { name: 'Red (<50%)', count: metrics.redCount, color: '#ef4444' },
  ].filter(d => d.count > 0);

  // Bar chart data: energy allocation per module
  const allocationBarData = modules.map(m => {
    const alloc = allocationResult.allocations[m.id] || { watts: 0, pctOfDemand: 0 };
    const maxP = Number(m.maxPowerWatts) || 2000;
    return {
      id: m.id,
      health: m.health,
      allocatedWatts: alloc.watts,
      maxPowerWatts: maxP,
      status: m.status,
      grade: alloc.grade
    };
  });

  const handleOpenPassport = (moduleId) => {
    setSelectedModuleId(moduleId);
    setActiveTab('passport');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            System Overview & Fleet Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time second-life energy orchestration, health-aware dynamic dispatch, and thermal interlocks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-emerald transition-all"
            >
              <span>Guided Demo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('bms')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch BMS Dispatch</span>
          </button>
        </div>
      </div>

      {/* 6 Primary Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Battery Modules */}
        <StatCard
          title="Battery Modules"
          value={metrics.totalModules}
          unit="Packs"
          subtext={`${metrics.greenCount}G • ${metrics.yellowCount}Y • ${metrics.redCount}R`}
          icon={BatteryCharging}
          color="emerald"
        />

        {/* 2. Available Battery Energy (kWh) */}
        <StatCard
          title="Available Energy"
          value={metrics.totalAvailableEnergyKwh}
          unit="kWh"
          subtext={`Total fleet: ${metrics.totalCapacityKwh} kWh`}
          icon={Zap}
          color="blue"
        />

        {/* 3. Current Load Demand (W) */}
        <StatCard
          title="Load Demand"
          value={simulation.loadDemandWatts.toLocaleString()}
          unit="W"
          subtext="Simulated facility target"
          icon={Activity}
          color="amber"
        />

        {/* 4. Total Allocated Load (W) */}
        <StatCard
          title="Allocated Load"
          value={allocationResult.totalAllocatedWatts.toLocaleString()}
          unit="W"
          subtext={`${allocationResult.eligibleCount} active packs dispatching`}
          icon={Cpu}
          color="emerald"
        />

        {/* 5. Unmet Demand (W) */}
        <StatCard
          title="Unmet Demand"
          value={allocationResult.unmetDemandWatts.toLocaleString()}
          unit="W"
          subtext={allocationResult.isOverloaded ? "Deficit requires grid backup" : "100% covered by 2nd-life"}
          icon={AlertTriangle}
          color={allocationResult.isOverloaded ? "rose" : "emerald"}
        />

        {/* 6. Active Safety Alerts */}
        <StatCard
          title="Safety Alerts"
          value={metrics.totalAlertsCount}
          unit="Active"
          subtext={`${metrics.criticalAlertsCount} Crit • ${metrics.warningAlertsCount} Warn`}
          icon={ShieldAlert}
          color={metrics.criticalAlertsCount > 0 ? "rose" : metrics.warningAlertsCount > 0 ? "amber" : "emerald"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Energy Allocation by Module */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Live Dynamic Load Allocation
              </h2>
              <p className="text-xs text-slate-400">
                Deterministic dispatch: Green modules take priority; Yellow derated; Red receives 0W.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bms')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              Adjust Load <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="id" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false}
                  unit="W"
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0B132B', 
                    borderColor: '#1e293b', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(val, name) => [
                    `${val} W`, 
                    name === 'allocatedWatts' ? 'Allocated Load' : 'Max Rated Capacity'
                  ]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => value === 'allocatedWatts' ? 'Allocated Load (W)' : 'Max Cap (W)'}
                />
                <Bar 
                  dataKey="allocatedWatts" 
                  name="allocatedWatts" 
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                />
                <Bar 
                  dataKey="maxPowerWatts" 
                  name="maxPowerWatts" 
                  fill="#1e293b" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overload banner if active */}
          {allocationResult.isOverloaded && (
            <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Demand Exceeds Second-Life Capacity!</strong> Deficit of {allocationResult.unmetDemandWatts.toLocaleString()} W must be covered by Grid or Solar.
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('solar')}
                className="underline text-rose-300 font-semibold"
              >
                View Microgrid Balance
              </button>
            </div>
          )}
        </div>

        {/* Right Chart: Battery Health Distribution */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Health Grading Distribution
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {metrics.totalModules} Units Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Grading criteria: Green (≥80%), Yellow (50-79%), Red (&lt;50%).
            </p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {healthDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B132B" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0B132B', 
                      borderColor: '#1e293b', 
                      borderRadius: '8px', 
                      fontSize: '12px' 
                    }}
                    formatter={(val, name) => [`${val} modules`, name]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-bold block">{metrics.greenCount}</span>
              <span className="text-[10px] text-slate-400">Green Tier</span>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 font-bold block">{metrics.yellowCount}</span>
              <span className="text-[10px] text-slate-400">Yellow Tier</span>
            </div>
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 font-bold block">{metrics.redCount}</span>
              <span className="text-[10px] text-slate-400">Red Quarantined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Safety Alerts & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Safety Alerts */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Active Safety Diagnostics
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('safety')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Safety Center →
            </button>
          </div>

          {safetyAlerts.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-emerald-950/20 border border-emerald-800/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-300">All Modules Operating Nominally</p>
              <p className="text-xs text-slate-400 mt-1">
                No simulated under-voltage, thermal runaway or isolation alerts triggered.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {safetyAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {alert.severity === 'CRITICAL' ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {alert.title}
                    </span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Action: {alert.action}</span>
                    <button
                      onClick={() => handleOpenPassport(alert.moduleId)}
                      className="text-emerald-400 hover:underline font-mono"
                    >
                      {alert.moduleId} Passport
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent System Events */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Live System Audit Trail
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Last {systemEvents.slice(0, 5).length} events
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {systemEvents.slice(0, 5).map(evt => (
              <div 
                key={evt.id} 
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {evt.title}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {evt.timestamp.split(' ')[1] || evt.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {evt.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

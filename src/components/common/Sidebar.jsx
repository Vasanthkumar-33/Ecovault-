import React from 'react';
import { 
  LayoutDashboard, 
  BatteryCharging, 
  Cpu, 
  ShieldAlert, 
  SunMedium, 
  FileBadge, 
  Leaf,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'modules', label: 'Battery Modules', icon: BatteryCharging, badgeKey: 'totalModules' },
  { id: 'bms', label: 'Adaptive BMS', icon: Cpu, badge: 'Live' },
  { id: 'safety', label: 'Safety Center', icon: ShieldAlert, badgeKey: 'criticalAlertsCount' },
  { id: 'solar', label: 'Solar & Load Sim', icon: SunMedium, badge: null },
  { id: 'passport', label: 'Battery Passports', icon: FileBadge, badge: null },
  { id: 'impact', label: 'Innovation & Impact', icon: Leaf, badge: 'Pillars' },
];

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { activeTab, setActiveTab, metrics } = useBattery();

  const handleNav = (id) => {
    setActiveTab(id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Nav Links */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 px-3">
            Core Modules
          </span>
          <nav className="mt-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              let badgeVal = null;
              if (item.badgeKey) {
                badgeVal = metrics[item.badgeKey];
              } else if (item.badge) {
                badgeVal = item.badge;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {badgeVal !== null && badgeVal !== undefined && (
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeKey === 'criticalAlertsCount' && badgeVal > 0
                        ? 'bg-rose-500 text-white font-bold animate-pulse'
                        : isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {badgeVal}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Health Fleet Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2 font-medium">
            <span>Fleet Health Tier</span>
            <span className="font-mono text-slate-200">{metrics.totalModules} modules</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-1.5">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{metrics.greenCount}</span>
              </div>
              <span className="text-[10px] text-slate-400">Green</span>
            </div>

            <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-1.5">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>{metrics.yellowCount}</span>
              </div>
              <span className="text-[10px] text-slate-400">Yellow</span>
            </div>

            <div className="bg-rose-950/40 border border-rose-800/40 rounded-lg p-1.5">
              <div className="flex items-center justify-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-3 h-3" />
                <span>{metrics.redCount}</span>
              </div>
              <span className="text-[10px] text-slate-400">Red</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sustainability Impact Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span>Circular Impact</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Repurposing EV packs offsets ~72 kg CO₂e / kWh vs new cell fabrication.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Avoided CO₂:</span>
          <span className="font-mono font-bold text-emerald-300">
            {Math.round(metrics.totalCapacityKwh * 72).toLocaleString()} kg
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 p-4 border-r border-slate-800/80 bg-[#070D1E]/60 backdrop-blur-md min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 bottom-0 w-72 bg-[#0B132B] p-4 border-r border-slate-800 z-50 overflow-y-auto">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  ShieldAlert, 
  BatteryCharging, 
  Activity, 
  Menu, 
  X,
  AlertTriangle,
  Info,
  Play
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';

export function Header({ mobileMenuOpen, setMobileMenuOpen, onStartDemo }) {
  const { 
    metrics, 
    safetyAlerts, 
    resetDemo, 
    setActiveTab, 
    simulation 
  } = useBattery();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleReset = () => {
    resetDemo();
    setShowResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070D1E]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Prototype Sustainability Hackathon Banner */}
      {showDisclaimer && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-sky-950/80 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">NATIONAL SUSTAINABILITY HACKATHON MVP:</span>
            <span className="text-slate-300 hidden sm:inline">
              Simulated second-life battery telemetry & deterministic health-prioritized BMS allocation.
            </span>
            <span className="text-slate-400 text-[11px] bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
              Prototype Rules Only
            </span>
          </div>
          <button 
            onClick={() => setShowDisclaimer(false)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <Zap className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">
                  ECO<span className="text-emerald-400">VAULT</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  2nd-Life BMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none hidden sm:block">
                Intelligent Second-Life Battery Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Guided Demo Button */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald transition-all"
            title="Launch interactive step-by-step guided hackathon judge demonstration"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span className="hidden xs:inline">Start Demo</span>
          </button>

          {/* Telemetry Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Demand:</span>
            <span className="font-mono font-semibold text-white">
              {simulation.loadDemandWatts.toLocaleString()} W
            </span>
          </div>

          {/* Safety Alert Badge button */}
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              metrics.criticalAlertsCount > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                : metrics.warningAlertsCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Alerts</span>
            {metrics.totalAlertsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                metrics.criticalAlertsCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {metrics.totalAlertsCount}
              </span>
            )}
          </button>

          {/* Reset Demo Button */}
          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-medium transition-all"
              title="Reset all modules, loads, and thresholds to pristine demonstration state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Quick Confirm Popup */}
            {showResetConfirm && (
              <div className="absolute right-0 top-full mt-2 w-72 p-4 glass-panel rounded-xl border border-slate-700 shadow-2xl z-50">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Reset Demo Dataset?</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Restores ECO-001, ECO-002, ECO-003, benchmark health thresholds, and simulation loads.
                    </p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  BatteryCharging, 
  Cpu, 
  ShieldAlert, 
  FileBadge,
  Layers
} from 'lucide-react';
import { useBattery } from '../../context/BatteryContext';

const DEMO_STEPS = [
  {
    step: 1,
    title: '1. Introduce the 3 Second-Life Battery Packs',
    tab: 'modules',
    badge: 'Module Registry',
    icon: BatteryCharging,
    description: 'EcoVault enrolls retired EV battery packs. Notice our 3 benchmark modules from real EVs: ECO-001 (Nissan Leaf 2019, 92% SOH), ECO-002 (Tesla Model S 2017, 68% SOH), and ECO-003 (Renault Zoe 2016, 35% SOH).',
    actionText: 'Inspecting benchmark packs in the registry...'
  },
  {
    step: 2,
    title: '2. Battery Health Grading (Green, Yellow, Red)',
    tab: 'modules',
    badge: 'Health Grading Rules',
    icon: Layers,
    description: 'Packs are transparently graded by State of Health: Green (≥80%) for peak dispatch, Yellow (50-79%) for derated support, and Red (<50%) for safety quarantine. Notice ECO-003 is automatically marked "Isolated" and barred from the DC bus.',
    actionText: 'Reviewing grading criteria...'
  },
  {
    step: 3,
    title: '3. Deterministic Health-Aware Load Allocation',
    tab: 'bms',
    badge: 'Adaptive BMS',
    icon: Cpu,
    targetDemand: 4200,
    description: 'We set load demand to 4,200W. Watch the mathematical dispatch: ECO-001 (Green) takes priority share (~2,800W); ECO-002 (Yellow) receives a derated smaller share (~1,400W); and ECO-003 (Red) receives strictly 0W!',
    actionText: 'Applying 4,200W simulated load...'
  },
  {
    step: 4,
    title: '4. Simulated Safety Hazard & Thermal Anomaly Interlock',
    tab: 'safety',
    badge: 'Safety Diagnostics',
    icon: ShieldAlert,
    triggerFault: 'OVERHEAT',
    description: 'We simulate an abnormal cell temperature spike (51.5°C) on ECO-001. An instant Critical Safety Alert is generated with root cause and recommended inspection action. Red contactor isolation is immediately available.',
    actionText: 'Injecting simulated 51.5°C thermal spike...'
  },
  {
    step: 5,
    title: '5. Digital Battery Passport & Lifecycle Traceability',
    tab: 'passport',
    badge: 'EU Circular Passport',
    icon: FileBadge,
    normalizeFirst: true,
    description: 'We switch to ECO-001’s Digital Battery Passport. All simulated thermal spikes, health changes, and maintenance actions are permanently recorded with timestamps in its immutable lifecycle audit trail.',
    actionText: 'Displaying digital passport & audit log...'
  }
];

export function GuidedDemoModal({ isOpen, onClose }) {
  const { 
    setActiveTab, 
    setSelectedModuleId, 
    setSimulationDemand, 
    updateSimulatedTelemetry, 
    logEvent 
  } = useBattery();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const stepData = DEMO_STEPS[currentStepIndex];

  // Execute actual state updates when step changes
  useEffect(() => {
    if (!isOpen) return;

    const s = DEMO_STEPS[currentStepIndex];
    if (s.tab) setActiveTab(s.tab);

    if (s.step === 1) {
      setSelectedModuleId('ECO-001');
    } else if (s.step === 3 && s.targetDemand) {
      setSimulationDemand(s.targetDemand);
    } else if (s.step === 4) {
      updateSimulatedTelemetry('ECO-001', { temperature: 51.5 });
      logEvent(
        'FAULT_INJECTION',
        'Demo Thermal Spike: ECO-001',
        'Simulated cell temp raised to 51.5°C during guided judge demonstration.',
        'CRITICAL',
        'ECO-001'
      );
    } else if (s.step === 5) {
      setSelectedModuleId('ECO-001');
      // Normalize readings so the passport reflects clean resolution
      updateSimulatedTelemetry('ECO-001', { temperature: 28.0, voltage: 48.0, health: 92, status: 'Active' });
      logEvent(
        'MAINTENANCE',
        'Demo Inspection Audit: ECO-001',
        'Verified thermal dissipation and returned module to active operational status.',
        'INFO',
        'ECO-001'
      );
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Finished demo
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const Icon = stepData.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="glass-panel rounded-2xl border-2 border-emerald-500/60 shadow-2xl bg-[#090F24]/95 p-5 backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  {stepData.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {stepData.step} of {DEMO_STEPS.length}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mt-0.5">
                {stepData.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="py-3.5 text-xs text-slate-300 leading-relaxed">
          {stepData.description}
        </div>

        {/* Bottom Navigation Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Exit Guided Demo
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow-emerald transition-all"
            >
              <span>{currentStepIndex === DEMO_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

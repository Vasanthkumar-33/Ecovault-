import React, { useState } from 'react';
import { BatteryProvider, useBattery } from './context/BatteryContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { ModuleRegistryView } from './components/modules/ModuleRegistryView';
import { AdaptiveBMSView } from './components/bms/AdaptiveBMSView';
import { SafetyCenterView } from './components/safety/SafetyCenterView';
import { SolarSimulatorView } from './components/solar/SolarSimulatorView';
import { BatteryPassportView } from './components/passport/BatteryPassportView';
import { InnovationImpactView } from './components/impact/InnovationImpactView';
import { GuidedDemoModal } from './components/demo/GuidedDemoModal';
import { ShieldCheck, Leaf, Cpu } from 'lucide-react';

function MainContent() {
  const { activeTab } = useBattery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView onStartDemo={() => setIsDemoOpen(true)} />;
      case 'modules':
        return <ModuleRegistryView />;
      case 'bms':
        return <AdaptiveBMSView />;
      case 'safety':
        return <SafetyCenterView />;
      case 'solar':
        return <SolarSimulatorView />;
      case 'passport':
        return <BatteryPassportView />;
      case 'impact':
        return <InnovationImpactView />;
      default:
        return <OverviewView onStartDemo={() => setIsDemoOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060B18] text-slate-100">
      {/* Top Header with Guided Demo trigger */}
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        onStartDemo={() => setIsDemoOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Guided Judge Demonstration Flow Overlay */}
      <GuidedDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />

      {/* Technical Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060B18]/90 py-5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">ECOVAULT</span>
            <span className="text-slate-400">•</span>
            <span>Intelligent Second-Life Battery Management System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Leaf className="w-3.5 h-3.5" />
              Circular Clean Tech MVP
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              100% Local Deterministic Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BatteryProvider>
      <MainContent />
    </BatteryProvider>
  );
}

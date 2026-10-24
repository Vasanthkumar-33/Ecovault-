import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_MODULES, 
  INITIAL_THRESHOLDS, 
  INITIAL_SIMULATION, 
  INITIAL_SYSTEM_EVENTS 
} from '../data/initialData';
import { 
  calculateLoadAllocation, 
  evaluateSafetyAlerts, 
  calculateEnergyBalance,
  getHealthGrade 
} from '../utils/bmsAlgorithm';

const BatteryContext = createContext(null);

const STORAGE_KEYS = {
  MODULES: 'ecovault_modules_v1',
  THRESHOLDS: 'ecovault_thresholds_v1',
  SIMULATION: 'ecovault_simulation_v1',
  EVENTS: 'ecovault_events_v1',
};

export function BatteryProvider({ children }) {
  // 1. Modules State
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODULES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved modules:', e);
    }
    return INITIAL_MODULES;
  });

  // 2. Demonstration Thresholds State
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved thresholds:', e);
    }
    return INITIAL_THRESHOLDS;
  });

  // 3. Simulation Parameters (Load Demand & Solar Input)
  const [simulation, setSimulation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMULATION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved simulation settings:', e);
    }
    return INITIAL_SIMULATION;
  });

  // 4. System Event History
  const [systemEvents, setSystemEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved events:', e);
    }
    return INITIAL_SYSTEM_EVENTS;
  });

  // 5. Active View & Selected Module for Passport
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModuleId, setSelectedModuleId] = useState('ECO-001');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    } catch (e) {
      console.error('LocalStorage write error for modules:', e);
    }
  }, [modules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
    } catch (e) {
      console.error('LocalStorage write error for thresholds:', e);
    }
  }, [thresholds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATION, JSON.stringify(simulation));
    } catch (e) {
      console.error('LocalStorage write error for simulation:', e);
    }
  }, [simulation]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(systemEvents));
    } catch (e) {
      console.error('LocalStorage write error for events:', e);
    }
  }, [systemEvents]);

  // Record an event
  const logEvent = (category, title, details, level = 'INFO', targetModuleId = null) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      category,
      title,
      details,
      level,
      moduleId: targetModuleId
    };

    setSystemEvents(prev => [newEvent, ...prev.slice(0, 49)]);

    if (targetModuleId) {
      setModules(prev => prev.map(m => {
        if (m.id === targetModuleId) {
          const modEvent = {
            id: newEvent.id,
            timestamp,
            type: category,
            title,
            description: details,
            severity: level
          };
          return {
            ...m,
            eventHistory: [modEvent, ...(m.eventHistory || [])].slice(0, 20)
          };
        }
        return m;
      }));
    }
  };

  // Add Module
  const addModule = (newMod) => {
    const formatted = {
      ...newMod,
      id: newMod.id.trim().toUpperCase(),
      health: Number(newMod.health),
      voltage: Number(newMod.voltage),
      temperature: Number(newMod.temperature),
      capacityKwh: Number(newMod.capacityKwh),
      maxPowerWatts: Number(newMod.maxPowerWatts || Math.round(newMod.capacityKwh * 550)),
      status: newMod.status || 'Active',
      manufactureYear: Number(newMod.manufactureYear) || 2018,
      firstLifeCycles: Number(newMod.firstLifeCycles) || 1200,
      secondLifeCycles: 0,
      internalResistanceMOhms: Number(newMod.internalResistanceMOhms) || 22.0,
      dateRepurposed: newMod.dateRepurposed || new Date().toISOString().substring(0, 10),
      serialNumber: newMod.serialNumber || `SN-EV-${Math.floor(10000 + Math.random() * 90000)}`,
      carbonOffsetKg: Math.round(Number(newMod.capacityKwh) * 72),
      eventHistory: [
        {
          id: `evt-init-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'ENROLLMENT',
          title: 'Module Registered into EcoVault',
          description: `Initial SOH: ${newMod.health}%, Voltage: ${newMod.voltage}V, Capacity: ${newMod.capacityKwh} kWh.`,
          severity: 'INFO'
        }
      ]
    };

    setModules(prev => [...prev, formatted]);
    logEvent(
      'MODULE_REGISTRY',
      `New Module Enrolled: ${formatted.id}`,
      `Added second-life module with ${formatted.health}% SOH from ${formatted.originalVehicle || 'EV fleet'}.`,
      'INFO',
      formatted.id
    );
  };

  // Update Module
  const updateModule = (id, fields) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...fields };
        return updated;
      }
      return m;
    }));

    logEvent(
      'CONFIG_CHANGE',
      `Module Updated: ${id}`,
      `Modified attributes: ${Object.keys(fields).join(', ')}.`,
      'INFO',
      id
    );
  };

  // Delete Module
  const deleteModule = (id) => {
    setModules(prev => prev.filter(m => m.id !== id));
    logEvent('MODULE_REGISTRY', `Module Removed: ${id}`, `Decommissioned from EcoVault registry.`, 'WARNING');
    if (selectedModuleId === id) {
      setSelectedModuleId(modules.find(m => m.id !== id)?.id || '');
    }
  };

  // Update Simulated Telemetry (Voltage & Temperature sliders)
  const updateSimulatedTelemetry = (id, readings) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          voltage: readings.voltage !== undefined ? Math.max(0, Number(readings.voltage) || 0) : m.voltage,
          temperature: readings.temperature !== undefined ? (Number(readings.temperature) || 0) : m.temperature,
          health: readings.health !== undefined ? Math.min(100, Math.max(0, Number(readings.health) || 0)) : m.health,
          status: readings.status !== undefined ? readings.status : m.status,
        };
        return updated;
      }
      return m;
    }));

    // Check for abnormal changes
    const changes = [];
    if (readings.voltage !== undefined) changes.push(`voltage: ${readings.voltage}V`);
    if (readings.temperature !== undefined) changes.push(`temp: ${readings.temperature}°C`);
    if (readings.health !== undefined) changes.push(`SOH: ${readings.health}%`);

    logEvent(
      'TELEMETRY_CHANGE',
      `Simulated Telemetry Shift on ${id}`,
      `Adjusted ${changes.join(', ')}.`,
      'INFO',
      id
    );
  };

  // Isolate module (safety interlock)
  const isolateModule = (id, reason = 'Operator / BMS safety interlock triggered') => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'Isolated' };
      }
      return m;
    }));
    logEvent('SAFETY_INTERLOCK', `Emergency Contactor Disconnect: ${id}`, reason, 'CRITICAL', id);
  };

  // Reconnect module
  const reconnectModule = (id) => {
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: 'Active' };
      }
      return m;
    }));
    logEvent('SAFETY_INTERLOCK', `Contactor Closed: ${id}`, 'Manual override: module re-admitted to active DC bus.', 'INFO', id);
  };

  // Update Thresholds
  const updateThresholds = (newThresholds) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
    logEvent('SAFETY_CONFIG', 'Safety Threshold Rules Updated', 'Adjusted demonstration parameters.', 'INFO');
  };

  // Simulation controls
  const setSimulationDemand = (loadDemandWatts) => {
    setSimulation(prev => ({ ...prev, loadDemandWatts: Number(loadDemandWatts) }));
  };

  const setSimulationSolar = (solarGenerationWatts) => {
    setSimulation(prev => ({ ...prev, solarGenerationWatts: Number(solarGenerationWatts) }));
  };

  // Reset Demo to pristine initial state
  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.MODULES);
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
    localStorage.removeItem(STORAGE_KEYS.SIMULATION);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);

    setModules(INITIAL_MODULES);
    setThresholds(INITIAL_THRESHOLDS);
    setSimulation(INITIAL_SIMULATION);
    setSystemEvents(INITIAL_SYSTEM_EVENTS);
    setSelectedModuleId('ECO-001');
    setActiveTab('overview');

    logEvent('SYSTEM_RESET', 'Demo State Restored', 'All simulated battery modules and parameters reset to benchmark values.', 'INFO');
  };

  // Derived Calculations
  const allocationResult = useMemo(() => {
    return calculateLoadAllocation(modules, simulation.loadDemandWatts, thresholds);
  }, [modules, simulation.loadDemandWatts, thresholds]);

  const safetyAlerts = useMemo(() => {
    return evaluateSafetyAlerts(modules, thresholds);
  }, [modules, thresholds]);

  const energyBalance = useMemo(() => {
    return calculateEnergyBalance(
      simulation.solarGenerationWatts,
      simulation.loadDemandWatts,
      allocationResult.totalAllocatedWatts
    );
  }, [simulation.solarGenerationWatts, simulation.loadDemandWatts, allocationResult.totalAllocatedWatts]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let green = 0;
    let yellow = 0;
    let red = 0;
    let availableCapacity = 0;
    let totalCapacity = 0;

    modules.forEach(m => {
      totalCapacity += Number(m.capacityKwh) || 0;
      const grade = getHealthGrade(m.health, thresholds).grade;
      if (grade === 'Green') green++;
      else if (grade === 'Yellow') yellow++;
      else red++;

      // Red and non-active modules do not contribute to available energy
      if (m.status === 'Active' && grade !== 'Red') {
        availableCapacity += Number(m.capacityKwh) || 0;
      }
    });

    return {
      totalModules: modules.length,
      greenCount: green,
      yellowCount: yellow,
      redCount: red,
      totalAvailableEnergyKwh: Number(availableCapacity.toFixed(1)),
      totalCapacityKwh: Number(totalCapacity.toFixed(1)),
      criticalAlertsCount: safetyAlerts.filter(a => a.severity === 'CRITICAL').length,
      warningAlertsCount: safetyAlerts.filter(a => a.severity === 'WARNING').length,
      totalAlertsCount: safetyAlerts.length,
    };
  }, [modules, thresholds, safetyAlerts]);

  // Current selected module object
  const selectedModule = useMemo(() => {
    return modules.find(m => m.id === selectedModuleId) || modules[0] || null;
  }, [modules, selectedModuleId]);

  return (
    <BatteryContext.Provider
      value={{
        modules,
        thresholds,
        simulation,
        systemEvents,
        activeTab,
        selectedModuleId,
        selectedModule,
        allocationResult,
        safetyAlerts,
        energyBalance,
        metrics,
        setActiveTab,
        setSelectedModuleId,
        addModule,
        updateModule,
        deleteModule,
        updateSimulatedTelemetry,
        isolateModule,
        reconnectModule,
        updateThresholds,
        setSimulationDemand,
        setSimulationSolar,
        logEvent,
        resetDemo
      }}
    >
      {children}
    </BatteryContext.Provider>
  );
}

export function useBattery() {
  const context = useContext(BatteryContext);
  if (!context) {
    throw new Error('useBattery must be used within a BatteryProvider');
  }
  return context;
}

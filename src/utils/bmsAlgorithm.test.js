import { describe, it, expect } from 'vitest';
import { 
  getHealthGrade, 
  calculateLoadAllocation, 
  evaluateSafetyAlerts, 
  calculateEnergyBalance 
} from './bmsAlgorithm';
import { INITIAL_MODULES, INITIAL_THRESHOLDS } from '../data/initialData';

describe('EcoVault BMS Verification Suite', () => {
  const defaultThresholds = {
    greenHealthMin: 80,
    yellowHealthMin: 50,
    voltageMinNormal: 44.0,
    voltageMaxNormal: 52.0,
    tempMaxNormal: 38.0,
    tempCritical: 45.0
  };

  // Section 2: Exact Battery Health Grading Boundaries
  describe('Battery Health Grading Boundary Verification', () => {
    it('100% must be Green', () => {
      expect(getHealthGrade(100, defaultThresholds).grade).toBe('Green');
    });

    it('80% must be Green (inclusive lower boundary for Green)', () => {
      expect(getHealthGrade(80, defaultThresholds).grade).toBe('Green');
    });

    it('79% must be Yellow (upper boundary for Yellow)', () => {
      expect(getHealthGrade(79, defaultThresholds).grade).toBe('Yellow');
    });

    it('50% must be Yellow (inclusive lower boundary for Yellow)', () => {
      expect(getHealthGrade(50, defaultThresholds).grade).toBe('Yellow');
    });

    it('49% must be Red (upper boundary for Red)', () => {
      expect(getHealthGrade(49, defaultThresholds).grade).toBe('Red');
    });

    it('0% must be Red (extreme low boundary)', () => {
      expect(getHealthGrade(0, defaultThresholds).grade).toBe('Red');
    });
  });

  // Section 2: Load Allocation Boundary Verification
  describe('Load Allocation Boundary Verification', () => {
    const testModules = [
      { id: 'ECO-001', health: 92, status: 'Active', capacityKwh: 5.2, maxPowerWatts: 3000 },
      { id: 'ECO-002', health: 68, status: 'Active', capacityKwh: 4.5, maxPowerWatts: 2400 },
      { id: 'ECO-003', health: 35, status: 'Active', capacityKwh: 3.2, maxPowerWatts: 1600 } // Red (SOH 35%)
    ];

    it('Red modules must receive zero load', () => {
      const result = calculateLoadAllocation(testModules, 4000, defaultThresholds);
      expect(result.allocations['ECO-003'].watts).toBe(0);
      expect(result.allocations['ECO-003'].pctOfDemand).toBe(0);
      expect(result.allocations['ECO-003'].isEligible).toBe(false);
      expect(result.allocations['ECO-003'].grade).toBe('Red');
    });

    it('Allocated power must never exceed requested demand', () => {
      const demands = [500, 1500, 3000, 5000, 5400, 8000];
      demands.forEach(d => {
        const result = calculateLoadAllocation(testModules, d, defaultThresholds);
        expect(result.totalAllocatedWatts).toBeLessThanOrEqual(d);
      });
    });

    it('Allocated power must never exceed configured module power capacity', () => {
      const result = calculateLoadAllocation(testModules, 10000, defaultThresholds);
      expect(result.allocations['ECO-001'].watts).toBeLessThanOrEqual(3000);
      expect(result.allocations['ECO-002'].watts).toBeLessThanOrEqual(2400);
      expect(result.allocations['ECO-003'].watts).toBe(0);
    });

    it('Insufficient available capacity must produce the correct unmet-demand value', () => {
      // Total available max power for ECO-001 (3000) + ECO-002 (2400) = 5400W
      const demand = 7500;
      const result = calculateLoadAllocation(testModules, demand, defaultThresholds);
      expect(result.isOverloaded).toBe(true);
      expect(result.totalAllocatedWatts).toBe(5400);
      expect(result.unmetDemandWatts).toBe(2100); // 7500 - 5400 = 2100
      expect(result.totalAllocatedWatts + result.unmetDemandWatts).toBe(demand);
    });

    it('Zero demand must produce zero allocation', () => {
      const result = calculateLoadAllocation(testModules, 0, defaultThresholds);
      expect(result.totalAllocatedWatts).toBe(0);
      expect(result.unmetDemandWatts).toBe(0);
      expect(result.isOverloaded).toBe(false);
      expect(result.allocations['ECO-001'].watts).toBe(0);
      expect(result.allocations['ECO-002'].watts).toBe(0);
    });

    it('Zero available eligible capacity must produce zero allocation', () => {
      // All modules Red or Isolated
      const zeroCapacityModules = [
        { id: 'ECO-001', health: 45, status: 'Active', capacityKwh: 5.2, maxPowerWatts: 3000 }, // Red
        { id: 'ECO-002', health: 40, status: 'Active', capacityKwh: 4.5, maxPowerWatts: 2400 }, // Red
        { id: 'ECO-003', health: 90, status: 'Isolated', capacityKwh: 3.2, maxPowerWatts: 1600 } // Isolated
      ];

      const result = calculateLoadAllocation(zeroCapacityModules, 2000, defaultThresholds);
      expect(result.totalAllocatedWatts).toBe(0);
      expect(result.unmetDemandWatts).toBe(2000);
      expect(result.isOverloaded).toBe(true);
      expect(result.eligibleCount).toBe(0);
    });
  });

  // Section 3: Safety Monitoring and Anomaly Isolation Verification
  describe('Safety Monitoring and Alert Resolution Verification', () => {
    it('Abnormal temperature readings generate alert identifying the affected module', () => {
      const modules = [
        { id: 'ECO-001', health: 92, voltage: 48.0, temperature: 52.0 }, // Critical > 45°C
        { id: 'ECO-002', health: 68, voltage: 46.0, temperature: 28.0 }  // Normal
      ];

      const alerts = evaluateSafetyAlerts(modules, defaultThresholds);
      expect(alerts.length).toBe(1);
      expect(alerts[0].moduleId).toBe('ECO-001');
      expect(alerts[0].severity).toBe('CRITICAL');
      expect(alerts[0].metric).toBe('Temperature');
    });

    it('Correcting an abnormal reading resolves the corresponding alert while keeping unrelated alerts intact', () => {
      // Two modules with anomalies
      const dualAlertModules = [
        { id: 'ECO-001', health: 92, voltage: 48.0, temperature: 52.0 }, // Temp critical
        { id: 'ECO-002', health: 68, voltage: 40.5, temperature: 30.0 }  // Voltage under-voltage < 44V
      ];

      const initialAlerts = evaluateSafetyAlerts(dualAlertModules, defaultThresholds);
      expect(initialAlerts.length).toBe(2);
      expect(initialAlerts.some(a => a.moduleId === 'ECO-001')).toBe(true);
      expect(initialAlerts.some(a => a.moduleId === 'ECO-002')).toBe(true);

      // Correct ONLY ECO-001 temperature back to nominal 28°C
      const partiallyCorrectedModules = [
        { id: 'ECO-001', health: 92, voltage: 48.0, temperature: 28.0 }, // Normalized!
        { id: 'ECO-002', health: 68, voltage: 40.5, temperature: 30.0 }  // Still anomalous
      ];

      const remainingAlerts = evaluateSafetyAlerts(partiallyCorrectedModules, defaultThresholds);
      expect(remainingAlerts.length).toBe(1);
      expect(remainingAlerts[0].moduleId).toBe('ECO-002'); // ECO-001 alert was cleared, ECO-002 remains!
    });
  });

  // Section 4: Initial Benchmark Demo Data
  describe('Initial Demo Benchmark Dataset Verification', () => {
    it('Initial modules contains exactly three benchmark demo modules with required parameters', () => {
      expect(INITIAL_MODULES.length).toBe(3);
      const ids = INITIAL_MODULES.map(m => m.id);
      expect(ids).toEqual(['ECO-001', 'ECO-002', 'ECO-003']);

      const [m1, m2, m3] = INITIAL_MODULES;
      // ECO-001: health 92%, voltage 48V, temperature 28°C
      expect(m1.health).toBe(92);
      expect(m1.voltage).toBe(48.0);
      expect(m1.temperature).toBe(28.0);

      // ECO-002: health 68%, voltage 46V, temperature 32°C
      expect(m2.health).toBe(68);
      expect(m2.voltage).toBe(46.0);
      expect(m2.temperature).toBe(32.0);

      // ECO-003: health 35%, voltage 43V, temperature 35°C
      expect(m3.health).toBe(35);
      expect(m3.voltage).toBe(43.0);
      expect(m3.temperature).toBe(35.0);
    });
  });
});

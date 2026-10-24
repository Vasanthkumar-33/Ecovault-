// BMS Algorithm & Safety Diagnostic Utilities

/**
 * Determines battery health grade based on configurable thresholds
 * - Green: health >= thresholds.greenHealthMin (default 80%)
 * - Yellow: health >= thresholds.yellowHealthMin and < thresholds.greenHealthMin (default 50% to 79%)
 * - Red: health < thresholds.yellowHealthMin (default < 50%)
 */
export function getHealthGrade(health, thresholds = { greenHealthMin: 80, yellowHealthMin: 50 }) {
  const h = Number(health);
  const validHealth = isNaN(h) ? 0 : Math.max(0, Math.min(100, h));
  const greenMin = Number(thresholds.greenHealthMin) || 80;
  const yellowMin = Number(thresholds.yellowHealthMin) || 50;

  if (validHealth >= greenMin) {
    return {
      grade: 'Green',
      label: 'Optimal (Grade A)',
      tier: 'Green',
      color: 'emerald',
      hex: '#10b981',
      bgClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      pillClass: 'bg-emerald-500',
      isUsable: true,
      description: 'Primary dispatch candidate with high cycling stability and low impedance.'
    };
  } else if (validHealth >= yellowMin) {
    return {
      grade: 'Yellow',
      label: 'Derated (Grade B)',
      tier: 'Yellow',
      color: 'amber',
      hex: '#f59e0b',
      bgClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      pillClass: 'bg-amber-500',
      isUsable: true,
      description: 'Operational under derated discharge limits to protect aged cells.'
    };
  } else {
    return {
      grade: 'Red',
      label: 'Quarantined (Grade C)',
      tier: 'Red',
      color: 'rose',
      hex: '#ef4444',
      bgClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      pillClass: 'bg-rose-500',
      isUsable: false,
      description: 'Severely degraded or cell hazard detected. Safety interlock engaged; 0W load allowed.'
    };
  }
}

/**
 * Deterministic Health-Aware Load Allocation Algorithm
 * Requirements:
 * - Red modules receive strictly 0 W.
 * - Inactive, Maintenance, or Isolated modules receive strictly 0 W.
 * - Modules with 0 kWh capacity receive strictly 0 W.
 * - Green modules receive priority over Yellow modules and take a greater share of available load.
 * - Yellow modules receive a smaller share of available load.
 * - Never exceed the configured output capacity (maxPowerWatts) of any module.
 * - Total allocated power never exceeds requested demand or total available power capacity.
 * - If demand exceeds available capacity, accurately reports unmet demand and triggers overload warning.
 */
export function calculateLoadAllocation(modules = [], demandWatts = 0, thresholds = { greenHealthMin: 80, yellowHealthMin: 50 }) {
  const requestedDemand = Math.max(0, Math.round(Number(demandWatts) || 0));

  // Filter eligible modules: Active status, not Red grade, has positive energy and power capacity
  const eligibleModules = modules.filter(m => {
    const isAvailable = m.status === 'Active';
    const gradeInfo = getHealthGrade(m.health, thresholds);
    const hasCapacity = (Number(m.capacityKwh) || 0) > 0;
    const hasPower = (Number(m.maxPowerWatts) || 0) > 0;
    return isAvailable && gradeInfo.grade !== 'Red' && hasCapacity && hasPower;
  });

  const totalAvailableMaxPower = eligibleModules.reduce((sum, m) => sum + (Number(m.maxPowerWatts) || 0), 0);
  const totalAvailableCapacityKwh = eligibleModules.reduce((sum, m) => sum + (Number(m.capacityKwh) || 0), 0);

  const allocations = {};
  
  // Initialize all modules to 0W default
  modules.forEach(m => {
    const grade = getHealthGrade(m.health, thresholds).grade;
    let reason = 'Normal standby';
    if (m.status !== 'Active') {
      reason = `Status is ${m.status} (Contactor Open)`;
    } else if (grade === 'Red') {
      reason = `Excluded: Health (${m.health}%) < ${thresholds.yellowHealthMin}% safety interlock`;
    } else if ((Number(m.capacityKwh) || 0) <= 0) {
      reason = 'Excluded: Zero available energy capacity (0 kWh)';
    }

    allocations[m.id] = {
      moduleId: m.id,
      watts: 0,
      pctOfDemand: 0,
      pctOfMaxPower: 0,
      isEligible: false,
      grade,
      reason
    };
  });

  // Zero demand or no eligible modules
  if (eligibleModules.length === 0 || requestedDemand === 0) {
    return {
      allocations,
      requestedDemand,
      totalAllocatedWatts: 0,
      unmetDemandWatts: requestedDemand,
      isOverloaded: requestedDemand > 0,
      totalAvailableMaxPower,
      totalAvailableCapacityKwh: Number(totalAvailableCapacityKwh.toFixed(1)),
      eligibleCount: eligibleModules.length,
      redCount: modules.filter(m => getHealthGrade(m.health, thresholds).grade === 'Red').length
    };
  }

  // Target power to allocate across eligible modules
  const targetToAllocate = Math.min(requestedDemand, totalAvailableMaxPower);

  // Health-weighted priority factors:
  // Green modules: weight = (health / 100)^1.2 * 2.8 (Priority allocation)
  // Yellow modules: weight = (health / 100) * 0.75 (Derated smaller share)
  const weights = {};
  eligibleModules.forEach(m => {
    const grade = getHealthGrade(m.health, thresholds).grade;
    const healthNorm = Math.max(0.1, Number(m.health) || 50) / 100;
    if (grade === 'Green') {
      weights[m.id] = Math.pow(healthNorm, 1.2) * 2.8;
    } else {
      weights[m.id] = healthNorm * 0.75;
    }
  });

  // Iterative constrained weighted allocation with clamping at maxPowerWatts
  let remainingTarget = targetToAllocate;
  let activeModuleIds = new Set(eligibleModules.map(m => m.id));
  const assignedWatts = {};
  eligibleModules.forEach(m => { assignedWatts[m.id] = 0; });

  let iterations = 0;
  while (remainingTarget > 0.01 && activeModuleIds.size > 0 && iterations < 20) {
    iterations++;
    const totalCurrentWeight = Array.from(activeModuleIds).reduce((sum, id) => sum + weights[id], 0);
    
    if (totalCurrentWeight <= 0) break;

    let clampedAnyInThisRound = false;
    const proposedAdditions = {};

    activeModuleIds.forEach(id => {
      const share = remainingTarget * (weights[id] / totalCurrentWeight);
      const mod = eligibleModules.find(m => m.id === id);
      const maxP = Number(mod.maxPowerWatts) || 0;
      const current = assignedWatts[id];

      if (current + share >= maxP) {
        // Module reaches max configured power capacity
        const room = Math.max(0, maxP - current);
        assignedWatts[id] = maxP;
        remainingTarget -= room;
        activeModuleIds.delete(id);
        clampedAnyInThisRound = true;
      } else {
        proposedAdditions[id] = share;
      }
    });

    if (!clampedAnyInThisRound) {
      activeModuleIds.forEach(id => {
        assignedWatts[id] += proposedAdditions[id] || 0;
      });
      remainingTarget = 0;
      break;
    }
  }

  // Convert to rounded integer Watts and enforce strict balance:
  // 1. Never exceed maxPowerWatts
  // 2. Total allocated Watts strictly equals targetToAllocate
  let totalAllocatedWatts = 0;
  eligibleModules.forEach(m => {
    const maxP = Number(m.maxPowerWatts) || 0;
    const w = Math.min(maxP, Math.floor(assignedWatts[m.id] || 0));
    assignedWatts[m.id] = w;
    totalAllocatedWatts += w;
  });

  // Distribute leftover integer Watts caused by Math.floor
  let leftover = targetToAllocate - totalAllocatedWatts;
  if (leftover > 0) {
    // Sort modules by Green priority and remaining headroom
    const sortedByHeadroom = [...eligibleModules].sort((a, b) => {
      const aGrade = getHealthGrade(a.health, thresholds).grade === 'Green' ? 1 : 0;
      const bGrade = getHealthGrade(b.health, thresholds).grade === 'Green' ? 1 : 0;
      if (aGrade !== bGrade) return bGrade - aGrade;
      const aRoom = (Number(a.maxPowerWatts) || 0) - assignedWatts[a.id];
      const bRoom = (Number(b.maxPowerWatts) || 0) - assignedWatts[b.id];
      return bRoom - aRoom;
    });

    for (const m of sortedByHeadroom) {
      if (leftover <= 0) break;
      const maxP = Number(m.maxPowerWatts) || 0;
      const room = maxP - assignedWatts[m.id];
      if (room > 0) {
        const add = Math.min(leftover, room);
        assignedWatts[m.id] += add;
        totalAllocatedWatts += add;
        leftover -= add;
      }
    }
  }

  // Populate output allocations
  eligibleModules.forEach(m => {
    const watts = assignedWatts[m.id];
    const maxP = Number(m.maxPowerWatts) || 0;
    const grade = getHealthGrade(m.health, thresholds).grade;
    
    allocations[m.id] = {
      moduleId: m.id,
      watts,
      pctOfDemand: requestedDemand > 0 ? Number(((watts / requestedDemand) * 100).toFixed(1)) : 0,
      pctOfMaxPower: maxP > 0 ? Number(((watts / maxP) * 100).toFixed(1)) : 0,
      isEligible: true,
      grade,
      reason: grade === 'Green' 
        ? 'Active priority dynamic dispatch (Grade A)' 
        : 'Active derated secondary dispatch (Grade B)'
    };
  });

  const unmetDemandWatts = Math.max(0, requestedDemand - totalAllocatedWatts);

  return {
    allocations,
    requestedDemand,
    totalAllocatedWatts,
    unmetDemandWatts,
    isOverloaded: unmetDemandWatts > 0,
    totalAvailableMaxPower,
    totalAvailableCapacityKwh: Number(totalAvailableCapacityKwh.toFixed(1)),
    eligibleCount: eligibleModules.length,
    redCount: modules.filter(m => getHealthGrade(m.health, thresholds).grade === 'Red').length
  };
}

/**
 * Evaluates safety conditions for all modules based on demonstration thresholds
 * Automatically flags out-of-range readings and clears when normalized.
 */
export function evaluateSafetyAlerts(modules = [], thresholds = {
  voltageMinNormal: 44.0,
  voltageMaxNormal: 52.0,
  tempMaxNormal: 38.0,
  tempCritical: 45.0,
  greenHealthMin: 80,
  yellowHealthMin: 50
}) {
  const alerts = [];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  modules.forEach(m => {
    const v = Number(m.voltage);
    const t = Number(m.temperature);
    const h = Number(m.health);

    // 1. Critical Thermal Runaway check
    if (t >= thresholds.tempCritical) {
      alerts.push({
        id: `alert-temp-crit-${m.id}`,
        moduleId: m.id,
        severity: 'CRITICAL',
        metric: 'Temperature',
        value: `${t}°C`,
        threshold: `>= ${thresholds.tempCritical}°C`,
        title: `Critical High Temperature — ${m.id}`,
        message: `Simulated cell temperature of ${t}°C exceeds critical threshold of ${thresholds.tempCritical}°C. Thermal runaway risk.`,
        action: 'Isolate module contactor immediately; engage auxiliary thermal dissipation loop.',
        timestamp: now
      });
    } else if (t > thresholds.tempMaxNormal) {
      alerts.push({
        id: `alert-temp-warn-${m.id}`,
        moduleId: m.id,
        severity: 'WARNING',
        metric: 'Temperature',
        value: `${t}°C`,
        threshold: `> ${thresholds.tempMaxNormal}°C`,
        title: `Elevated Operating Temperature — ${m.id}`,
        message: `Module temperature reached ${t}°C (normal upper limit is ${thresholds.tempMaxNormal}°C).`,
        action: 'Derate discharge rate by 30% and inspect battery enclosure cooling fans.',
        timestamp: now
      });
    }

    // 2. Voltage threshold checks
    if (v < thresholds.voltageMinNormal) {
      alerts.push({
        id: `alert-volt-low-${m.id}`,
        moduleId: m.id,
        severity: 'CRITICAL',
        metric: 'Voltage',
        value: `${v}V`,
        threshold: `< ${thresholds.voltageMinNormal}V`,
        title: `Under-Voltage Deep Discharge Hazard — ${m.id}`,
        message: `Simulated bus voltage of ${v}V is below deep discharge safety cutoff (${thresholds.voltageMinNormal}V).`,
        action: 'Open DC contactors to prevent irreversible lithium copper shunting / cell degradation.',
        timestamp: now
      });
    } else if (v > thresholds.voltageMaxNormal) {
      alerts.push({
        id: `alert-volt-high-${m.id}`,
        moduleId: m.id,
        severity: 'CRITICAL',
        metric: 'Voltage',
        value: `${v}V`,
        threshold: `> ${thresholds.voltageMaxNormal}V`,
        title: `Over-Voltage Condition — ${m.id}`,
        message: `Simulated bus voltage of ${v}V exceeds safe overcharge cutoff (${thresholds.voltageMaxNormal}V).`,
        action: 'Halt charging immediately; engage bleed balance resistor on high cell group.',
        timestamp: now
      });
    }

    // 3. Health grade check (Red tier isolation)
    if (h < thresholds.yellowHealthMin) {
      alerts.push({
        id: `alert-health-red-${m.id}`,
        moduleId: m.id,
        severity: 'WARNING',
        metric: 'Health (SOH)',
        value: `${h}%`,
        threshold: `< ${thresholds.yellowHealthMin}%`,
        title: `Sub-50% SOH Isolation Rule — ${m.id}`,
        message: `State of Health has dropped to ${h}%. Per second-life qualification protocol, this module is prohibited from load sharing.`,
        action: 'Isolate contactor; route to second-life remanufacturing, cell harvesting or recycling.',
        timestamp: now
      });
    }
  });

  return alerts;
}

/**
 * Calculates Solar and Grid Microgrid Balance
 * Power is strictly measured in Watts (W) / kW.
 * Energy is strictly measured in Watt-hours (Wh) / kWh.
 */
export function calculateEnergyBalance(solarWatts = 0, loadDemandWatts = 0, batteryAllocatedWatts = 0) {
  const solar = Math.max(0, Math.round(Number(solarWatts) || 0));
  const load = Math.max(0, Math.round(Number(loadDemandWatts) || 0));
  const batteryDischarge = Math.max(0, Math.round(Number(batteryAllocatedWatts) || 0));

  let batteryChargingWatts = 0;
  let gridExportWatts = 0;
  let gridImportWatts = 0;

  if (solar >= load) {
    const surplus = solar - load;
    // Assume second-life batteries can absorb up to 2500W charging power
    batteryChargingWatts = Math.min(surplus, 2500);
    gridExportWatts = surplus - batteryChargingWatts;
  } else {
    // Solar generation is lower than load demand
    // Battery covers what it can via allocated discharge power
    const remainingLoad = Math.max(0, load - solar - batteryDischarge);
    gridImportWatts = remainingLoad;
  }

  const greenEnergyPct = load > 0 
    ? Math.min(100, Number((((Math.min(load, solar) + batteryDischarge) / load) * 100).toFixed(1)))
    : 100;

  return {
    solarWatts: solar,
    loadDemandWatts: load,
    batteryDischargeWatts: batteryDischarge,
    batteryChargingWatts,
    gridExportWatts,
    gridImportWatts,
    netDeficitWatts: gridImportWatts,
    netSurplusWatts: gridExportWatts,
    greenEnergyPct
  };
}

// Initial demo data for EcoVault Second-Life Battery Management System

export const INITIAL_MODULES = [
  {
    id: 'ECO-001',
    health: 92,
    voltage: 48.0,
    temperature: 28.0,
    capacityKwh: 5.2,
    maxPowerWatts: 3000,
    status: 'Active', // 'Active' | 'Maintenance' | 'Isolated'
    originalVehicle: 'Nissan Leaf Gen 2 (2019)',
    chemistry: 'LiNiMnCoO2 (NMC)',
    manufactureYear: 2019,
    firstLifeCycles: 1420,
    secondLifeCycles: 114,
    internalResistanceMOhms: 18.2,
    dateRepurposed: '2024-03-15',
    serialNumber: 'SN-EV-99214-NL2',
    carbonOffsetKg: 374,
    eventHistory: [
      {
        id: 'evt-101',
        timestamp: '2026-10-24 09:15:00',
        type: 'COMMISSIONING',
        title: 'Second-Life Array Commissioned',
        description: 'Module graded Grade A (Green) SOH 92%. Assigned to primary dynamic dispatch rack.',
        severity: 'INFO'
      },
      {
        id: 'evt-102',
        timestamp: '2026-10-24 10:30:12',
        type: 'ALLOCATION',
        title: 'Priority Peak Load Serving',
        description: 'BMS allocated 2,150W during high facility load window. Voltage stable at 48.0V.',
        severity: 'INFO'
      }
    ]
  },
  {
    id: 'ECO-002',
    health: 68,
    voltage: 46.0,
    temperature: 32.0,
    capacityKwh: 4.5,
    maxPowerWatts: 2400,
    status: 'Active',
    originalVehicle: 'Tesla Model S 75D (2017)',
    chemistry: 'LiNiCoAlO2 (NCA)',
    manufactureYear: 2017,
    firstLifeCycles: 2180,
    secondLifeCycles: 182,
    internalResistanceMOhms: 32.6,
    dateRepurposed: '2024-04-10',
    serialNumber: 'SN-EV-88412-TS1',
    carbonOffsetKg: 324,
    eventHistory: [
      {
        id: 'evt-103',
        timestamp: '2026-10-24 09:15:00',
        type: 'COMMISSIONING',
        title: 'Second-Life Array Commissioned',
        description: 'Module graded Grade B (Yellow) SOH 68%. Derated to secondary balanced dispatch.',
        severity: 'INFO'
      },
      {
        id: 'evt-104',
        timestamp: '2026-10-24 11:05:40',
        type: 'THERMAL',
        title: 'Temperature Elevation Notice',
        description: 'Operating temperature reached 32°C under sustained secondary load. Within demonstration tolerance.',
        severity: 'WARNING'
      }
    ]
  },
  {
    id: 'ECO-003',
    health: 35,
    voltage: 43.0,
    temperature: 35.0,
    capacityKwh: 3.2,
    maxPowerWatts: 1600,
    status: 'Isolated', // Excluded from simulated load allocation
    originalVehicle: 'Renault Zoe ZE40 (2016)',
    chemistry: 'LiMn2O4 (LMO/NMC)',
    manufactureYear: 2016,
    firstLifeCycles: 3100,
    secondLifeCycles: 45,
    internalResistanceMOhms: 64.1,
    dateRepurposed: '2024-06-02',
    serialNumber: 'SN-EV-77109-RZ3',
    carbonOffsetKg: 230,
    eventHistory: [
      {
        id: 'evt-105',
        timestamp: '2026-10-24 09:15:00',
        type: 'SAFETY',
        title: 'Safety Interlock Engaged - Health Under 50%',
        description: 'Module graded Grade C (Red) SOH 35%. Isolated from active load allocation. Contactors open.',
        severity: 'CRITICAL'
      },
      {
        id: 'evt-106',
        timestamp: '2026-10-24 11:20:00',
        type: 'INSPECTION',
        title: 'Under-Voltage Anomaly Detected',
        description: 'Simulated bus voltage dropped to 43.0V (threshold < 44.0V). Module queued for cell balancing inspection.',
        severity: 'CRITICAL'
      }
    ]
  }
];

export const INITIAL_THRESHOLDS = {
  greenHealthMin: 80,
  yellowHealthMin: 50,
  voltageMinNormal: 44.0,
  voltageMaxNormal: 52.0,
  tempMaxNormal: 38.0,
  tempCritical: 45.0,
};

export const INITIAL_SIMULATION = {
  loadDemandWatts: 3800,
  solarGenerationWatts: 2400,
  timeOfDay: '13:30',
  gridConnected: true,
};

export const INITIAL_SYSTEM_EVENTS = [
  {
    id: 'sys-1',
    timestamp: '2026-10-24 12:45:10',
    category: 'BMS_ALLOCATION',
    title: 'Adaptive Load Balancing Completed',
    details: 'Calculated health-weighted distribution across active Green and Yellow modules.',
    level: 'INFO'
  },
  {
    id: 'sys-2',
    timestamp: '2026-10-24 12:15:00',
    category: 'SAFETY_INTERLOCK',
    title: 'ECO-003 Isolated from Bus',
    details: 'Red-tier health (35%) and low voltage (43.0V) triggered automatic safety quarantine.',
    level: 'CRITICAL'
  },
  {
    id: 'sys-3',
    timestamp: '2026-10-24 11:30:25',
    category: 'SOLAR_INTEGRATION',
    title: 'Solar Infeed Active',
    details: 'Simulated 2,400W rooftop PV offset 63% of current facility microgrid demand.',
    level: 'INFO'
  }
];

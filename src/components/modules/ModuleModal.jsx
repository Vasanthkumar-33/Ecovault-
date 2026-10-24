import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

export function ModuleModal({ isOpen, onClose, onSave, moduleToEdit = null, existingIds = [] }) {
  const isEditing = !!moduleToEdit;

  const [formData, setFormData] = useState({
    id: '',
    health: 85,
    voltage: 48.0,
    temperature: 28.0,
    capacityKwh: 4.8,
    maxPowerWatts: 2600,
    status: 'Active',
    originalVehicle: 'Nissan Leaf Gen 2 (2019)',
    chemistry: 'LiNiMnCoO2 (NMC)',
    manufactureYear: 2019,
    internalResistanceMOhms: 22.0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (moduleToEdit) {
      setFormData({
        id: moduleToEdit.id,
        health: moduleToEdit.health,
        voltage: moduleToEdit.voltage,
        temperature: moduleToEdit.temperature,
        capacityKwh: moduleToEdit.capacityKwh,
        maxPowerWatts: moduleToEdit.maxPowerWatts || Math.round(moduleToEdit.capacityKwh * 550),
        status: moduleToEdit.status || 'Active',
        originalVehicle: moduleToEdit.originalVehicle || 'EV Fleet Repurposed',
        chemistry: moduleToEdit.chemistry || 'LiNiMnCoO2 (NMC)',
        manufactureYear: moduleToEdit.manufactureYear || 2018,
        internalResistanceMOhms: moduleToEdit.internalResistanceMOhms || 24.0
      });
      setError('');
    } else {
      // Suggest next ID
      const nextNum = existingIds.length + 1;
      const suggestedId = `ECO-00${nextNum > 9 ? nextNum : '0' + nextNum}`;
      setFormData({
        id: suggestedId,
        health: 85,
        voltage: 48.0,
        temperature: 28.0,
        capacityKwh: 4.8,
        maxPowerWatts: 2600,
        status: 'Active',
        originalVehicle: 'Hyundai Kona Electric (2020)',
        chemistry: 'LiNiMnCoO2 (NMC)',
        manufactureYear: 2020,
        internalResistanceMOhms: 21.0
      });
      setError('');
    }
  }, [moduleToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    const cleanId = formData.id.trim().toUpperCase();
    if (!cleanId) {
      setError('Module ID is required (e.g. ECO-004)');
      return;
    }

    if (!isEditing && existingIds.includes(cleanId)) {
      setError(`Module ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    const healthNum = Number(formData.health);
    if (isNaN(healthNum) || healthNum < 0 || healthNum > 100) {
      setError('Health percentage must be between 0 and 100%');
      return;
    }

    const voltNum = Number(formData.voltage);
    if (isNaN(voltNum) || voltNum <= 0) {
      setError('Voltage must be a positive number (e.g. 48.0V)');
      return;
    }

    const tempNum = Number(formData.temperature);
    if (isNaN(tempNum)) {
      setError('Temperature must be a valid number in °C');
      return;
    }

    const capNum = Number(formData.capacityKwh);
    if (isNaN(capNum) || capNum <= 0) {
      setError('Capacity must be a positive number in kWh');
      return;
    }

    onSave({
      ...formData,
      id: cleanId,
      health: healthNum,
      voltage: voltNum,
      temperature: tempNum,
      capacityKwh: capNum,
      maxPowerWatts: Number(formData.maxPowerWatts) || Math.round(capNum * 550)
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Second-Life Module: ${formData.id}` : 'Enroll New Second-Life Battery Module'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Module ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Module Identifier <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="e.g. ECO-004"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 uppercase font-mono"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Operating Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Active">Active (Eligible for BMS load)</option>
              <option value="Maintenance">Maintenance (Offline test)</option>
              <option value="Isolated">Isolated (Safety Interlock Open)</option>
            </select>
          </div>

          {/* Health Percentage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              State of Health (SOH %) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="health"
                min="1"
                max="100"
                step="1"
                value={formData.health}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              &ge;80% Green | 50-79% Yellow | &lt;50% Red Quarantined
            </span>
          </div>

          {/* Capacity in kWh */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estimated Usable Capacity <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="capacityKwh"
                min="0.5"
                max="50"
                step="0.1"
                value={formData.capacityKwh}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">kWh</span>
            </div>
          </div>

          {/* Bus Voltage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Simulated Voltage <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="voltage"
                min="20"
                max="80"
                step="0.1"
                value={formData.voltage}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">V</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Normal: 44.0V — 52.0V</span>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Simulated Cell Temperature <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="temperature"
                min="0"
                max="75"
                step="0.5"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">°C</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Normal: &lt;38°C | Critical: &ge;45°C</span>
          </div>

          {/* Max Power Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Max Power Inverter Limit
            </label>
            <div className="relative">
              <input
                type="number"
                name="maxPowerWatts"
                min="500"
                max="10000"
                step="100"
                value={formData.maxPowerWatts}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">W</span>
            </div>
          </div>

          {/* First-Life Origin Vehicle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Original EV Donor Vehicle
            </label>
            <input
              type="text"
              name="originalVehicle"
              value={formData.originalVehicle}
              onChange={handleChange}
              placeholder="e.g. Nissan Leaf 2019"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald transition-all"
          >
            {isEditing ? 'Save Changes' : 'Enroll Module'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

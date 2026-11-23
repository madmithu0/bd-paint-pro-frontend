import React, { useState, useEffect } from 'react';
import api from '../api';

const MistriSkillSelector = ({ initialSelectedIds = [], onSaveSuccess }) => {
  const [services, setServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState(
    Array.isArray(initialSelectedIds)
      ? initialSelectedIds.map((id) => String(id._id || id))
      : []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let isMounted = true;
    const fetchActiveServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services');
        if (isMounted && res.data && res.data.success) {
          setServices(res.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setStatusMsg({
            type: 'error',
            text: err.response?.data?.message || 'Failed to load service list.',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActiveServices();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(initialSelectedIds)) {
      setSelectedIds(initialSelectedIds.map((id) => String(id._id || id)));
    }
  }, [initialSelectedIds]);

  const toggleSkill = (serviceId) => {
    const idStr = String(serviceId);
    setStatusMsg({ type: '', text: '' });
    setSelectedIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((item) => item !== idStr)
        : [...prev, idStr]
    );
  };

  const handleSelectAll = () => {
    setStatusMsg({ type: '', text: '' });
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map((s) => String(s._id)));
    }
  };

  const handleSaveSkills = async () => {
    if (selectedIds.length === 0) {
      setStatusMsg({
        type: 'error',
        text: 'Please select at least one work category.',
      });
      return;
    }

    try {
      setSaving(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.patch('/services/mistri/skills', {
        serviceIds: selectedIds,
      });
      if (res.data && res.data.success) {
        setStatusMsg({
          type: 'success',
          text: 'Your work skills have been updated successfully.',
        });
        if (onSaveSuccess) onSaveSuccess(res.data.capableServices);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Unable to save selected skills.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        Loading work categories...
      </div>
    );
  }
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Select Work Categories You Can Perform
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tick all painting and coating tasks you are skilled in ({selectedIds.length} selected)
          </p>
        </div>

        <button
          type="button"
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:text-indigo-300 rounded-lg"
        >
          {selectedIds.length === services.length ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {services.map((service) => {
          const isChecked = selectedIds.includes(String(service._id));
          return (
            <label
              key={service._id}
              onClick={() => toggleSkill(service._id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                isChecked
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {service.applicationArea}
                </p>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  1 Slot = {service.slotSqftPerDay} Sqft | Labour: {service.labourRatePerSqft} BDT/Sqft
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 mb-4 rounded-lg text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={handleSaveSkills}
        className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
      >
        {saving ? 'Saving Skills...' : 'Save My Work Skills'}
      </button>
    </div>
  );
};

export default MistriSkillSelector;

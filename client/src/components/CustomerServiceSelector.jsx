import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';

const ROOM_PRESETS = [
  { label: '1 Room (~350 Sqft)', sqft: 350 },
  { label: '2 Rooms (~700 Sqft)', sqft: 700 },
  { label: '3 Rooms (~1050 Sqft)', sqft: 1050 },
  { label: 'Full Flat (~1500 Sqft)', sqft: 1500 },
];

const CustomerServiceSelector = ({ onSelectionChange }) => {
  const [services, setServices] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services');
        if (isMounted && res.data && res.data.success) {
          setServices(res.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(
            err.response?.data?.message || 'Unable to load painting services.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadServices();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleService = (service) => {
    const id = String(service._id);
    setSelectedMap((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        const defaultMistriOnly = !service.isWithMaterialEnabled;
        updated[id] = {
          serviceId: service._id,
          code: service.code,
          name: service.name,
          sqft: service.slotSqftPerDay || 450,
          isMistriOnly: defaultMistriOnly,
          slotSqftPerDay: service.slotSqftPerDay,
          labourRatePerSqft: service.labourRatePerSqft,
          withMaterialRatePerSqft: service.withMaterialRatePerSqft,
        };
      }
      return updated;
    });
  };

  const updateItemField = (serviceId, field, value) => {
    const id = String(serviceId);
    setSelectedMap((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      };
    });
  };

  const summaryData = useMemo(() => {
    const items = Object.values(selectedMap);
    let totalSqft = 0;
    let totalSlots = 0;
    let totalBill = 0;
    let totalMaterialCost = 0;

    items.forEach((item) => {
      const validSqft = Math.max(0, Number(item.sqft) || 0);
      const rate = item.isMistriOnly
        ? item.labourRatePerSqft
        : item.withMaterialRatePerSqft;
      const subTotal = Math.round(validSqft * rate);
      const matCost = item.isMistriOnly
        ? 0
        : Math.round(
            validSqft * (item.withMaterialRatePerSqft - item.labourRatePerSqft)
          );
      const slots = validSqft / Math.max(50, item.slotSqftPerDay);

      totalSqft += validSqft;
      totalSlots += slots;
      totalBill += subTotal;
      totalMaterialCost += matCost;
    });
    const roundedSlots = Number(totalSlots.toFixed(2));
    const estimatedDays = Math.max(1, Math.ceil(roundedSlots));
    const advance30Percent = Math.round(totalBill * 0.3);

    return {
      items,
      totalSqft,
      totalSlots: roundedSlots,
      estimatedDays,
      totalBill,
      totalMaterialCost,
      labourCost: totalBill - totalMaterialCost,
      advance30Percent,
    };
  }, [selectedMap]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(summaryData);
    }
  }, [summaryData, onSelectionChange]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        Loading service rate catalog...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Select Painting & Coating Work Categories
        </h3>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
          {summaryData.items.length} Selected
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="space-y-3">
        {services.map((service) => {
          const id = String(service._id);
          const selectedItem = selectedMap[id];
          const isChecked = Boolean(selectedItem);

          return (
            <div
              key={id}
              className={`p-4 rounded-xl border transition ${
                isChecked
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div
                onClick={() => toggleService(service)}
                className="flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {service.applicationArea} • 1 Slot = {service.slotSqftPerDay} Sqft
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  {service.isLabourOnlyEnabled && (
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Mistri Only: {service.labourRatePerSqft} BDT/Sqft
                    </p>
                  )}
                  {service.isWithMaterialEnabled && (
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      With Material: {service.withMaterialRatePerSqft} BDT/Sqft
                    </p>
                  )}
                </div>
              </div>
              {isChecked && selectedItem && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Area Size (Sqft)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedItem.sqft}
                      onChange={(e) =>
                        updateItemField(id, 'sqft', Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ROOM_PRESETS.map((preset) => (
                        <button
                          key={preset.sqft}
                          type="button"
                          onClick={() => updateItemField(id, 'sqft', preset.sqft)}
                          className="px-2 py-0.5 text-[10px] bg-gray-100 hover:bg-indigo-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Package Option
                    </label>
                    <div className="flex gap-2">
                      {service.isWithMaterialEnabled && (
                        <button
                          type="button"
                          onClick={() => updateItemField(id, 'isMistriOnly', false)}
                          className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border ${
                            !selectedItem.isMistriOnly
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300'
                          }`}
                        >
                          With Material ({service.withMaterialRatePerSqft} BDT)
                        </button>
                      )}
                      {service.isLabourOnlyEnabled && (
                        <button
                          type="button"
                          onClick={() => updateItemField(id, 'isMistriOnly', true)}
                          className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border ${
                            selectedItem.isMistriOnly
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300'
                          }`}
                        >
                          Mistri Only ({service.labourRatePerSqft} BDT)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {summaryData.items.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-900 text-white space-y-2">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Total Area & Workload:</span>
            <span className="font-semibold text-white">
              {summaryData.totalSqft} Sqft ({summaryData.totalSlots} Slots / ~{summaryData.estimatedDays} Days)
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Estimated Total Bill:</span>
            <span className="text-emerald-400">{summaryData.totalBill} BDT</span>
          </div>
          <div className="flex justify-between text-xs text-amber-300 pt-1 border-t border-gray-700">
            <span>30% Advance Required to Unlock Mistri Chat & Phone:</span>
            <span className="font-bold">{summaryData.advance30Percent} BDT</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServiceSelector;

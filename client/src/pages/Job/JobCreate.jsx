    return {
      totalSqft: numericSqft,
      totalSlots: serviceSelection.totalSlots,
      totalDays,
      mistriCount,
      materialCost,
      labourCost,
      repairCost,
      totalPrice,
      advance30Percent,
      mistriShare,
      agentShare,
      platformShare,
      isAllMistriOnly,
    };
  }, [serviceSelection, wallProblems, damageLevel, hasAgent]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file.', 'error');
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setWallPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('wallPhoto', file);

    setAiLoading(true);
    setAiOffline(false);

    try {
      const res = await api.post('/jobs/ai-analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && Number(res.data.confidence) >= 0.8) {
        setWallProblems({
          nona: Boolean(res.data.problems?.nona),
          damp: Boolean(res.data.problems?.damp),
          fatol: Boolean(res.data.problems?.fatol),
        });
        if (['low', 'medium', 'high'].includes(res.data.damageLevel)) {
          setDamageLevel(res.data.damageLevel);
        }
        showToast('AI wall analysis completed.', 'success');
      } else {
        setAiOffline(true);
        showToast('Low AI confidence. Switched to manual input mode.', 'warning');
      }
    } catch (error) {
      setAiOffline(true);
      showToast('AI service unavailable. Manual calculation mode active.', 'info');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (typeof isKilled === 'function' && isKilled('JOB_CREATE')) {
      showToast('Job creation is temporarily disabled.', 'error');
      return;
    }

    if (serviceSelection.items.length === 0 || calculations.totalSqft <= 0) {
      showToast('Please select at least one work category and enter Sqft.', 'error');
      return;
    }

    if (hasAgent && !agentCode.trim()) {
      showToast('Please enter a valid Agent Code or Phone.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();

      payload.append('selectedServices', JSON.stringify(serviceSelection.items));
      payload.append('sqft', calculations.totalSqft);
      payload.append('price', calculations.totalPrice);
      payload.append('materialSource', calculations.isAllMistriOnly ? 'CustomerOwn' : 'Platform');
      payload.append('materialCost', calculations.materialCost);
      payload.append('labourCost', calculations.labourCost);
      payload.append('isMistriOnly', String(calculations.isAllMistriOnly));
      payload.append('isSiteVisitRequested', String(isSiteVisitRequested));
      payload.append('totalDays', calculations.totalDays);
      payload.append('mistriCount', calculations.mistriCount);
      payload.append('wallProblems', JSON.stringify(wallProblems));
      payload.append('damageLevel', damageLevel);
      payload.append('hasAgent', String(hasAgent));

      if (hasAgent) {
        payload.append('agentCode', agentCode.trim());
      }
      if (wallPhoto) {
        payload.append('wallPhoto', wallPhoto);
      }

      const res = await api.post('/jobs/create', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.job?._id) {
        showToast('Job created successfully. Complete 30% advance to unlock Mistri chat.', 'success');
        navigate(`/jobs/${res.data.job._id}`);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create job.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const hasAnyWallProblem =
    wallProblems.nona || wallProblems.damp || wallProblems.fatol;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Create New Painting Job
        </h2>
        {calculations.isAllMistriOnly && serviceSelection.items.length > 0 && (
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
            Mistri-Only Mode
          </span>
        )}
      </div>

      <HotlineWidget
        compact={true}
        contextMessage="Hello, I need help calculating Sqft or selecting paint services."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomerServiceSelector onSelectionChange={handleSelectionChange} />

        <div className="p-4 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wall Photo (Optional AI Problem Detection)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {aiLoading && (
            <p className="mt-2 text-sm text-blue-600 animate-pulse">
              Analyzing wall photo...
            </p>
          )}
          {aiOffline && (
            <p className="mt-2 text-xs text-amber-600">
              AI Fallback Active: Please check wall conditions manually below.
            </p>
          )}
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Wall Preview"
              className="mt-3 h-40 w-auto rounded-lg object-cover border dark:border-gray-700"
            />
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Wall Conditions & Site Inspection
          </h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-2 text-sm dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wallProblems.nona}
                onChange={(e) =>
                  setWallProblems((prev) => ({ ...prev, nona: e.target.checked }))
                }
              />
              <span>Nona</span>
            </label>
            <label className="flex items-center space-x-2 text-sm dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wallProblems.damp}
                onChange={(e) =>
                  setWallProblems((prev) => ({ ...prev, damp: e.target.checked }))
                }
              />
              <span>Damp</span>
            </label>
            <label className="flex items-center space-x-2 text-sm dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wallProblems.fatol}
                onChange={(e) =>
                  setWallProblems((prev) => ({ ...prev, fatol: e.target.checked }))
                }
              />
              <span>Fatol</span>
            </label>
          </div>

          {hasAnyWallProblem && (
            <div className="pt-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                Damage Level:
              </label>
              <select
                value={damageLevel}
                onChange={(e) => setDamageLevel(e.target.value)}
                className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isSiteVisitRequested}
                onChange={(e) => setIsSiteVisitRequested(e.target.checked)}
              />
              <span>Request Physical Site Visit Before Final Measurement</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border rounded-lg dark:border-gray-700">
          <label className="flex items-center space-x-2 text-sm font-medium dark:text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgent}
              onChange={(e) => {
                setHasAgent(e.target.checked);
                if (!e.target.checked) setAgentCode('');
              }}
            />
            <span>Agent Reference</span>
          </label>
          {hasAgent && (
            <input
              type="text"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              placeholder="Agent ID or Phone"
              className="px-3 py-1.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required={hasAgent}
            />
          )}
        </div>

        <div className="p-5 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-blue-900 dark:text-blue-300">
              Final Estimation Summary
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              30% Advance: {formatTaka ? formatTaka(calculations.advance30Percent) : `৳${calculations.advance30Percent}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-2.5 bg-white dark:bg-gray-900 rounded">
              <span className="text-gray-500 block text-xs">Duration</span>
              <strong className="text-gray-800 dark:text-white">
                {calculations.totalDays} Days
              </strong>
            </div>
            <div className="p-2.5 bg-white dark:bg-gray-900 rounded">
              <span className="text-gray-500 block text-xs">Mistri Needed</span>
              <strong className="text-gray-800 dark:text-white">
                {calculations.mistriCount}
              </strong>
            </div>
            <div className="p-2.5 bg-white dark:bg-gray-900 rounded">
              <span className="text-gray-500 block text-xs">Total Slots</span>
              <strong className="text-gray-800 dark:text-white">
                {calculations.totalSlots}
              </strong>
            </div>
            <div className="p-2.5 bg-white dark:bg-gray-900 rounded">
              <span className="text-gray-500 block text-xs">Total Price</span>
              <strong className="text-green-600 text-base">
                {formatTaka ? formatTaka(calculations.totalPrice) : `৳${calculations.totalPrice}`}
              </strong>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || aiLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
        >
          {loading ? 'Creating Job...' : 'Confirm & Create Job'}
        </button>
      </form>
    </div>
  );
};

export default JobCreate;

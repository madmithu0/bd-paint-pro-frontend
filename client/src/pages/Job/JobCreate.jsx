                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <input
                  id="mistriOnly"
                  type="checkbox"
                  checked={isMistriOnly}
                  onChange={(e) => setIsMistriOnly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="mistriOnly" className="text-sm font-medium cursor-pointer">
                  Mistri Only Mode (10 Taka/Sqft — Customer provides all materials)
                </label>
              </div>

              {!isMistriOnly && (
                <div>
                  <label className="block text-sm font-medium mb-1">Material Source</label>
                  <select
                    value={materialSource}
                    onChange={(e) => setMaterialSource(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Platform">Platform Provided (18 Taka/Sqft)</option>
                    <option value="Mistri">Mistri Arranged Material</option>
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    id="hasAgent"
                    type="checkbox"
                    checked={hasAgent}
                    onChange={(e) => setHasAgent(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="hasAgent" className="text-sm font-medium cursor-pointer">
                    Booked via Field Agent / Contractor
                  </label>
                </div>

                {hasAgent && (
                  <input
                    type="tel"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    placeholder="Agent 11-digit Mobile Number (01XXXXXXXXX)"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Work Site Full Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, Road, Area, Thana, District..."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition"
              >
                {submitting ? 'Creating Job...' : 'Confirm & Book Job'}
              </button>
            </form>
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Live Cost & Slot Summary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Calculator size={16} /> Estimated Duration</span>
                <span className="font-semibold text-gray-900 dark:text-white">{calculation.totalDays} Day(s)</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                <span>Assigned Mistri</span>
                <span className="font-semibold text-gray-900 dark:text-white">{calculation.mistriCount} Person(s)</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-800 pt-2 flex justify-between">
                <span>Labour Cost</span>
                <span className="font-medium">{formatTaka(calculation.labourCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Material & Repair Cost</span>
                <span className="font-medium">{formatTaka(calculation.materialCost)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-800 pt-3 flex justify-between text-base font-bold text-blue-600">
                <span>Total Payable</span>
                <span>{formatTaka(calculation.totalPrice)}</span>
              </div>
            </div>

            {calculation.slots.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-gray-500 mb-2">450 Sqft/Day Work Slots:</p>
                <div className="flex flex-wrap gap-1.5">
                  {calculation.slots.map((s) => (
                    <span
                      key={s.slot}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium"
                    >
                      Slot {s.slot}: {s.sqft} Sqft
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


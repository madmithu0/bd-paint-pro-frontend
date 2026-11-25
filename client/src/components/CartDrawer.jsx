import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  district = '',
  upazila = '',
}) {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLocalMerchants = async () => {
      setLoadingMerchants(true);
      try {
        const params = {};
        if (district) params.district = district;
        if (upazila) params.upazila = upazila;

        const { data } = await axios.get(`${API_BASE}/merchant-store/merchants`, { params });
        const list = Array.isArray(data?.merchants) ? data.merchants : Array.isArray(data) ? data : [];
        setMerchants(list);
        if (list.length > 0 && !selectedMerchantId) {
          setSelectedMerchantId(list._id);
        }
      } catch {
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchLocalMerchants();
  }, [isOpen, district, upazila]);
  const summary = useMemo(() => {
    let regularTotal = 0;
    let finalTotal = 0;
    let totalUnits = 0;

    cartItems.forEach((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(item.unitPrice) || 0;
      const bulkThreshold = Number(item.bulkMinQty) || 5;
      const bulkPrice =
        item.bulkDiscountPrice && Number(item.bulkDiscountPrice) > 0 && qty >= bulkThreshold
          ? Number(item.bulkDiscountPrice)
          : unitPrice;

      regularTotal += unitPrice * qty;
      finalTotal += bulkPrice * qty;
      totalUnits += qty;
    });

    const bulkSavings = Math.max(0, regularTotal - finalTotal);
    return { regularTotal, finalTotal, bulkSavings, totalUnits };
  }, [cartItems]);

  const handleProceedCheckout = () => {
    if (cartItems.length === 0) return;

    const checkoutPayload = {
      items: cartItems,
      merchantId: selectedMerchantId,
      subtotal: summary.finalTotal,
      bulkSavings: summary.bulkSavings,
    };

    try {
      sessionStorage.setItem('material_checkout_draft', JSON.stringify(checkoutPayload));
    } catch {}

    onClose();
    navigate('/store/checkout');
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Material Cart ({summary.totalUnits})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulk discounts apply automatically at 5+ units
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">
              Your material cart is empty.
            </div>
          ) : (
            cartItems.map((item) => {
              const qty = Math.max(1, Number(item.quantity) || 1);
              const bulkThreshold = Number(item.bulkMinQty) || 5;
              const isBulkApplied =
                item.bulkDiscountPrice && Number(item.bulkDiscountPrice) > 0 && qty >= bulkThreshold;
              const activePrice = isBulkApplied
                ? Number(item.bulkDiscountPrice)
                : Number(item.unitPrice) || 0;

              return (
                <div
                  key={item._id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.brand} {item.grade ? `• ${item.grade}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {activePrice} Tk / unit
                      </span>
                      {isBulkApplied && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
                          Bulk Rate
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQty && onUpdateQty(item._id, Math.max(1, qty - 1))}
                      className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty && onUpdateQty(item._id, qty + 1)}
                      className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem && onRemoveItem(item._id)}
                      className="ml-1 text-xs text-red-500 hover:underline"
                    >
                      Del
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assigned Local Verified Merchant
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                disabled={loadingMerchants}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="">Auto-Route Nearest Verified Merchant</option>
                {merchants.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.shopName || m.name} ({m.upazila || m.district || 'Verified'})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs space-y-1">
              {summary.bulkSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Bulk Discount Savings:</span>
                  <span>-{summary.bulkSavings} Tk</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                <span>Payable Subtotal:</span>
                <span>{summary.finalTotal} Tk</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedCheckout}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Proceed to Direct Material Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

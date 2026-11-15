import React, { useState } from 'react';
import { Tag, CheckCircle2, X } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';

export default function CouponApply({ baseAmount = 0, onDiscountApplied }) {
  const { success, error } = useToast();

  const [code, setCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      error('Enter a valid promo or coupon code.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/payments/coupon/validate', {
        code: cleanCode,
        amount: Number(baseAmount) || 0,
      });

      const discountAmount = Number(data?.discountAmount) || 0;
      const couponInfo = {
        code: cleanCode,
        discountAmount,
        expiresAt: data?.expiresAt || null,
        remainingUses: data?.remainingUses ?? null,
      };

      setAppliedCoupon(couponInfo);
      if (onDiscountApplied) {
        onDiscountApplied(discountAmount, cleanCode);
      }
      success(`Coupon ${cleanCode} applied! Saved ${formatTaka(discountAmount)}.`);
    } catch (err) {
      error(err.response?.data?.message || 'Coupon is invalid, expired, or usage limit reached.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCode('');
    if (onDiscountApplied) {
      onDiscountApplied(0, null);
    }
    success('Coupon removed.');
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card title="Apply Discount Coupon" action={<Tag size={18} className="text-blue-600" />}>
        {appliedCoupon ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span className="font-mono">{appliedCoupon.code}</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Discount Applied: <strong>{formatTaka(appliedCoupon.discountAmount)}</strong>
              </p>
              {appliedCoupon.expiresAt && (
                <p className="text-[11px] text-gray-500">
                  Valid until {formatDate(appliedCoupon.expiresAt)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleRemoveCoupon}
              aria-label="Remove Coupon"
              className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER COUPON CODE"
              className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}

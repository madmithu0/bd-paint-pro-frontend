import React, { useState, useEffect } from 'react';
import api from '../../api';

const MerchantStorePage = () => {
  const [materials, setMaterials] = useState([]);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let isMounted = true;
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await api.get('/materials', {
          params: {
            search: searchQuery || undefined,
            district: districtFilter || undefined,
          },
        });
        if (isMounted && res.data && res.data.success) {
          setMaterials(res.data.materials || res.data.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setStatusMsg({
            type: 'error',
            text: err.response?.data?.message || 'Unable to load merchant catalog.',
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMaterials();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, districtFilter]);

  const updateCartQuantity = (material, delta) => {
    const id = String(material._id);
    setStatusMsg({ type: '', text: '' });
    setCart((prev) => {
      const currentQty = prev[id] ? prev[id].qty : 0;
      const nextQty = Math.max(0, currentQty + delta);
      const updated = { ...prev };
      if (nextQty === 0) {
        delete updated[id];
      } else {
        updated[id] = {
          materialId: material._id,
          name: material.name,
          unitPrice: Number(material.price) || 0,
          merchantId: material.merchantId || null,
          qty: nextQty,
        };
      }
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const totalCartAmount = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );

  const handlePlaceMaterialOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      setOrdering(true);
      setStatusMsg({ type: '', text: '' });
      const res = await api.post('/materials/direct-order', {
        items: cartItems,
        totalAmount: totalCartAmount,
      });
      if (res.data && res.data.success) {
        setCart({});
        setStatusMsg({
          type: 'success',
          text: 'Direct material order placed! Verify digital memo OTP on delivery.',
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to place direct material order.',
      });
    } finally {
      setOrdering(false);
    }
  };
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Verified Merchant Paint & Hardware Store
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Order genuine paints, putty, sealers, and tools directly from verified local merchants
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search paint, putty, brush..."
            className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            placeholder="Filter by District"
            className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading verified merchant inventory...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((item) => {
            const id = String(item._id);
            const qty = cart[id] ? cart[id].qty : 0;
            const inStock = (item.stock ?? 1) > 0;

            return (
              <div
                key={id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                      {item.brand || 'Verified Merchant'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        inStock ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.unit || 'Per Liter / Bucket'} • {item.district || 'All Bangladesh'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.price} BDT
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={qty === 0}
                      onClick={() => updateCartQuantity(item, -1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-gray-900 dark:text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => updateCartQuantity(item, 1)}
                      className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="sticky bottom-4 p-4 rounded-2xl bg-gray-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-300">
              {cartItems.length} Material Item(s) Selected
            </p>
            <p className="text-base font-bold text-emerald-400">
              Total: {totalCartAmount} BDT
            </p>
          </div>

          <button
            type="button"
            disabled={ordering}
            onClick={handlePlaceMaterialOrder}
            className="px-6 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-gray-950 rounded-xl disabled:opacity-50"
          >
            {ordering ? 'Placing Order...' : 'Order with Digital Memo OTP'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MerchantStorePage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka } from '../../format';
import Card from '../../components/Card';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

export default function MaterialPage() {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', unit: 'Liter/Kg' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get('/materials');
      setMaterials(Array.isArray(data?.materials) ? data.materials : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load material catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || Number(formData.price) <= 0) {
      error('Enter a valid material name and price.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/materials', {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        unit: formData.unit.trim() || 'Unit',
      });
      success('Material added to catalog.');
      setModalOpen(false);
      setFormData({ name: '', price: '', stock: '', unit: 'Liter/Kg' });
      fetchMaterials();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add material.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMaterials = materials.filter((m) =>
    (m.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Construction & Painting Materials</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Verified paints, primers, putty, and Nona/Damp chemical pricing & stock
          </p>
        </div>

        {role === 'Merchant' && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold self-start"
          >
            <PlusCircle size={16} />
            <span>Add Material</span>
          </button>
        )}
      </div>

      <div className="max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search paint, putty, sealer, chemical..."
        />
      </div>

      {filteredMaterials.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Materials Found"
          emptyDescription="No construction or painting materials match your search."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((item) => {
            const inStock = (Number(item.stock) || 0) > 0;
            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      inStock
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {inStock ? `${item.stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>

                <h3 className="font-bold text-base mt-3">{item.name}</h3>
                <p className="text-xl font-extrabold text-blue-600 mt-1">
                  {formatTaka(item.price)}{' '}
                  <span className="text-xs font-normal text-gray-500">/ {item.unit || 'Unit'}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <Link
                    to={`/materials/${item._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <span>Specs & Price History</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Material"
        hideFooter
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Berger WeatherCoat 20L"
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price (Taka)</label>
              <input
                type="number"
                min={1}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Publish Material'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, TrendingUp, Layers } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Chart from '../../components/Chart';
import Loading from '../../components/Loading';

export default function MaterialDetails() {
  const { id } = useParams();
  const { error } = useToast();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMaterialDetails = async () => {
      try {
        const { data } = await api.get(`/materials/${id}`);
        if (active) setMaterial(data?.material || null);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load material specifications.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMaterialDetails();
    return () => {
      active = false;
    };
  }, [id, error]);

  if (loading) {
    return <Loading />;
  }

  if (!material) {
    return (
      <Loading
        variant="empty"
        emptyTitle="Material Not Found"
        emptyDescription="The requested material item could not be located."
      />
    );
  }

  const priceHistory = Array.isArray(material.priceHistory) ? material.priceHistory : [];
  const stockHistory = Array.isArray(material.stockHistory) ? material.stockHistory : [];

  const priceChartData = priceHistory.map((item) => ({
    label: formatDate(item.date || item.updatedAt),
    value: Number(item.price) || 0,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/materials"
          className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{material.name}</h1>
          <p className="text-xs text-gray-500">
            Material ID: {material._id} • Unit: {material.unit || 'Standard Unit'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Current Unit Price</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                {formatTaka(material.price)}
              </p>
            </div>
            <Package size={24} className="text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Available Stock</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {material.stock ?? 0} Units
              </p>
            </div>
            <Layers size={24} className="text-emerald-600" />
          </div>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Approval Status</p>
          <p className="text-lg font-bold mt-1.5">{material.status || 'Verified'}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Updated: {formatDate(material.updatedAt || material.createdAt)}
          </p>
        </Card>
      </div>

      <Card title="Technical Specifications">
        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          {material.description ||
            'Standard construction and surface coating material approved for residential and commercial wall application.'}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Price History" action={<TrendingUp size={18} className="text-blue-600" />}>
          {priceChartData.length > 0 ? (
            <Chart type="line" data={priceChartData} />
          ) : (
            <p className="text-xs text-gray-500 py-8 text-center">
              Current base price: {formatTaka(material.price)}. No historical price changes logged.
            </p>
          )}
        </Card>

        <Card title="Stock Movement History">
          {stockHistory.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              Current inventory balance: {material.stock ?? 0} units. No recent stock adjustments.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {stockHistory.map((entry, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold">{entry.action || 'Stock Update'}</span>
                    <p className="text-gray-400">{formatDate(entry.date || entry.createdAt, true)}</p>
                  </div>
                  <span
                    className={`font-bold ${
                      Number(entry.change) >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {Number(entry.change) >= 0 ? `+${entry.change}` : entry.change} Units
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

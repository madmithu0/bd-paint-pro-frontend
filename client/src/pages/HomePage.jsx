import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Paintbrush, ShieldCheck, Wrench, Tag, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../api';
import { formatTaka } from '../format';
import Card from '../components/Card';
import Loading from '../components/Loading';

const SERVICE_CATALOG = [
  {
    id: 'interior-paint',
    title: 'Interior Wall Painting',
    ratePerSqft: 18,
    standard: '450 Sqft / Day',
    description: 'Complete interior surface preparation, putty coat, primer, and double-coat finish.',
    icon: Paintbrush,
  },
  {
    id: 'exterior-paint',
    title: 'Exterior Weather Coat',
    ratePerSqft: 22,
    standard: '450 Sqft / Day',
    description: 'Weather-resistant exterior coating with anti-fungal and damp-proof protection.',
    icon: ShieldCheck,
  },
  {
    id: 'wall-repair',
    title: 'Nona, Damp & Fatol Repair',
    ratePerSqft: 28,
    standard: 'AI Measured',
    description: 'Specialized chemical treatment for salinity (Nona), dampness, and structural crack (Fatol) sealing.',
    icon: Wrench,
  },
  {
    id: 'mistri-only',
    title: 'Mistri-Only Labour Service',
    ratePerSqft: 10,
    standard: 'Zero Material Cost',
    description: 'Customer supplies paint and materials; verified Mistris execute the job at 450 Sqft/day.',
    icon: Paintbrush,
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchPromos = async () => {
      try {
        const { data } = await api.get('/materials?limit=4');
        if (active && Array.isArray(data?.materials)) {
          setOffers(data.materials);
        }
      } catch {
        // Fallback to static service catalog if catalog endpoint is empty
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPromos();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full mb-3">
            <Tag size={13} />
            <span>Verified 450 Sqft/Day Standard</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">Service Catalog & Instant Booking</h1>
          <p className="text-blue-100 text-sm mt-1.5 max-w-xl">
            Transparent Sqft pricing, AI wall damage detection, and escrow-protected payments.
          </p>
        </div>

        <Link
          to={isAuthenticated ? '/jobs/create' : '/signup'}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition shrink-0"
        >
          <span>Book a Job Now</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Available Painting & Wall Repair Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICE_CATALOG.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base">{service.title}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        {service.standard}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">
                        From {formatTaka(service.ratePerSqft)} / Sqft
                      </span>
                      <Link
                        to={isAuthenticated ? '/jobs/create' : '/login'}
                        className="text-xs font-semibold text-gray-900 dark:text-white hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>Calculate & Book</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {offers.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Featured Construction & Paint Materials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offers.map((item) => (
              <Card key={item._id}>
                <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                <p className="text-base font-bold text-blue-600 mt-1">{formatTaka(item.price)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Stock: {item.stock ?? 0} units</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

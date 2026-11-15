import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowUpRight, PlusCircle, Percent } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';

export default function WalletPage() {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [wallet, setWallet] = useState({ balance: 0, totalEarnings: 0, transactions: [] });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addTrxId, setAddTrxId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchWallet = async () => {
    try {
      const { data } = await api.get('/wallet');
      setWallet({
        balance: Number(data?.balance) || 0,
        totalEarnings: Number(data?.totalEarnings) || 0,
        transactions: Array.isArray(data?.transactions) ? data.transactions : [],
      });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load wallet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const num = Number(addAmount);
    if (num < 50 || !addTrxId.trim()) {
      error('Minimum deposit is ৳ 50.00 with a valid TrxID.');
      return;
    }

    setAdding(true);
    try {
      await api.post('/wallet/add-money', {
        amount: num,
        trxId: addTrxId.trim(),
      });
      success('Funds added to wallet.');
      setAddModalOpen(false);
      setAddAmount('');
      setAddTrxId('');
      fetchWallet();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add money.');
    } finally {
      setAdding(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt, true) },
    { header: 'Type', accessor: 'type' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className={`font-bold ${row.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.type === 'Credit' ? '+' : '-'} {formatTaka(row.amount)}
        </span>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Digital Wallet & Split Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Manage wallet funds, equal share credits, and payout withdrawals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {role === 'Customer' && (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              <PlusCircle size={16} />
              <span>Add Money</span>
            </button>
          )}

          <Link
            to="/withdraw"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-semibold"
          >
            <span>Withdraw</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Current Balance</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{formatTaka(wallet.balance)}</p>
            </div>
            <Wallet size={24} className="text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Equal Split Credits</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatTaka(wallet.totalEarnings)}
              </p>
            </div>
            <Percent size={24} className="text-emerald-600" />
          </div>
        </Card>

        <Card>
          <p className="text-xs text-gray-500 uppercase font-semibold">Share Rule Lock</p>
          <p className="text-sm font-bold mt-1.5">Mistri 80% Equal Share</p>
          <p className="text-xs text-gray-500 mt-0.5">Agent 5% + Platform 15% (or 20%)</p>
        </Card>
      </div>

      <Card title="Transaction History">
        <Table columns={columns} data={wallet.transactions} emptyMessage="No wallet transactions yet." />
      </Card>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Money to Wallet"
        hideFooter
      >
        <form onSubmit={handleAddMoney} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (Taka)</label>
            <input
              type="number"
              min={50}
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="e.g., 2000"
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">bKash / Nagad TrxID</label>
            <input
              type="text"
              value={addTrxId}
              onChange={(e) => setAddTrxId(e.target.value.toUpperCase())}
              placeholder="Transaction ID"
              className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono uppercase"
              required
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {adding ? 'Verifying...' : 'Confirm Deposit'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

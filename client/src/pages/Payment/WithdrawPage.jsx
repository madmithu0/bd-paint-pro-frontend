import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, Wallet } from 'lucide-react';
import useToast from '../../hooks/useToast';
import api from '../../api';
import { formatTaka, formatDate } from '../../format';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Loading from '../../components/Loading';

export default function WithdrawPage() {
  const { success, error } = useToast();

  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadWalletData = async () => {
    try {
      const [walletRes, histRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/withdraw-history'),
      ]);
      setBalance(Number(walletRes.data?.balance) || 0);
      setTotalEarnings(Number(walletRes.data?.totalEarnings) || 0);
      setWithdrawals(Array.isArray(histRes.data?.withdrawals) ? histRes.data.withdrawals : []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load withdrawal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (numAmount < 100) {
      error('Minimum withdrawal amount is ৳ 100.00.');
      return;
    }
    if (numAmount > balance) {
      error('Insufficient wallet balance.');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(accountNumber.trim())) {
      error('Enter a valid 11-digit mobile wallet number.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/wallet/withdraw', {
        amount: numAmount,
        method,
        accountNumber: accountNumber.trim(),
      });
      success('Payout withdrawal request submitted.');
      setAmount('');
      loadWalletData();
    } catch (err) {
      error(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt, true) },
    { header: 'Method', accessor: 'method' },
    { header: 'Account', accessor: 'accountNumber' },
    { header: 'Amount', accessor: 'amount', render: (row) => <span className="font-bold">{formatTaka(row.amount)}</span> },
    { header: 'Status', accessor: 'status' },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdraw Earnings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Request instant payout to bKash, Nagad, or Rocket from your verified share balance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Available Balance</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatTaka(balance)}</p>
            </div>
            <Wallet size={26} className="text-emerald-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Lifetime Share Earnings</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{formatTaka(totalEarnings)}</p>
            </div>
            <ArrowDownCircle size={26} className="text-blue-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="New Payout Request">
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payout Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="bKash">bKash Personal/Agent</option>
                <option value="Nagad">Nagad Account</option>
                <option value="Rocket">Rocket Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Receiver Mobile Number</label>
              <input
                type="tel"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount (Taka)</label>
              <input
                type="number"
                min={100}
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min 100"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || balance < 100}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition"
            >
              {submitting ? 'Submitting...' : 'Submit Withdrawal'}
            </button>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card title="Withdrawal History">
            <Table columns={columns} data={withdrawals} emptyMessage="No withdrawal requests yet." />
          </Card>
        </div>
      </div>
    </div>
  );
}

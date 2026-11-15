import React, { useState, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import useToast from '../hooks/useToast';
import api from '../api';
import { formatTaka, formatDate } from '../format';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function InvoicePage() {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchInvoices = async () => {
      try {
        const { data } = await api.get('/invoices');
        if (active) {
          setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
        }
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load invoices.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInvoices();
    return () => {
      active = false;
    };
  }, [error]);

  const handleDownloadPdf = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoiceNumber || invoice._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success('Invoice PDF downloaded.');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to download PDF.');
    }
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber', render: (row) => row.invoiceNumber || row._id.slice(-8).toUpperCase() },
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Total Amount', accessor: 'amount', render: (row) => <span className="font-bold">{formatTaka(row.amount)}</span> },
    {
      header: 'Share Split',
      sortable: false,
      render: (row) => (
        <span className="text-xs text-gray-600 dark:text-slate-400">
          Mistri 80% • {row.hasAgent ? 'Agent 5% + Platform 15%' : 'Platform 20%'}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedInvoice(row)}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
            title="View Breakup"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleDownloadPdf(row)}
            className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            title="Download PDF"
          >
            <Download size={15} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices & Share Breakup</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Download official PDF invoices and review automated share distributions
        </p>
      </div>

      <Card>
        <Table columns={columns} data={invoices} emptyMessage="No invoices generated yet." />
      </Card>

      <Modal
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title="Invoice Share Breakup"
        hideFooter
      >
        {selectedInvoice && (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-gray-500">Total Billed Amount</span>
              <span className="font-bold text-base">{formatTaka(selectedInvoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mistri Equal Share (80%)</span>
              <span className="font-semibold text-emerald-600">
                {formatTaka(selectedInvoice.mistriShare ?? selectedInvoice.amount * 0.8)}
              </span>
            </div>
            {selectedInvoice.hasAgent ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Agent Commission (5%)</span>
                  <span className="font-semibold">
                    {formatTaka(selectedInvoice.agentShare ?? selectedInvoice.amount * 0.05)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee (15%)</span>
                  <span className="font-semibold">
                    {formatTaka(selectedInvoice.platformShare ?? selectedInvoice.amount * 0.15)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span>Platform Fee (20% - No Agent)</span>
                <span className="font-semibold">
                  {formatTaka(selectedInvoice.platformShare ?? selectedInvoice.amount * 0.2)}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, BarChart2 } from 'lucide-react';
import useToast from '../hooks/useToast';
import api from '../api';
import { formatTaka, formatDate } from '../format';
import Card from '../components/Card';
import Chart from '../components/Chart';
import Table from '../components/Table';
import Loading from '../components/Loading';

export default function ReportPage() {
  const { success, error } = useToast();
  const [reportType, setReportType] = useState('financial');
  const [records, setRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/reports', { params: { type: reportType } });
        if (!active) return;
        setRecords(Array.isArray(data?.records) ? data.records : []);
        setChartData(Array.isArray(data?.chart) ? data.chart : []);
      } catch (err) {
        if (active) error(err.response?.data?.message || 'Failed to load report data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      active = false;
    };
  }, [reportType, error]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const response = await api.get('/reports/export', {
        params: { type: reportType, format },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportType}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      success(`Report exported as ${format.toUpperCase()}.`);
    } catch (err) {
      error(err.response?.data?.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Reference', accessor: 'reference', render: (row) => row.reference || row._id },
    { header: 'Category', accessor: 'category' },
    { header: 'Amount', accessor: 'amount', render: (row) => formatTaka(row.amount) },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity & Financial Reports</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Analyze job performance, earnings, and download statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="financial">Financial Statement</option>
            <option value="jobs">Job Completion Report</option>
          </select>

          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
          >
            <Download size={16} />
            <span>PDF</span>
          </button>

          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport('xlsx')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-medium disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Card title="Visual Summary" action={<BarChart2 size={18} className="text-blue-600" />}>
            <Chart type="bar" data={chartData} />
          </Card>

          <Card title="Detailed Report Records">
            <Table columns={columns} data={records} emptyMessage="No report entries for this period." />
          </Card>
        </>
      )}
    </div>
  );
}

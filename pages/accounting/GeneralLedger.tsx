import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, ExportDropdown, Select, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import financeService from '../../services/finance.service';
import { LedgerLine, GeneralLedgerReport } from '../../types';
import { Calendar, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export const GeneralLedger: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accounts } = useData();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<GeneralLedgerReport | null>(null);
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === 'ar';

  const fetchReport = async () => {
    if (!selectedAccountId) {
      return;
    }
    setLoading(true);
    try {
      const data = await financeService.getGeneralLedger({
        accountId: selectedAccountId,
        fromDate,
        toDate
      });
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch general ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0]._id || accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Auto-fetch when account, fromDate, or toDate changes
  useEffect(() => {
    if (selectedAccountId && fromDate && toDate) {
      const timer = setTimeout(() => {
        fetchReport();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedAccountId, fromDate, toDate]);

  const getBalanceTrend = () => {
    if (!report || report.ledgerLines.length === 0) return null;
    const firstBalance = report.ledgerLines[0]?.balance || 0;
    const lastBalance = report.closingBalance;
    if (lastBalance > firstBalance) {
      return { trend: 'up', percentage: ((lastBalance - firstBalance) / firstBalance * 100).toFixed(2) };
    } else if (lastBalance < firstBalance) {
      return { trend: 'down', percentage: ((firstBalance - lastBalance) / firstBalance * 100).toFixed(2) };
    }
    return { trend: 'stable', percentage: '0' };
  };

  const columns: Column<LedgerLine>[] = [
    { 
      header: t('date'), 
      render: (item) => new Date(item.entryDate).toLocaleDateString(),
      cell: (item: LedgerLine) => (
        <span className="whitespace-nowrap">{new Date(item.entryDate).toLocaleDateString()}</span>
      )
    },
    { 
      header: t('reference'), 
      accessorKey: 'referenceNumber',
      cell: (item: LedgerLine) => (
        <span className="font-mono text-sm">{item.referenceNumber || '-'}</span>
      )
    },
    { 
      header: t('description'), 
      accessorKey: 'memo',
      cell: (item: LedgerLine) => (
        <div className="max-w-xs truncate" title={item.memo}>
          {item.description || '-'}
        </div>
      )
    },
    { 
      header: t('debit'), 
      accessorKey: 'debit', 
      className: 'text-right',
      cell: (item: LedgerLine) => (
        <span className="text-green-600 font-medium">
          {item.debit > 0 ? item.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
        </span>
      )
    },
    { 
      header: t('credit'), 
      accessorKey: 'credit', 
      className: 'text-right',
      cell: (item: LedgerLine) => (
        <span className="text-red-600 font-medium">
          {item.credit > 0 ? item.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
        </span>
      )
    },
    { 
      header: t('balance'), 
      accessorKey: 'balance', 
      className: 'text-right',
      cell: (item: LedgerLine) => {
        const isPositive = item.balance >= 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-gray-900' : 'text-red-600'}`}>
            {item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    },
  ];

  const accountOptions = useMemo(() => {
    return accounts.map(a => ({
      value: a._id || a.id,
      label: `${a.accountCode} - ${a.accountName}`
    }));
  }, [accounts]);

  const balanceTrend = getBalanceTrend();

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('general_ledger')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_your_general_ledger')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {report && (
            <div className="w-full sm:w-auto">
              <ExportDropdown data={report.ledgerLines} filename={`general_ledger_${report.account.code}`} />
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-4 bg-white border border-gray-200 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label={t('account')}
            options={accountOptions}
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            fullWidth
          />
          <Input
            label={t('from_date')}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            icon={<Calendar size={18} />}
            fullWidth
          />
          <Input
            label={t('to_date')}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            icon={<Calendar size={18} />}
            fullWidth
          />
          <div className="flex items-end">
            <Button 
              onClick={fetchReport} 
              isLoading={loading}
              className="w-full justify-center"
            >
             {t('generate_report')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Section */}
      {report && (
        <div className="space-y-4">
          {/* Account Summary Card */}
          <Card className="overflow-hidden border border-gray-200 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-gray-500 uppercase tracking-wide">{t('account_details')}</p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {report.account.code} - {report.account.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t('account_type')}: <span className="font-medium text-gray-700">{t(report.account.type?.toLowerCase() || '')}</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wide">{t('closing_balance')}</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${report.closingBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {report.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {balanceTrend && balanceTrend.trend !== 'stable' && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${balanceTrend.trend === 'up' ? 'text-green-600' : 'text-red-600'} justify-start sm:justify-end`}>
                    {balanceTrend.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{balanceTrend.percentage}% {balanceTrend.trend === 'up' ? t('increase') : t('decrease')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Date Range Info */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-b border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('period')}:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t('total_transactions')}:</span>
                  <span className="ml-2 font-medium text-gray-900">{report.ledgerLines.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('total_debit')}:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {report.ledgerLines.reduce((sum, line) => sum + (line.debit || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t('total_credit')}:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {report.ledgerLines.reduce((sum, line) => sum + (line.credit || 0), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Ledger Table */}
          <Card className="overflow-hidden border border-gray-200 rounded-xl">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table 
                  data={report.ledgerLines} 
                  columns={columns} 
                  keyExtractor={(item, index) => `${item.date}-${item.reference}-${index}`}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && selectedAccountId && (
        <div className="py-12 sm:py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">{t('no_transactions_found')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('no_transactions_in_period')}</p>
        </div>
      )}

      {/* Initial Loading State */}
      {!report && !loading && !selectedAccountId && (
        <div className="py-12 sm:py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('select_account_to_view_ledger')}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 sm:py-20 text-center bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 mt-3">{t('loading_ledger')}</p>
        </div>
      )}
    </div>
  );
};
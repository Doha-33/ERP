import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, ExportDropdown, Select, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import financeService from '../../services/finance.service';
import { LedgerLine, GeneralLedgerReport } from '../../types';

export const GeneralLedger: React.FC = () => {
  const { t } = useTranslation();
  const { accounts } = useData();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<GeneralLedgerReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!selectedAccountId) return;
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

  const columns: Column<LedgerLine>[] = [
    { 
      header: t('date'), 
      render: (item) => new Date(item.date).toLocaleDateString()
    },
    { header: t('reference'), accessorKey: 'reference' },
    { header: t('description'), accessorKey: 'description' },
    { header: t('debit'), accessorKey: 'debit', className: 'text-right' },
    { header: t('credit'), accessorKey: 'credit', className: 'text-right' },
    { header: t('balance'), accessorKey: 'balance', className: 'text-right' },
  ];

  const accountOptions = accounts.map(a => ({
    value: a._id || a.id,
    label: `${a.accountCode} - ${a.accountName}`
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('general_ledger')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_general_ledger')}</p>
        </div>
        <div className="flex gap-3">
          {report && <ExportDropdown data={report.ledgerLines} filename="general_ledger" />}
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select
            label={t('account')}
            options={accountOptions}
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          />
          <Input
            label={t('from_date')}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label={t('to_date')}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <Button onClick={fetchReport} isLoading={loading}>
            {t('generate_report')}
          </Button>
        </div>
      </Card>

      {report && (
        <Card className="space-y-4">
          <div className="flex justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
            <div>
              <p className="text-sm text-gray-500">{t('account')}</p>
              <p className="font-bold">{report.account.code} - {report.account.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('closing_balance')}</p>
              <p className="font-bold text-lg">{report.closingBalance.toLocaleString()}</p>
            </div>
          </div>
          <Table data={report.ledgerLines} columns={columns} keyExtractor={(item) => item.date + item.reference + Math.random()} />
        </Card>
      )}

      {!report && !loading && (
        <div className="py-20 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          {t('select_account_to_view_ledger')}
        </div>
      )}
    </div>
  );
};

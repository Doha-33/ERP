import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ExportDropdown, Button, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import financeService from '../../services/finance.service';
import { BalanceSheetReport, ProfitLossReport } from '../../types';

export const FinancialReports: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('balance_sheet');
  const [fromDate, setFromDate] = useState<string>('2026-01-01');
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'balance_sheet') {
        const data = await financeService.getBalanceSheet({ asOfDate: toDate });
        setBalanceSheet(data);
      } else if (activeTab === 'profit_loss') {
        const data = await financeService.getProfitLoss({ fromDate, toDate });
        setProfitLoss(data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const tabs = [
    { id: 'balance_sheet', label: 'balance_sheet' },
    { id: 'profit_loss', label: 'profit_loss' },
  ];

  const bcColumns: Column<any>[] = [
    { header: t('account'), accessorKey: 'accountName' },
    { header: t('account_code'), accessorKey: 'accountCode' },
    { header: t('balance'), accessorKey: 'amount', className: 'text-right', render: (val) => Number(val.amount).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('financial_reports')}</h1>
        </div>
        <div className="flex gap-3">
          <ExportDropdown 
            data={activeTab === 'balance_sheet' ? balanceSheet?.assets || [] : profitLoss?.revenues || []} 
            filename={`report_${activeTab}`} 
          />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>
          
          <div className="flex items-end gap-3 ml-auto">
            {activeTab === 'profit_loss' && (
              <Input
                label={t('from_date')}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            )}
            <Input
              label={activeTab === 'balance_sheet' ? t('as_of_date') : t('to_date')}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <Button onClick={fetchReports} isLoading={loading}>
              {t('refresh')}
            </Button>
          </div>
        </div>
      </Card>

      {activeTab === 'balance_sheet' && balanceSheet && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('assets')}</h3>
            <Table data={balanceSheet.assets} columns={bcColumns} keyExtractor={(item) => item.accountCode} />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between font-bold text-lg">
              <span>{t('total_assets')}</span>
              <span>{balanceSheet.totalAssets.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('liabilities')}</h3>
            <Table data={balanceSheet.liabilities} columns={bcColumns} keyExtractor={(item) => item.accountCode} />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between font-bold text-lg">
              <span>{t('total_liabilities')}</span>
              <span>{balanceSheet.totalLiabilities.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('equity')}</h3>
            <Table data={balanceSheet.equity} columns={bcColumns} keyExtractor={(item) => item.accountCode} />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between font-bold text-lg text-primary">
              <span>{t('total_liabilities_equity')}</span>
              <span>{(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'profit_loss' && profitLoss && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('revenue')}</h3>
            <Table data={profitLoss.revenues} columns={bcColumns} keyExtractor={(item) => item.accountCode} />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between font-bold text-lg">
              <span>{t('total_revenue')}</span>
              <span>{profitLoss.totalRevenue.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">{t('expenses')}</h3>
            <Table data={profitLoss.expenses} columns={bcColumns} keyExtractor={(item) => item.accountCode} />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between font-bold text-lg">
              <span>{t('total_expenses')}</span>
              <span>{profitLoss.totalExpense.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex justify-between font-bold text-2xl text-primary">
              <span>{t('net_income')}</span>
              <span>{profitLoss.netProfit.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center text-gray-500">
          {t('loading_report')}
        </div>
      )}
    </div>
  );
};

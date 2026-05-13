import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ExportDropdown, Button, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import financeService from '../../services/finance.service';
import { BalanceSheetReport, ProfitLossReport } from '../../types';
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('balance_sheet');
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === 'ar';

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

  const handleRefresh = () => {
    fetchReports();
  };

  const tabs = [
    { id: 'balance_sheet', label: t('balance_sheet'), icon: '📊' },
    { id: 'profit_loss', label: t('profit_loss'), icon: '📈' },
  ];

  const bcColumns: Column<any>[] = [
    { 
      header: t('account'), 
      accessorKey: 'accountName',
      cell: (item: any) => (
        <span className="font-medium text-gray-900">{item.accountName}</span>
      )
    },
    { 
      header: t('account_code'), 
      accessorKey: 'accountCode',
      cell: (item: any) => (
        <span className="font-mono text-sm text-gray-600">{item.accountCode}</span>
      )
    },
    { 
      header: t('balance'), 
      accessorKey: 'amount', 
      className: 'text-right',
      render: (val) => Number(val.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: any) => {
        const amount = Number(item.amount);
        const isPositive = amount >= 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-gray-900' : 'text-red-600'}`}>
            {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    },
  ];

  // Helper to check if net income is positive or negative
  const isNetIncomePositive = profitLoss?.netProfit ? profitLoss.netProfit > 0 : false;

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('financial_reports')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('view_financial_statements')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {((activeTab === 'balance_sheet' && balanceSheet) || (activeTab === 'profit_loss' && profitLoss)) && (
            <div className="w-full sm:w-auto">
              <ExportDropdown 
                data={activeTab === 'balance_sheet' 
                  ? [...(balanceSheet?.assets || []), ...(balanceSheet?.liabilities || []), ...(balanceSheet?.equity || [])] 
                  : [...(profitLoss?.revenues || []), ...(profitLoss?.expenses || [])]
                } 
                filename={`${activeTab}_report_${new Date().toISOString().split('T')[0]}`} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs and Filters Section */}
      <Card className="p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-300 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
            {activeTab === 'profit_loss' && (
              <Input
                label={t('from_date')}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                fullWidth
                className="w-full sm:w-40"
              />
            )}
            <Input
              label={activeTab === 'balance_sheet' ? t('as_of_date') : t('to_date')}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              fullWidth
              className="w-full sm:w-40"
            />
            <Button 
              onClick={handleRefresh} 
              isLoading={loading}
              className="justify-center text-white"
            >
              {t('refresh')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Balance Sheet Report */}
      {activeTab === 'balance_sheet' && balanceSheet && !loading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_assets')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {balanceSheet.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_liabilities')}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {balanceSheet.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_equity')}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {balanceSheet.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('assets')}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table 
                data={balanceSheet.assets} 
                columns={bcColumns} 
                keyExtractor={(item) => item.accountCode} 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold text-base">
              <span className="text-gray-700">{t('total_assets')}</span>
              <span className="text-green-600 text-lg">{balanceSheet.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>

          {/* Liabilities Section */}
          <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('liabilities')}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table 
                data={balanceSheet.liabilities} 
                columns={bcColumns} 
                keyExtractor={(item) => item.accountCode} 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold text-base">
              <span className="text-gray-700">{t('total_liabilities')}</span>
              <span className="text-red-600 text-lg">{balanceSheet.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>

          {/* Equity Section */}
          <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('equity')}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table 
                data={balanceSheet.equity} 
                columns={bcColumns} 
                keyExtractor={(item) => item.accountCode} 
              />
            </div>
            <div className="p-4 bg-blue-50 border-t border-blue-200 flex justify-between font-bold text-base">
              <span className="text-gray-700">{t('total_liabilities_equity')}</span>
              <span className="text-blue-700 text-lg">
                {(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Profit & Loss Report */}
      {activeTab === 'profit_loss' && profitLoss && !loading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_revenue')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {profitLoss.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_expenses')}</p>
                  <p className="text-2xl font-bold text-red-600">
                    {profitLoss.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className={`rounded-xl border p-4 ${isNetIncomePositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('net_income')}</p>
                  <p className={`text-2xl font-bold ${isNetIncomePositive ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${isNetIncomePositive ? 'bg-green-200' : 'bg-red-200'}`}>
                  {isNetIncomePositive ? <TrendingUp size={24} className="text-green-600" /> : <TrendingDown size={24} className="text-red-600" />}
                </div>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600">
            {t('period')}: {new Date(fromDate).toLocaleDateString()} - {new Date(toDate).toLocaleDateString()}
          </div>

          {/* Revenue Section */}
          <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('revenue')}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table 
                data={profitLoss.revenues} 
                columns={bcColumns} 
                keyExtractor={(item) => item.accountCode} 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold text-base">
              <span className="text-gray-700">{t('total_revenue')}</span>
              <span className="text-green-600 text-lg">{profitLoss.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>

          {/* Expenses Section */}
          <Card className="overflow-hidden bg-white border border-gray-200 rounded-xl">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{t('expenses')}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table 
                data={profitLoss.expenses} 
                columns={bcColumns} 
                keyExtractor={(item) => item.accountCode} 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold text-base">
              <span className="text-gray-700">{t('total_expenses')}</span>
              <span className="text-red-600 text-lg">{profitLoss.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>

          {/* Net Income Summary */}
          <Card className={`overflow-hidden ${isNetIncomePositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} rounded-xl`}>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">{t('net_income')}</p>
                  <p className={`text-3xl font-bold ${isNetIncomePositive ? 'text-green-700' : 'text-red-700'}`}>
                    {profitLoss.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className={`p-4 rounded-full ${isNetIncomePositive ? 'bg-green-200' : 'bg-red-200'}`}>
                  {isNetIncomePositive ? <TrendingUp size={32} className="text-green-600" /> : <TrendingDown size={32} className="text-red-600" />}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 sm:py-20 text-center bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-3">{t('loading_report')}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && activeTab === 'balance_sheet' && !balanceSheet && (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_data_available')}</p>
        </div>
      )}

      {!loading && activeTab === 'profit_loss' && !profitLoss && (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_data_available')}</p>
        </div>
      )}
    </div>
  );
};
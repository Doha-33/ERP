import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface ProfitLossEntry {
  id: string;
  vatNumber: string;
  vatOnSales: string;
  vatOnPurchases: string;
  netVatDue: string;
  period: string;
}

export const FinancialReports: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profit_loss');

  const [entries] = useState<ProfitLossEntry[]>([
    {
      id: '1',
      vatNumber: '1222',
      vatOnSales: '1222',
      vatOnPurchases: '1222',
      netVatDue: '1222',
      period: 'Monthly',
    },
    {
      id: '2',
      vatNumber: '122222',
      vatOnSales: '122222',
      vatOnPurchases: '122222',
      netVatDue: '122222',
      period: 'Monthly',
    },
    {
      id: '3',
      vatNumber: '112222',
      vatOnSales: '112222',
      vatOnPurchases: '112222',
      netVatDue: '112222',
      period: 'Monthly',
    },
  ]);

  const columns: Column<ProfitLossEntry>[] = [
    { header: t('vat_number'), accessorKey: 'vatNumber' },
    { header: t('vat_on_sales'), accessorKey: 'vatOnSales' },
    { header: t('vat_on_purchases'), accessorKey: 'vatOnPurchases' },
    { header: t('net_vat_due'), accessorKey: 'netVatDue' },
    { header: t('period'), accessorKey: 'period' },
  ];

  const tabs = [
    { id: 'profit_loss', label: 'profit_loss' },
    { id: 'expense', label: 'expense' },
    { id: 'information_1', label: 'information' },
    { id: 'information_2', label: 'information' },
    { id: 'information_3', label: 'information' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('financial_reports')}</h1>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={entries} filename="financial_reports" />
        </div>
      </div>

      <Card>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        {activeTab === 'profit_loss' && (
          <Table data={entries} columns={columns} keyExtractor={(item) => item.id} selectable />
        )}
        
        {activeTab !== 'profit_loss' && (
          <div className="py-12 text-center text-gray-500">
            {t('no_data_available')}
          </div>
        )}
      </Card>
    </div>
  );
};

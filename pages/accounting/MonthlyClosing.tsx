import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2 } from 'lucide-react';
import { Card, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface MonthlyClosingEntry {
  id: string;
  month: string;
  closingDate: string;
  status: 'open' | 'closed';
  closedBy: string;
  notes: string;
}

export const MonthlyClosing: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [entries] = useState<MonthlyClosingEntry[]>([
    {
      id: '1',
      month: '2025 يناير',
      closingDate: '3/12/2033',
      status: 'open',
      closedBy: 'Ahmed',
      notes: 'aaaaa',
    },
    {
      id: '2',
      month: '2025 يناير',
      closingDate: '3/12/2033',
      status: 'closed',
      closedBy: 'Ahmed',
      notes: 'aaaaa',
    },
    {
      id: '3',
      month: '2025 يناير',
      closingDate: '3/12/2033',
      status: 'closed',
      closedBy: 'Ahmed',
      notes: 'aaaaa',
    },
  ]);

  const columns: Column<MonthlyClosingEntry>[] = [
    { header: t('month'), accessorKey: 'month' },
    { header: t('closing_date'), accessorKey: 'closingDate' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Badge variant={item.status === 'open' ? 'success' : 'danger'}>
            {t(item.status)}
          </Badge>
          <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.status === 'open' ? 'bg-primary' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.status === 'open' ? (i18n.language === 'ar' ? 'left-1' : 'right-1') : (i18n.language === 'ar' ? 'right-1' : 'left-1')}`} />
          </div>
        </div>
      )
    },
    { header: t('closed_by'), accessorKey: 'closedBy' },
    { header: t('notes'), accessorKey: 'notes' },
    {
      header: t('actions'),
      render: () => (
        <button className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
          <Edit2 size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('monthly_closing')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_monthly_closing')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={entries} filename="monthly_closing" />
        </div>
      </div>

      <Card>
        <div className="flex justify-end gap-3 mb-4">
          <Input type="date" className="w-48" defaultValue="2025-02-10" />
          <Select 
            options={[{ value: '', label: t('month') }]} 
            className="w-48"
          />
        </div>
        <Table data={entries} columns={columns} keyExtractor={(item) => item.id} selectable />
      </Card>
    </div>
  );
};

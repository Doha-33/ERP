import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface LedgerEntry {
  id: string;
  account: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  runningBalance: string;
  createdBy: string;
}

export const GeneralLedger: React.FC = () => {
  const { t } = useTranslation();

  const [entries] = useState<LedgerEntry[]>([
    {
      id: '1',
      account: 'IN849',
      date: '3/12/2033',
      description: 'aaaaa',
      reference: 'aaaaa',
      debit: 123,
      credit: 123,
      runningBalance: 'aaa',
      createdBy: 'AHMRD',
    },
    {
      id: '2',
      account: 'IN849',
      date: '3/12/2033',
      description: 'aaaaa',
      reference: 'aaaaa',
      debit: 123,
      credit: 123,
      runningBalance: 'aaa',
      createdBy: 'AHMRD',
    },
    {
      id: '3',
      account: 'IN849',
      date: '3/12/2033',
      description: 'aaaaa',
      reference: 'aaaaa',
      debit: 123,
      credit: 123,
      runningBalance: 'aaa',
      createdBy: 'AHMRD',
    },
  ]);

  const columns: Column<LedgerEntry>[] = [
    { header: t('account'), accessorKey: 'account' },
    { header: t('date'), accessorKey: 'date' },
    { header: t('description'), accessorKey: 'description' },
    { header: t('reference'), accessorKey: 'reference' },
    { header: t('debit'), accessorKey: 'debit' },
    { header: t('credit'), accessorKey: 'credit' },
    { header: t('running_balance'), accessorKey: 'runningBalance' },
    { header: t('created_by'), accessorKey: 'createdBy' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('general_ledger')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_general_ledger')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={entries} filename="general_ledger" />
        </div>
      </div>

      <Card>
        <div className="flex justify-end mb-4">
          <Input type="date" className="w-48" defaultValue="2025-02-10" />
        </div>
        <Table data={entries} columns={columns} keyExtractor={(item) => item.id} />
      </Card>
    </div>
  );
};

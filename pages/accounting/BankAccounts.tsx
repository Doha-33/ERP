import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Building2, CreditCard, Wallet, Landmark } from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface BankAccount {
  id: string;
  company: string;
  accountNumber: string;
  iban: string;
  currency: string;
  bankName: string;
  branch: string;
  currentBalance: number;
  chartAccount: string;
  status: 'Active' | 'Inactive';
}

export const BankAccounts: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  const [accounts] = useState<BankAccount[]>([
    {
      id: '1',
      company: 'IN849',
      accountNumber: 'Marketing',
      iban: '111111',
      currency: 'SAR',
      bankName: 'Cash',
      branch: 'Z Supplier',
      currentBalance: 150000.00,
      chartAccount: 'eee',
      status: 'Active',
    },
    {
      id: '2',
      company: 'IN849',
      accountNumber: 'Office Supplies',
      iban: '1111111',
      currency: 'USD',
      bankName: 'Bank Transfer',
      branch: 'Z Supplier',
      currentBalance: 45000.00,
      chartAccount: 'ttttt',
      status: 'Inactive',
    },
    {
      id: '3',
      company: 'IN849',
      accountNumber: 'Office Supplies',
      iban: '11111111111',
      currency: 'SAR',
      bankName: 'Online',
      branch: 'Z Supplier',
      currentBalance: 12000.00,
      chartAccount: 'ttttt',
      status: 'Inactive',
    },
  ]);

  const columns: Column<BankAccount>[] = [
    { header: t('company'), accessorKey: 'company' },
    { header: t('account_number'), accessorKey: 'accountNumber' },
    { header: t('iban'), accessorKey: 'iban' },
    { header: t('currency'), accessorKey: 'currency' },
    { header: t('bank_name'), accessorKey: 'bankName' },
    { header: t('branch'), accessorKey: 'branch' },
    { 
      header: t('current_balance'), 
      render: (item) => `${item.currentBalance.toLocaleString()} ${item.currency}`
    },
    { header: t('chart_account'), accessorKey: 'chartAccount' },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'Active' ? 'success' : 'secondary'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedAccount(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bank_accounts')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_bank_accounts')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={accounts} filename="bank_accounts" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_bank_account')}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label={t('company')} 
            options={[{ value: 'all', label: t('company') }]} 
          />
          <Select 
            label={t('account_number')} 
            options={[{ value: 'all', label: t('account_number') }]} 
          />
        </div>
      </Card>

      <Card>
        <Table data={accounts} columns={columns} keyExtractor={(item) => item.id} selectable />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_bank_account')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select 
            label={t('company')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_number')} placeholder={t('account_number')} required />
          <Select 
            label={t('currency')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('bank_name')} placeholder={t('bank_name')} required />
          <Input label={t('branch')} placeholder={t('branch')} required />
          <Input label={t('opening_balance')} type="number" placeholder="$" required />
          <Input label={t('iban')} placeholder="33333" required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsAddModalOpen(false)}>
            <Plus size={18} className="mr-2" /> {t('add_bank_account')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_bank_account')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select 
            label={t('company')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_number')} defaultValue="Company x" required />
          <Select 
            label={t('currency')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('bank_name')} defaultValue="Company x" required />
          <Input label={t('branch')} defaultValue="branch 1" required />
          <Select 
            label={t('status')} 
            defaultValue="active"
            options={[
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
            ]} 
            required 
          />
          <Input label={t('opening_balance')} type="number" defaultValue="233" required />
          <Input label={t('iban')} defaultValue="33333" required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsEditModalOpen(false)}>{t('save')}</Button>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Account {
  id: string;
  company: string;
  bankName: string;
  accountName: string;
  accountType: string;
  accountCode: string;
  parentAccount: string;
  childrenAccount: string;
  description: string;
}

export const ChartOfAccounts: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [accounts] = useState<Account[]>([
    {
      id: '1',
      company: 'Company x',
      bankName: 'National Bank of Egypt',
      accountName: 'Accounts Receivable',
      accountType: 'Liability',
      accountCode: '111',
      parentAccount: 'Current Assets',
      childrenAccount: 'Current Assets',
      description: 'Cash in bank and in hand',
    },
    {
      id: '2',
      company: 'Company x',
      bankName: 'National Bank of Egypt',
      accountName: 'Accounts Receivable',
      accountType: 'Liability',
      accountCode: '1111',
      parentAccount: 'Current Assets',
      childrenAccount: 'Current Assets',
      description: 'Cash in bank and in hand',
    },
    {
      id: '3',
      company: 'Company x',
      bankName: 'National Bank of Egypt',
      accountName: 'Accounts Receivable',
      accountType: 'Liability',
      accountCode: '11111',
      parentAccount: 'Current Assets',
      childrenAccount: 'Current Assets',
      description: 'Cash in bank and in hand',
    },
  ]);

  const columns: Column<Account>[] = [
    { header: t('company'), accessorKey: 'company' },
    { header: t('bank_name'), accessorKey: 'bankName' },
    { header: t('account_name'), accessorKey: 'accountName' },
    { 
      header: t('account_type'), 
      render: (item) => <Badge status="info">{t(item.accountType.toLowerCase())}</Badge>
    },
    { header: t('account_code'), accessorKey: 'accountCode' },
    { header: t('parent_account'), accessorKey: 'parentAccount' },
    { header: t('children_account'), accessorKey: 'childrenAccount' },
    { header: t('description_notes'), accessorKey: 'description' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('chart_of_accounts')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_accounts_structure')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={accounts} filename="chart_of_accounts" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_account')}
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
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_account')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select 
            label={t('company')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Select 
            label={t('bank_name')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_name')} placeholder={t('account_name')} required />
          <Select 
            label={t('account_type')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_code')} placeholder={t('account_code')} required />
          <Select 
            label={t('parent_account')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
          />
          <div className="col-span-2">
            <TextArea label={t('description_notes')} placeholder={t('description_notes')} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsAddModalOpen(false)}>
            <Plus size={18} className="mr-2" /> {t('add_account')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_account')}</div>}
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
          <Select 
            label={t('bank_name')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_name')} defaultValue={selectedAccount?.accountName} required />
          <Select 
            label={t('account_type')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('account_code')} defaultValue={selectedAccount?.accountCode} required />
          <Select 
            label={t('parent_account')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
          />
          <div className="col-span-2">
            <TextArea label={t('description_notes')} defaultValue={selectedAccount?.description} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsEditModalOpen(false)}>{t('save')}</Button>
        </div>
      </Modal>
    </div>
  );
};

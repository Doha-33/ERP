import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { BankAccount } from '../../types';
import { toast } from 'sonner';

export const BankAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { bankAccounts, currencies, accountingLoading, addBankAccount, updateBankAccount, deleteBankAccount } = useData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [accountIdToDelete, setAccountIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = 
      (account.bankName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.accountNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = companyFilter ? account.company === companyFilter : true;
    
    return matchesSearch && matchesCompany;
  });

  const columns: Column<BankAccount>[] = [
    { header: t('company'), accessorKey: 'company' },
    { header: t('account_number'), accessorKey: 'accountNumber' },
    { header: t('iban'), accessorKey: 'iban' },
    { header: t('currency'), accessorKey: 'currency' },
    { header: t('bank_name'), accessorKey: 'bankName' },
    { header: t('branch'), accessorKey: 'branch' },
    { 
      header: t('current_balance'), 
      render: (item) => `${item.currentBalance?.toLocaleString() || 0} ${item.currency}`
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'secondary'}>
          {t((item.status || 'inactive').toLowerCase())}
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
          <button 
            onClick={() => { setAccountIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      bankName: formData.get('bankName'),
      accountNumber: formData.get('accountNumber'),
      iban: formData.get('iban'),
      currency: formData.get('currency'),
      branch: formData.get('branch'),
      currentBalance: Number(formData.get('currentBalance')),
      company: formData.get('company'),
      status: 'Active'
    };
    try {
      await addBankAccount(data);
      setIsAddModalOpen(false);
      toast.success(t('account_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_account'));
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAccount?._id && !selectedAccount?.id) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      bankName: formData.get('bankName'),
      accountNumber: formData.get('accountNumber'),
      iban: formData.get('iban'),
      currency: formData.get('currency'),
      branch: formData.get('branch'),
      currentBalance: Number(formData.get('currentBalance')),
      company: formData.get('company'),
      status: formData.get('status')
    };
    try {
      await updateBankAccount((selectedAccount._id || selectedAccount.id)!, data);
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      toast.success(t('account_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_account'));
    }
  };

  const handleDelete = async () => {
    if (!accountIdToDelete) return;
    try {
      await deleteBankAccount(accountIdToDelete);
      setIsDeleteModalOpen(false);
      setAccountIdToDelete(null);
      toast.success(t('account_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_account'));
    }
  };

  const companies = Array.from(new Set(bankAccounts.map(a => a.company))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bank_accounts')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_bank_accounts')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={bankAccounts} filename="bank_accounts" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_bank_account')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <Input 
            placeholder={t('search_bank_accounts')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select 
            options={[
              { value: '', label: t('all_companies') },
              ...companies.map(c => ({ value: c!, label: c! }))
            ]} 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <Table 
          data={filteredAccounts} 
          columns={columns} 
          keyExtractor={(item) => item._id || item.id} 
          isLoading={accountingLoading}
        />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_bank_account')}
      >
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('company')} name="company" placeholder="Company Name" required />
          <Input label={t('account_number')} name="accountNumber" placeholder="Account Number" required />
          <Select 
            label={t('currency')} 
            name="currency"
            options={currencies.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))} 
            required 
          />
          <Input label={t('bank_name')} name="bankName" placeholder="Bank Name" required />
          <Input label={t('branch')} name="branch" placeholder="Branch" required />
          <Input label={t('opening_balance')} name="currentBalance" type="number" placeholder="$" required />
          <Input label={t('iban')} name="iban" placeholder="IBAN" required />
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('add_bank_account')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_bank_account')}
      >
        <form onSubmit={handleEdit} className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('company')} name="company" defaultValue={selectedAccount?.company} required />
          <Input label={t('account_number')} name="accountNumber" defaultValue={selectedAccount?.accountNumber} required />
          <Select 
            label={t('currency')} 
            name="currency"
            defaultValue={selectedAccount?.currency}
            options={currencies.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))} 
            required 
          />
          <Input label={t('bank_name')} name="bankName" defaultValue={selectedAccount?.bankName} required />
          <Input label={t('branch')} name="branch" defaultValue={selectedAccount?.branch} required />
          <Select 
            label={t('status')} 
            name="status"
            defaultValue={selectedAccount?.status}
            options={[
              { value: 'Active', label: t('active') },
              { value: 'Inactive', label: t('inactive') },
            ]} 
            required 
          />
          <Input label={t('current_balance')} name="currentBalance" type="number" defaultValue={selectedAccount?.currentBalance} required />
          <Input label={t('iban')} name="iban" defaultValue={selectedAccount?.iban} required />
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('save')}</Button>
          </div>
        </form>
      </Modal>
      
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_bank_account')}
        message={t('are_you_sure_delete_bank_account')}
      />
    </div>
  );
};

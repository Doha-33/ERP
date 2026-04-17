import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Account } from '../../types';
import { AccountModal } from '../../components/accounting/AccountModal';

export const ChartOfAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { accounts, addAccount, updateAccount, deleteAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleSave = async (data: any) => {
    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount._id || selectedAccount.id, data);
      } else {
        await addAccount(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('are_you_sure_delete_account'))) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const columns: Column<Account>[] = [
    { header: t('account_code'), accessorKey: 'accountCode' },
    { header: t('account_name'), accessorKey: 'accountName' },
    { 
      header: t('account_type'), 
      render: (item) => <Badge status="info">{t(item.accountType.toLowerCase())}</Badge>
    },
    { 
      header: t('parent_account'), 
      render: (item) => {
        const parent = typeof item.parentAccountId === 'object' ? item.parentAccountId : accounts.find(a => (a._id || a.id) === item.parentAccountId);
        return parent ? `${parent.accountCode} - ${parent.accountName}` : '-';
      }
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? t('active') : t('inactive')}
        </Badge>
      )
    },
    { header: t('notes'), accessorKey: 'notes' },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedAccount(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(item._id || item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
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
          <Button onClick={() => { setSelectedAccount(null); setIsModalOpen(true); }}>
            <Plus size={20} /> {t('add_account')}
          </Button>
        </div>
      </div>

      <Card>
        <Table data={accounts} columns={columns} keyExtractor={(item) => item._id || item.id} selectable />
      </Card>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        accountToEdit={selectedAccount}
        parentAccounts={accounts}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { AccountReceivable } from '../../types';
import { AccountsReceivableModal } from '../../components/accounting/AccountsReceivableModal';
import { PaymentModal, PaymentFormData } from '../../components/accounting/PaymentModal';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export const AccountsReceivable: React.FC = () => {
  const { t } = useTranslation();
  const { 
    accountsReceivable, accountingLoading, addAccountReceivable, 
    updateAccountReceivable, deleteAccountReceivable, addARPayment 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAR, setSelectedAR] = useState<AccountReceivable | null>(null);
  const [arIdToDelete, setArIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredAR = accountsReceivable.filter(ar => {
    const matchesSearch = 
      (ar.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ar.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? ar.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (data: any) => {
    try {
      if (selectedAR) {
        await updateAccountReceivable(selectedAR._id || selectedAR.id, data);
        toast.success(t('accounts_receivable_updated_successfully'));
      } else {
        await addAccountReceivable(data);
        toast.success(t('accounts_receivable_added_successfully'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save accounts receivable:', error);
      toast.error(t('failed_to_save_accounts_receivable'));
    }
  };

  const handleDelete = async () => {
    if (!arIdToDelete) return;
    try {
      await deleteAccountReceivable(arIdToDelete);
      setIsDeleteModalOpen(false);
      setArIdToDelete(null);
      toast.success(t('accounts_receivable_deleted_successfully'));
    } catch (error) {
      console.error('Failed to delete accounts receivable:', error);
      toast.error(t('failed_to_delete_accounts_receivable'));
    }
  };

  const handleRecordPayment = async (data: PaymentFormData) => {
    try {
      await addARPayment({
        arInvoiceId: data.invoiceId,
        paymentDate: data.paymentDate,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes
      });
      setIsPaymentModalOpen(false);
      toast.success(t('payment_recorded_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_record_payment'));
    }
  };

  const columns: Column<AccountReceivable>[] = [
    { header: t('customer_name'), accessorKey: 'customerName' },
    { header: t('invoice_number'), accessorKey: 'invoiceNumber' },
    { 
      header: t('date'), 
      render: (item) => item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-'
    },
    { 
      header: t('due_date'), 
      render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'
    },
    { 
      header: t('amount'), 
      render: (item) => item.amount.toLocaleString()
    },
    { 
      header: t('paid'), 
      render: (item) => item.paidAmount.toLocaleString()
    },
    { 
      header: t('remaining_balance'), 
      render: (item) => (item.amount - item.paidAmount).toLocaleString()
    },
    {
      header: t('status'),
      render: (item) => (
        <Badge status={item.status === 'PAID' ? 'success' : item.status === 'PARTIAL' ? 'warning' : 'danger'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status !== 'PAID' && (
            <button 
              onClick={() => { setSelectedAR(item); setIsPaymentModalOpen(true); }}
              className="p-1.5 text-gray-400 hover:text-green-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
              title={t('record_payment')}
            >
              <Wallet size={16} />
            </button>
          )}
          <button 
            onClick={() => { setSelectedAR(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setArIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const pendingInvoices = accountsReceivable
    .filter(inv => inv.status !== 'PAID')
    .map(inv => ({
      id: inv._id || inv.id,
      label: `${inv.customerName} - ${inv.invoiceNumber}`,
      remainingAmount: inv.amount - inv.paidAmount
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts_receivable')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_accounts_receivable')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={accountsReceivable} filename="accounts_receivable" />
          <Button onClick={() => { setSelectedAR(null); setIsModalOpen(true); }}>
            <Plus size={20} /> {t('add_accounts_receivable')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 gap-3">
            <Input 
              placeholder={t('search_receivables')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-3">
            <Select 
              options={[
                { value: '', label: t('all_statuses') },
                { value: 'PENDING', label: t('pending') },
                { value: 'PARTIAL', label: t('partial') },
                { value: 'PAID', label: t('paid') }
              ]} 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          data={filteredAR} 
          columns={columns} 
          keyExtractor={(item) => item._id || item.id} 
          isLoading={accountingLoading}
        />
      </Card>

      <AccountsReceivableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        arToEdit={selectedAR}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedAR(null); }}
        onSubmit={handleRecordPayment}
        title={t('record_payment')}
        invoices={pendingInvoices}
        isLoading={accountingLoading}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_accounts_receivable')}
        message={t('are_you_sure_delete_accounts_receivable')}
      />
    </div>
  );
};

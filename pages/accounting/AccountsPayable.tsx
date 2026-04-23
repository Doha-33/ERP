import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { AccountPayable } from '../../types';
import { AccountsPayableModal } from '../../components/accounting/AccountsPayableModal';
import { PaymentModal, PaymentFormData } from '../../components/accounting/PaymentModal';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export const AccountsPayable: React.FC = () => {
  const { t } = useTranslation();
  const { 
    accountsPayable, accountingLoading, addAccountPayable, 
    updateAccountPayable, deleteAccountPayable, addAPPayment 
  } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AccountPayable | null>(null);
  const [apIdToDelete, setApIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  const filteredAP = accountsPayable.filter(ap => {
    const matchesSearch = 
      (ap.vendorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ap.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesVendor = vendorFilter ? ap.vendorName === vendorFilter : true;
    
    return matchesSearch && matchesVendor;
  });

  const uniqueVendors = Array.from(new Set(accountsPayable.map(ap => ap.vendorName))).filter(Boolean);

  const handleAddAP = async (data: any) => {
    try {
      await addAccountPayable(data);
      setIsAddModalOpen(false);
      toast.success(t('accounts_payable_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_accounts_payable'));
    }
  };

  const handleUpdateAP = async (data: any) => {
    const id = selectedItem?._id || selectedItem?.id;
    if (!id) return;
    try {
      await updateAccountPayable(id, data);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      toast.success(t('accounts_payable_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_accounts_payable'));
    }
  };

  const handleDeleteAP = async () => {
    if (!apIdToDelete) return;
    try {
      await deleteAccountPayable(apIdToDelete);
      setIsDeleteModalOpen(false);
      setApIdToDelete(null);
      toast.success(t('accounts_payable_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_accounts_payable'));
    }
  };

  const handleRecordPayment = async (data: PaymentFormData) => {
    try {
      await addAPPayment({
        apInvoiceId: data.invoiceId,
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

  const columns: Column<AccountPayable>[] = [
    { header: t('vendor_name'), accessorKey: 'vendorName' },
    { header: t('invoice_number'), accessorKey: 'invoiceNumber' },
    { 
      header: t('invoice_date'), 
      render: (item) => item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-' 
    },
    { 
      header: t('due_date'), 
      render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-' 
    },
    { 
      header: t('amount'), 
      render: (item) => item.amount?.toLocaleString() 
    },
    { 
      header: t('paid'), 
      render: (item) => item.paidAmount?.toLocaleString() 
    },
    { 
      header: t('balance'), 
      render: (item) => (item.amount - item.paidAmount).toLocaleString() 
    },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item) => (
        <Badge variant={item.status === 'PAID' ? 'success' : item.status === 'PENDING' ? 'danger' : 'warning'}>
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
              onClick={() => { setSelectedItem(item); setIsPaymentModalOpen(true); }}
              className="p-1.5 text-gray-400 hover:text-green-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
              title={t('record_payment')}
            >
              <Wallet size={16} />
            </button>
          )}
          <button 
            onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setApIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const pendingInvoices = accountsPayable
    .filter(inv => inv.status !== 'PAID')
    .map(inv => ({
      id: inv._id || '',
      label: `${inv.vendorName} - ${inv.invoiceNumber}`,
      remainingAmount: inv.amount - inv.paidAmount
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts_payable')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_accounts_payable')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={accountsPayable} filename="accounts_payable" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_accounts_payable')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 gap-3">
            <Input 
              placeholder={t('search_payables')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-3">
            <Select 
              options={[
                { value: '', label: t('all_vendors') },
                ...uniqueVendors.map(v => ({ value: v, label: v }))
              ]} 
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          data={filteredAP} 
          columns={columns} 
          keyExtractor={(item) => item._id || item.id} 
          isLoading={accountingLoading} 
        />
      </Card>

      <AccountsPayableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAP}
        isLoading={accountingLoading}
      />

      <AccountsPayableModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedItem(null); }}
        onSubmit={handleUpdateAP}
        initialData={selectedItem}
        isLoading={accountingLoading}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedItem(null); }}
        onSubmit={handleRecordPayment}
        title={t('record_payment')}
        invoices={pendingInvoices}
        isLoading={accountingLoading}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAP}
        title={t('delete_accounts_payable')}
        message={t('are_you_sure_delete_accounts_payable')}
      />
    </div>
  );
};

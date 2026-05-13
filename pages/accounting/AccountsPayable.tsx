import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Wallet, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { AccountPayable } from '../../types';
import { AccountsPayableModal } from '../../components/accounting/AccountsPayableModal';
import { PaymentModal, PaymentFormData } from '../../components/accounting/PaymentModal';
import { toast } from 'sonner';

export const AccountsPayable: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  const isRTL = i18n.language === 'ar';

  const filteredAP = useMemo(() => {
    return accountsPayable.filter(ap => {
      const matchesSearch = 
        (ap.vendorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ap.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesVendor = vendorFilter ? ap.vendorName === vendorFilter : true;
      
      return matchesSearch && matchesVendor;
    });
  }, [accountsPayable, searchTerm, vendorFilter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalPayables = accountsPayable.reduce((sum, ap) => sum + ap.amount, 0);
    const totalPaid = accountsPayable.reduce((sum, ap) => sum + ap.paidAmount, 0);
    const totalRemaining = totalPayables - totalPaid;
    const overdueInvoices = accountsPayable.filter(ap => {
      return ap.status !== 'PAID' && new Date(ap.dueDate) < new Date();
    }).length;
    
    return { totalPayables, totalPaid, totalRemaining, overdueInvoices };
  }, [accountsPayable]);

  const uniqueVendors = useMemo(() => {
    return Array.from(new Set(accountsPayable.map(ap => ap.vendorName))).filter(Boolean);
  }, [accountsPayable]);

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
      setSelectedItem(null);
      toast.success(t('payment_recorded_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_record_payment'));
    }
  };

  const columns: Column<AccountPayable>[] = [
    { 
      header: t('vendor_name'), 
      accessorKey: 'vendorName',
      cell: (item: AccountPayable) => (
        <span className="font-medium text-gray-900">{item.vendorName}</span>
      )
    },
    { 
      header: t('invoice_number'), 
      accessorKey: 'invoiceNumber',
      cell: (item: AccountPayable) => (
        <span className="font-mono text-sm">{item.invoiceNumber}</span>
      )
    },
    { 
      header: t('invoice_date'), 
      render: (item) => item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-',
      cell: (item: AccountPayable) => (
        <span className="whitespace-nowrap">{item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-'}</span>
      )
    },
    { 
      header: t('due_date'), 
      render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-',
      cell: (item: AccountPayable) => {
        const isOverdue = item.status !== 'PAID' && new Date(item.dueDate) < new Date();
        return (
          <span className={`whitespace-nowrap ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
            {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
            {isOverdue && <span className="ml-1 text-xs">({t('overdue')})</span>}
          </span>
        );
      }
    },
    { 
      header: t('amount'), 
      render: (item) => item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountPayable) => (
        <span className="font-semibold text-gray-900">{item.amount?.toLocaleString()}</span>
      )
    },
    { 
      header: t('paid'), 
      render: (item) => item.paidAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountPayable) => (
        <span className="text-green-600">{item.paidAmount?.toLocaleString()}</span>
      )
    },
    { 
      header: t('balance'), 
      render: (item) => (item.amount - item.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountPayable) => {
        const balance = item.amount - item.paidAmount;
        return (
          <span className={`font-semibold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {balance.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          PAID: 'success',
          PARTIAL: 'warning',
          PENDING: 'danger'
        };
        return (
          <Badge status={statusColors[item.status] || 'info'}>
            {t(item.status.toLowerCase())}
          </Badge>
        );
      }
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status !== 'PAID' && (
            <button 
              onClick={() => { setSelectedItem(item); setIsPaymentModalOpen(true); }}
              className="p-1.5 text-gray-500 hover:text-green-600 transition-colors border border-gray-300 rounded-lg"
              title={t('record_payment')}
            >
              <Wallet size={16} />
            </button>
          )}
          <button 
            onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setApIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors border border-gray-300 rounded-lg"
            title={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const pendingInvoices = useMemo(() => {
    return accountsPayable
      .filter(inv => inv.status !== 'PAID')
      .map(inv => ({
        id: inv._id || inv.id || '',
        label: `${inv.vendorName} - ${inv.invoiceNumber}`,
        remainingAmount: inv.amount - inv.paidAmount
      }));
  }, [accountsPayable]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('accounts_payable')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_your_accounts_payable')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={accountsPayable} filename="accounts_payable" />
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t('add_accounts_payable')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('total_payables')}</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalPayables.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('total_paid')}</p>
          <p className="text-2xl font-bold text-green-600">{summary.totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('remaining_balance')}</p>
          <p className="text-2xl font-bold text-orange-600">{summary.totalRemaining.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('overdue_invoices')}</p>
          <p className={`text-2xl font-bold ${summary.overdueInvoices > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {summary.overdueInvoices}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white rounded-lg border border-gray-200">
        <div className="flex-1">
          <Input 
            placeholder={t('search_payables')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            fullWidth
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            options={[
              { value: '', label: t('all_vendors') },
              ...uniqueVendors.map(v => ({ value: v, label: v }))
            ]} 
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table 
            data={filteredAP} 
            columns={columns} 
            keyExtractor={(item) => item._id || item.id || ''} 
            isLoading={accountingLoading} 
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredAP.length === 0 && !accountingLoading && (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_payables_found')}</p>
        </div>
      )}

      {/* Modals */}
      <AccountsPayableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAP}
        isLoading={accountingLoading}
      />

      <AccountsPayableModal
        isOpen={isEditModalOpen}
        onClose={() => { 
          setIsEditModalOpen(false); 
          setSelectedItem(null); 
        }}
        onSubmit={handleUpdateAP}
        initialData={selectedItem}
        isLoading={accountingLoading}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { 
          setIsPaymentModalOpen(false); 
          setSelectedItem(null); 
        }}
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
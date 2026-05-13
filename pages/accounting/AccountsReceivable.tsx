import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Wallet, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { AccountReceivable } from '../../types';
import { AccountsReceivableModal } from '../../components/accounting/AccountsReceivableModal';
import { PaymentModal, PaymentFormData } from '../../components/accounting/PaymentModal';
import { toast } from 'sonner';

export const AccountsReceivable: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  const isRTL = i18n.language === 'ar';

  const filteredAR = useMemo(() => {
    return accountsReceivable.filter(ar => {
      const matchesSearch = 
        (ar.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ar.invoiceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter ? ar.status === statusFilter : true;
      
      return matchesSearch && matchesStatus;
    });
  }, [accountsReceivable, searchTerm, statusFilter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalReceivables = accountsReceivable.reduce((sum, ar) => sum + ar.amount, 0);
    const totalPaid = accountsReceivable.reduce((sum, ar) => sum + ar.paidAmount, 0);
    const totalRemaining = totalReceivables - totalPaid;
    const overdueInvoices = accountsReceivable.filter(ar => {
      return ar.status !== 'PAID' && new Date(ar.dueDate) < new Date();
    }).length;
    
    return { totalReceivables, totalPaid, totalRemaining, overdueInvoices };
  }, [accountsReceivable]);

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
      setSelectedAR(null);
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
      setSelectedAR(null);
      toast.success(t('payment_recorded_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_record_payment'));
    }
  };

  const columns: Column<AccountReceivable>[] = [
    { 
      header: t('customer_name'), 
      accessorKey: 'customerName',
      cell: (item: AccountReceivable) => (
        <span className="font-medium text-gray-900">{item.customerName}</span>
      )
    },
    { 
      header: t('invoice_number'), 
      accessorKey: 'invoiceNumber',
      cell: (item: AccountReceivable) => (
        <span className="font-mono text-sm">{item.invoiceNumber}</span>
      )
    },
    { 
      header: t('date'), 
      render: (item) => item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-',
      cell: (item: AccountReceivable) => (
        <span className="whitespace-nowrap">{item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : '-'}</span>
      )
    },
    { 
      header: t('due_date'), 
      render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-',
      cell: (item: AccountReceivable) => {
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
      render: (item) => item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountReceivable) => (
        <span className="font-semibold text-gray-900">{item.amount.toLocaleString()}</span>
      )
    },
    { 
      header: t('paid'), 
      render: (item) => item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountReceivable) => (
        <span className="text-green-600">{item.paidAmount.toLocaleString()}</span>
      )
    },
    { 
      header: t('remaining_balance'), 
      render: (item) => (item.amount - item.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cell: (item: AccountReceivable) => {
        const remaining = item.amount - item.paidAmount;
        return (
          <span className={`font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {remaining.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: t('status'),
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
              onClick={() => { setSelectedAR(item); setIsPaymentModalOpen(true); }}
              className="p-1.5 text-gray-500 hover:text-green-600 transition-colors border border-gray-300 rounded-lg"
              title={t('record_payment')}
            >
              <Wallet size={16} />
            </button>
          )}
          <button 
            onClick={() => { setSelectedAR(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setArIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
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
    return accountsReceivable
      .filter(inv => inv.status !== 'PAID')
      .map(inv => ({
        id: inv._id || inv.id,
        label: `${inv.customerName} - ${inv.invoiceNumber}`,
        remainingAmount: inv.amount - inv.paidAmount
      }));
  }, [accountsReceivable]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('accounts_receivable')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_your_accounts_receivable')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={accountsReceivable} filename="accounts_receivable" />
          </div>
          <Button 
            onClick={() => { setSelectedAR(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t('add_accounts_receivable')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('total_receivables')}</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalReceivables.toLocaleString()}</p>
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
            placeholder={t('search_receivables')} 
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
              { value: '', label: t('all_statuses') },
              { value: 'PENDING', label: t('pending') },
              { value: 'PARTIAL', label: t('partial') },
              { value: 'PAID', label: t('paid') }
            ]} 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table 
            data={filteredAR} 
            columns={columns} 
            keyExtractor={(item) => item._id || item.id || ''} 
            isLoading={accountingLoading}
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredAR.length === 0 && !accountingLoading && (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">{t('no_receivables_found')}</p>
        </div>
      )}

      {/* Modals */}
      <AccountsReceivableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAR(null);
        }}
        onSave={handleSave}
        arToEdit={selectedAR}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { 
          setIsPaymentModalOpen(false); 
          setSelectedAR(null); 
        }}
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
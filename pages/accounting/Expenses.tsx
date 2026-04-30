import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, DollarSign, CreditCard, Receipt, Calendar, Building2, FileText, Paperclip, Trash2, Edit2, Percent } from 'lucide-react';
import { Button, Input, Badge, StatCard, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ExpenseFormModal } from '../../components/accounting/ExpenseFormModal';
import { useData } from '../../context/DataContext';
import { Expense as ExpenseType } from '../../types';
import { toast } from 'sonner';

export const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const { expenses, accountingLoading, addExpense, updateExpense, deleteExpense } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseType | null>(null);
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      (expense.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (expense.payee?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (expense.vendorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (expense.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const completedExpense = expenses.filter(e => e.status === 'Completed' || e.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingExpense = expenses.filter(e => e.status === 'Pending' || e.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  const handleSave = async (data: Partial<ExpenseType>) => {
    try {
      const processedData = {
        ...data
      };

      if (selectedExpense) {
        await updateExpense(selectedExpense._id || selectedExpense.id!, processedData);
        toast.success(t('expense_updated_successfully'));
      } else {
        await addExpense(processedData);
        toast.success(t('expense_added_successfully'));
      }
      setIsModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error(t('failed_to_save_expense'));
    }
  };

  const handleDelete = async () => {
    if (!expenseIdToDelete) return;
    try {
      await deleteExpense(expenseIdToDelete);
      setIsDeleteModalOpen(false);
      setExpenseIdToDelete(null);
      toast.success(t('expense_deleted_successfully'));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error(t('failed_to_delete_expense'));
    }
  };

  const getStatusBadge = (status: string) => {
    const isCompleted = status === 'Completed' || status === 'COMPLETED';
    const statusMap: Record<string, { label: string; color: string }> = {
      Completed: { label: t("completed"), color: "green" },
      Pending: { label: t("pending"), color: "orange" },
    };

    const { label, color } = statusMap[status] || { 
      label: status || t("pending"), 
      color: "gray" 
    };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span>{label}</span>
      </div>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap: Record<string, { label: string; color: string }> = {
      Cash: { label: t("cash"), color: "green" },
      "Bank Transfer": { label: t("bank_transfer"), color: "blue" },
      Card: { label: t("card"), color: "purple" },
      Online: { label: t("online"), color: "orange" },
    };

    const { label, color } = methodMap[method] || { label: method || t("unknown"), color: "gray" };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <CreditCard size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; color: string }> = {
      Supplies: { label: t("supplies"), color: "blue" },
      Rent: { label: t("rent"), color: "purple" },
      Utilities: { label: t("utilities"), color: "cyan" },
      Salaries: { label: t("salaries"), color: "green" },
      Marketing: { label: t("marketing"), color: "pink" },
      Travel: { label: t("travel"), color: "orange" },
      Equipment: { label: t("equipment"), color: "indigo" },
      Other: { label: t("other_expense"), color: "gray" },
    };

    const { label, color } = categoryMap[category] || { label: category || t("other"), color: "gray" };

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
      green: "bg-green-50 text-green-700 border-green-200",
      pink: "bg-pink-50 text-pink-700 border-pink-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Building2 size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const columns: Column<ExpenseType>[] = [
    { 
      header: t('expense_id'), 
      accessorKey: 'expenseId',
      render: (item) => (
        <span className="text-xs font-mono text-gray-500">{item.expenseId || '-'}</span>
      )
    },
    { 
      header: t('date'), 
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar size={12} className="text-gray-400" />
          <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      header: t('category'), 
      render: (item) => getCategoryBadge(item.category)
    },
    { 
      header: t('payee'), 
      accessorKey: 'payee',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Building2 size={12} className="text-gray-400" />
          <span className="text-sm">{item.payee || item.vendorName}</span>
        </div>
      )
    },
    { 
      header: t('payment_method'), 
      render: (item) => getPaymentMethodBadge(item.paymentMethod)
    },
    { 
      header: t('note'), 
      accessorKey: 'note',
      render: (item) => (
        <div className="max-w-[150px] truncate cursor-help" title={item.note}>
          {item.note?.length > 15 ? `${item.note.substring(0, 15)}...` : item.note}
        </div>
      )
    },
    { 
      header: t('vat_percent'), 
      render: (item) => item.vatPercent ? `${item.vatPercent}%` : '-'
    },
    { 
      header: t('vat_amount'), 
      render: (item) => item.vatAmount ? `${item.vatAmount.toLocaleString()} USD` : '-'
    },
    { 
      header: t('amount'), 
      render: (item) => (
        <div className="font-medium text-red-600">
          {item.amount?.toLocaleString()} USD
        </div>
      )
    },
    { 
      header: t('status'), 
      render: (item) => getStatusBadge(item.status)
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedExpense(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              setExpenseIdToDelete(item._id || item.id!);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('expenses')}</h1>
          <p className="text-gray-500">{t('manage_your_expenses')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={expenses} filename="expenses" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedExpense(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_expense')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title={t('total_expenses')} 
          value={`${totalExpense.toLocaleString()} USD`} 
          icon={<DollarSign size={20} />} 
          color="blue" 
        />
        <StatCard 
          title={t('completed_expenses')} 
          value={`${completedExpense.toLocaleString()} USD`} 
          icon={<CreditCard size={20} />} 
          color="green" 
        />
        <StatCard 
          title={t('pending_expenses')} 
          value={`${pendingExpense.toLocaleString()} USD`} 
          icon={<DollarSign size={20} />} 
          color="orange" 
        />
        <StatCard 
          title={t('no_of_transactions')} 
          value={expenses.length} 
          icon={<Receipt size={20} />} 
          color="green" 
        />
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center bg-white rounded-lg border border-gray-100">
        <Input 
          placeholder={t('search_expenses')} 
          icon={<Search size={18} />} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredExpenses} 
        keyExtractor={(item) => item._id || item.id!}
        isLoading={accountingLoading}
        selectable
      />

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        selectedExpense={selectedExpense}
        onSave={handleSave}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_expense')}
        message={t('are_you_sure_delete_expense')}
      />
    </div>
  );
};
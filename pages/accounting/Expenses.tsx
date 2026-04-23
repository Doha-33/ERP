import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, DollarSign, CreditCard, Receipt, Building2, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Expense as ExpenseType } from '../../types';
import { toast } from 'sonner';

export const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const { expenses, accountingLoading, addExpense, updateExpense, deleteExpense } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseType | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      (expense.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (expense.vendorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (expense.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const completedExpense = expenses.filter(e => e.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingExpense = expenses.filter(e => e.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  const columns: Column<ExpenseType>[] = [
    { 
      header: t('date'), 
      render: (item) => new Date(item.date).toLocaleDateString()
    },
    { header: t('category'), accessorKey: 'category' },
    { header: t('vendor_name'), accessorKey: 'vendorName' },
    { header: t('payment_method'), accessorKey: 'paymentMethod' },
    { header: t('note'), accessorKey: 'note' },
    { 
      header: t('amount'), 
      render: (item) => `${item.amount?.toLocaleString()} ${t('usd')}`
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'COMPLETED' ? 'success' : 'warning'}>
          {t(item.status?.toLowerCase() || 'pending')}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedRecord(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setRecordIdToDelete(item._id || item.id || ''); setIsDeleteModalOpen(true); }}
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
      date: formData.get('date'),
      amount: Number(formData.get('amount')),
      vendorName: formData.get('vendorName'),
      category: formData.get('category'),
      paymentMethod: formData.get('paymentMethod'),
      note: formData.get('note'),
      status: formData.get('status') || 'PENDING'
    };
    try {
      await addExpense(data);
      setIsAddModalOpen(false);
      toast.success(t('expense_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_expense'));
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = selectedRecord?._id || selectedRecord?.id;
    if (!id) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get('date'),
      amount: Number(formData.get('amount')),
      vendorName: formData.get('vendorName'),
      category: formData.get('category'),
      paymentMethod: formData.get('paymentMethod'),
      note: formData.get('note'),
      status: formData.get('status')
    };
    try {
      await updateExpense(id, data);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      toast.success(t('expense_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_expense'));
    }
  };

  const handleDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await deleteExpense(recordIdToDelete);
      setIsDeleteModalOpen(false);
      setRecordIdToDelete(null);
      toast.success(t('expense_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_expense'));
    }
  };

  const categories = Array.from(new Set(expenses.map(e => e.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('expenses')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_expenses')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={expenses} filename="expenses" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_expenses')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title={t('total_expenses')} value={`${totalExpense.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="blue" />
        <StatCard title={t('completed_expenses')} value={`${completedExpense.toLocaleString()} USD`} icon={<CreditCard size={20} />} color="green" />
        <StatCard title={t('pending_expenses')} value={`${pendingExpense.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="orange" />
        <StatCard title={t('no_of_transactions')} value={expenses.length} icon={<Receipt size={20} />} color="green" />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 gap-3">
            <Input 
              placeholder={t('search_expenses')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-3">
            <Select 
              options={[
                { value: '', label: t('all_categories') },
                ...categories.map(c => ({ value: c, label: c }))
              ]} 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          data={filteredExpenses} 
          columns={columns} 
          keyExtractor={(item) => item._id || ''} 
          isLoading={accountingLoading}
        />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_expenses')}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} name="date" type="date" required />
            <Input label={t('amount')} name="amount" type="number" required />
            <Input label={t('vendor_name')} name="vendorName" placeholder="Office Depot" required />
            <Input label={t('category')} name="category" placeholder="Supplies" required />
            <Select 
              label={t('payment_method')} 
              name="paymentMethod"
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK', label: 'Bank Transfer' },
                { value: 'CARD', label: 'Card' },
                { value: 'ONLINE', label: 'Online' }
              ]} 
              required 
            />
            <Select 
              label={t('status')} 
              name="status"
              options={[
                { value: 'PENDING', label: t('pending') },
                { value: 'COMPLETED', label: t('completed') }
              ]} 
              required 
            />
          </div>
          <TextArea label={t('note')} name="note" placeholder="Office supplies" required />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('add_expenses')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_expenses')}
      >
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} name="date" type="date" defaultValue={selectedRecord?.date?.split('T')[0]} required />
            <Input label={t('amount')} name="amount" type="number" defaultValue={selectedRecord?.amount} required />
            <Input label={t('vendor_name')} name="vendorName" defaultValue={selectedRecord?.vendorName} required />
            <Input label={t('category')} name="category" defaultValue={selectedRecord?.category} required />
            <Select 
              label={t('payment_method')} 
              name="paymentMethod"
              defaultValue={selectedRecord?.paymentMethod}
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK', label: 'Bank Transfer' },
                { value: 'CARD', label: 'Card' },
                { value: 'ONLINE', label: 'Online' }
              ]} 
              required 
            />
            <Select 
              label={t('status')} 
              name="status"
              defaultValue={selectedRecord?.status}
              options={[
                { value: 'PENDING', label: t('pending') },
                { value: 'COMPLETED', label: t('completed') }
              ]} 
              required 
            />
          </div>
          <TextArea label={t('note')} name="note" defaultValue={selectedRecord?.note} required />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('save')}</Button>
          </div>
        </form>
      </Modal>

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

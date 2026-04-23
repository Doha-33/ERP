import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, DollarSign, CreditCard, Receipt, Users, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Income as IncomeType } from '../../types';
import { toast } from 'sonner';

export const Income: React.FC = () => {
  const { t } = useTranslation();
  const { incomes, accountingLoading, addIncome, updateIncome, deleteIncome } = useData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IncomeType | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = 
      (income.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (income.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (income.source?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesSource = sourceFilter ? income.source === sourceFilter : true;
    
    return matchesSearch && matchesSource;
  });

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const completedIncome = incomes.filter(i => i.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingIncome = incomes.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  const columns: Column<IncomeType>[] = [
    { 
      header: t('date'), 
      render: (item) => new Date(item.date).toLocaleDateString()
    },
    { header: t('note'), accessorKey: 'note' },
    { header: t('source'), accessorKey: 'source' },
    { header: t('company_name'), accessorKey: 'companyName' },
    { header: t('payment_method'), accessorKey: 'paymentMethod' },
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
      source: formData.get('source'),
      companyName: formData.get('companyName'),
      paymentMethod: formData.get('paymentMethod'),
      note: formData.get('note'),
      status: formData.get('status') || 'PENDING'
    };
    try {
      await addIncome(data);
      setIsAddModalOpen(false);
      toast.success(t('income_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_income'));
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
      source: formData.get('source'),
      companyName: formData.get('companyName'),
      paymentMethod: formData.get('paymentMethod'),
      note: formData.get('note'),
      status: formData.get('status')
    };
    try {
      await updateIncome(id, data);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      toast.success(t('income_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_income'));
    }
  };

  const handleDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await deleteIncome(recordIdToDelete);
      setIsDeleteModalOpen(false);
      setRecordIdToDelete(null);
      toast.success(t('income_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_income'));
    }
  };

  const uniqueSources = Array.from(new Set(incomes.map(i => i.source))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('income')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_income')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={incomes} filename="income" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_income')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title={t('total_income')} value={`${totalIncome.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="blue" />
        <StatCard title={t('completed_income')} value={`${completedIncome.toLocaleString()} USD`} icon={<CreditCard size={20} />} color="green" />
        <StatCard title={t('pending_income')} value={`${pendingIncome.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="orange" />
        <StatCard title={t('no_of_transactions')} value={incomes.length} icon={<Receipt size={20} />} color="green" />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 gap-3">
            <Input 
              placeholder={t('search_income')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-3">
            <Select 
              options={[
                { value: '', label: t('all_sources') },
                ...uniqueSources.map(s => ({ value: s, label: s }))
              ]} 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          data={filteredIncomes} 
          columns={columns} 
          keyExtractor={(item) => item._id || ''} 
          isLoading={accountingLoading}
        />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_income')}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} name="date" type="date" required />
            <Input label={t('amount')} name="amount" type="number" required />
            <Input label={t('source')} name="source" placeholder="Freelance" required />
            <Input label={t('company_name')} name="companyName" placeholder="XYZ Corp" required />
            <Select 
              label={t('payment_method')} 
              name="paymentMethod"
              options={[
                { value: 'BANK', label: 'Bank Transfer' },
                { value: 'CASH', label: 'Cash' },
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
          <TextArea label={t('note')} name="note" placeholder="Software development" required />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('add_income')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_income')}
      >
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} name="date" type="date" defaultValue={selectedRecord?.date?.split('T')[0]} required />
            <Input label={t('amount')} name="amount" type="number" defaultValue={selectedRecord?.amount} required />
            <Input label={t('source')} name="source" defaultValue={selectedRecord?.source} required />
            <Input label={t('company_name')} name="companyName" defaultValue={selectedRecord?.companyName} required />
            <Select 
              label={t('payment_method')} 
              name="paymentMethod"
              defaultValue={selectedRecord?.paymentMethod}
              options={[
                { value: 'BANK', label: 'Bank Transfer' },
                { value: 'CASH', label: 'Cash' },
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
        title={t('delete_income')}
        message={t('are_you_sure_delete_income')}
      />
    </div>
  );
};

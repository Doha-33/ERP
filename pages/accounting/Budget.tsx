import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, DollarSign, CreditCard, Receipt, BarChart3, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Budget as BudgetType } from '../../types';
import { toast } from 'sonner';

export const Budget: React.FC = () => {
  const { t } = useTranslation();
  const { budgets, accountingLoading, addBudget, updateBudget, deleteBudget } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BudgetType | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBudgets = budgets.filter(budget => 
    (budget.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (budget.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalBudgeted = budgets.reduce((acc, curr) => acc + (curr.budgetedAmount || 0), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + (curr.spentAmount || 0), 0);
  const totalRemaining = totalBudgeted - totalSpent;

  const columns: Column<BudgetType>[] = [
    { header: t('name'), accessorKey: 'name' },
    { header: t('category'), accessorKey: 'category' },
    { header: t('period'), accessorKey: 'period' },
    { 
      header: t('budgeted_amount'), 
      render: (item) => `${item.budgetedAmount?.toLocaleString()} ${t('usd')}`
    },
    { 
      header: t('spent_amount'), 
      render: (item) => `${item.spentAmount?.toLocaleString()} ${t('usd')}`
    },
    { 
      header: t('utilization'), 
      render: (item) => {
        const utilization = item.budgetedAmount > 0 ? (item.spentAmount / item.budgetedAmount) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  utilization > 90 ? 'bg-red-500' : utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`} 
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{Math.round(utilization)}%</span>
          </div>
        );
      }
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'ACTIVE' ? 'success' : 'danger'}>
          {t(item.status?.toLowerCase() || 'active')}
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
      name: formData.get('name'),
      category: formData.get('category'),
      budgetedAmount: Number(formData.get('budgetedAmount')),
      period: formData.get('period'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: 'ACTIVE'
    };
    try {
      await addBudget(data);
      setIsAddModalOpen(false);
      toast.success(t('budget_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_budget'));
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = selectedRecord?._id || selectedRecord?.id;
    if (!id) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      category: formData.get('category'),
      budgetedAmount: Number(formData.get('budgetedAmount')),
      period: formData.get('period'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      status: formData.get('status')
    };
    try {
      await updateBudget(id, data);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      toast.success(t('budget_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_budget'));
    }
  };

  const handleDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await deleteBudget(recordIdToDelete);
      setIsDeleteModalOpen(false);
      setRecordIdToDelete(null);
      toast.success(t('budget_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_budget'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('budget')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_budgets')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={budgets} filename="budgets" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_budget')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title={t('total_budgeted')} value={`${totalBudgeted.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="blue" />
        <StatCard title={t('total_spent')} value={`${totalSpent.toLocaleString()} USD`} icon={<CreditCard size={20} />} color="orange" />
        <StatCard title={t('total_remaining')} value={`${totalRemaining.toLocaleString()} USD`} icon={<DollarSign size={20} />} color="green" />
        <StatCard title={t('active_budgets')} value={budgets.filter(b => b.status === 'ACTIVE').length} icon={<BarChart3 size={20} />} color="blue" />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex flex-1 gap-3">
            <Input 
              placeholder={t('search_budgets')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>
        <Table 
          data={filteredBudgets} 
          columns={columns} 
          keyExtractor={(item) => item._id || ''} 
          isLoading={accountingLoading}
        />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_budget')}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          <Input label={t('name')} name="name" placeholder="Office Supplies 2026" required fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('category')} name="category" placeholder="Supplies" required />
            <Input label={t('budgeted_amount')} name="budgetedAmount" type="number" required />
            <Select 
              label={t('period')} 
              name="period"
              options={[
                { value: 'MONTHLY', label: t('monthly') },
                { value: 'QUARTERLY', label: t('quarterly') },
                { value: 'YEARLY', label: t('yearly') }
              ]} 
              required 
            />
            <Input label={t('start_date')} name="startDate" type="date" required />
            <Input label={t('end_date')} name="endDate" type="date" required />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('create_budget')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_budget')}
      >
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <Input label={t('name')} name="name" defaultValue={selectedRecord?.name} required fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('category')} name="category" defaultValue={selectedRecord?.category} required />
            <Input label={t('budgeted_amount')} name="budgetedAmount" type="number" defaultValue={selectedRecord?.budgetedAmount} required />
            <Select 
              label={t('period')} 
              name="period"
              defaultValue={selectedRecord?.period}
              options={[
                { value: 'MONTHLY', label: t('monthly') },
                { value: 'QUARTERLY', label: t('quarterly') },
                { value: 'YEARLY', label: t('yearly') }
              ]} 
              required 
            />
            <Select 
              label={t('status')} 
              name="status"
              defaultValue={selectedRecord?.status}
              options={[
                { value: 'ACTIVE', label: t('active') },
                { value: 'COMPLETED', label: t('completed') },
                { value: 'CLOSED', label: t('closed') }
              ]} 
              required 
            />
            <Input label={t('start_date')} name="startDate" type="date" defaultValue={selectedRecord?.startDate?.split('T')[0]} required />
            <Input label={t('end_date')} name="endDate" type="date" defaultValue={selectedRecord?.endDate?.split('T')[0]} required />
          </div>
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
        title={t('delete_budget')}
        message={t('are_you_sure_delete_budget')}
      />
    </div>
  );
};

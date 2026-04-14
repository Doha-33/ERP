import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, DollarSign, CreditCard, Receipt, Users, Building2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge, StatCard, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  payee: string;
  paymentMethod: string;
  note: string;
  vatPercent: string;
  vatAmount: number;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
}

export const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExpenseRecord | null>(null);

  const [records] = useState<ExpenseRecord[]>([
    {
      id: 'IN849',
      date: '3/12/2033',
      category: 'Marketing',
      payee: 'Z Supplier',
      paymentMethod: 'Cash',
      note: 'Service Maintenance',
      vatPercent: '2%',
      vatAmount: 344,
      amount: 500.00,
      status: 'Paid',
    },
    {
      id: 'IN850',
      date: '3/12/2033',
      category: 'Office Supplies',
      payee: 'Z Supplier',
      paymentMethod: 'Bank Transfer',
      note: 'tttt',
      vatPercent: '2%',
      vatAmount: 344,
      amount: 500.00,
      status: 'Unpaid',
    },
    {
      id: 'IN851',
      date: '3/12/2033',
      category: 'Office Supplies',
      payee: 'Z Supplier',
      paymentMethod: 'Online',
      note: 'tttt',
      vatPercent: '2%',
      vatAmount: 344,
      amount: 500.00,
      status: 'Partial',
    },
  ]);

  const columns: Column<ExpenseRecord>[] = [
    { header: 'ID', accessorKey: 'id' },
    { header: t('date'), accessorKey: 'date' },
    { header: t('category'), accessorKey: 'category' },
    { header: t('payee'), accessorKey: 'payee' },
    { header: t('payment_method'), accessorKey: 'paymentMethod' },
    { header: t('note'), accessorKey: 'note' },
    { header: t('vat_percent'), accessorKey: 'vatPercent' },
    { header: t('vat_amount'), accessorKey: 'vatAmount' },
    { 
      header: t('amount'), 
      render: (item) => `${item.amount.toFixed(2)} USD`
    },
    { 
      header: t('status'), 
      render: (item) => {
        const variants: Record<string, string> = {
          'Paid': 'success',
          'Unpaid': 'danger',
          'Partial': 'warning'
        };
        return <Badge status={variants[item.status]}>{t(item.status.toLowerCase())}</Badge>;
      }
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
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('expenses')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_expenses')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={records} filename="expenses" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_expenses')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title={t('total_expenses')} value="$25,430" icon={<DollarSign size={20} />} color="blue" />
        <StatCard title={t('paid_expenses')} value="$22,230" icon={<CreditCard size={20} />} color="green" />
        <StatCard title={t('no_of_transactions')} value="145" icon={<Receipt size={20} />} color="green" />
        <StatCard title={t('pending_expenses')} value="$22,230" icon={<DollarSign size={20} />} color="orange" />
        <StatCard title={t('top_vendor')} value="Z Supplier" icon={<Building2 size={20} />} color="blue" />
      </div>

      <Card>
        <div className="flex justify-end gap-3 mb-4">
          <Input type="date" className="w-48" />
          <Select options={[{ value: 'id', label: 'ID' }]} className="w-32" />
          <Select options={[{ value: 'states', label: 'States' }]} className="w-32" />
        </div>
        <Table data={records} columns={columns} keyExtractor={(item) => item.id} />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_expenses')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="ID" placeholder="32243" required />
          <Input label={t('date')} type="date" required />
          <Input label={t('category')} placeholder="Company x" required />
          <Input label={t('payee')} placeholder="Company x" required />
          <Select label={t('payment_method')} options={[{ value: 'cash', label: 'Cash' }]} required />
          <Select label={t('status')} options={[{ value: 'paid', label: 'Paid' }]} required />
          <Input label="VAT %" placeholder="2%" required />
          <Input label="VAT Amount" placeholder="3444$" required />
          <Input label={t('amount')} placeholder="233$" required />
          <div className="col-span-2">
            <Input label={t('notes')} placeholder={t('notes')} required />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsAddModalOpen(false)}>{t('add_expenses')}</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_expenses')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="ID" defaultValue={selectedRecord?.id} required />
          <Input label={t('date')} type="date" defaultValue={selectedRecord?.date} required />
          <Input label={t('category')} defaultValue={selectedRecord?.category} required />
          <Input label={t('payee')} defaultValue={selectedRecord?.payee} required />
          <Select label={t('payment_method')} options={[{ value: 'cash', label: 'Cash' }]} defaultValue={selectedRecord?.paymentMethod.toLowerCase()} required />
          <Select label={t('status')} options={[{ value: 'paid', label: 'Paid' }]} defaultValue={selectedRecord?.status.toLowerCase()} required />
          <Input label="VAT %" defaultValue={selectedRecord?.vatPercent} required />
          <Input label="VAT Amount" defaultValue={selectedRecord?.vatAmount} required />
          <Input label={t('amount')} defaultValue={selectedRecord?.amount} required />
          <div className="col-span-2">
            <Input label={t('notes')} defaultValue={selectedRecord?.note} required />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsEditModalOpen(false)}>{t('save')}</Button>
        </div>
      </Modal>
    </div>
  );
};

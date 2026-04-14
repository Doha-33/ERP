import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, DollarSign, FileText } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface VehicleExpense {
  id: string;
  vehicle: string;
  type: string;
  amount: string;
  date: string;
  description: string;
  status: 'paid' | 'pending';
}

export const VehicleExpenses: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<VehicleExpense | null>(null);

  const expenses: VehicleExpense[] = [
    {
      id: 'EXP-001',
      vehicle: 'V-001 (Toyota Corolla)',
      type: 'Insurance',
      amount: '5,000 EGP',
      date: '2025-01-01',
      description: 'Annual insurance premium',
      status: 'paid',
    },
    {
      id: 'EXP-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      type: 'Registration',
      amount: '2,500 EGP',
      date: '2025-01-05',
      description: 'Vehicle registration renewal',
      status: 'pending',
    },
  ];

  const columns = [
    { header: t('expense_id'), accessorKey: 'id' as keyof VehicleExpense },
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof VehicleExpense },
    { header: t('type'), accessorKey: 'type' as keyof VehicleExpense },
    { header: t('amount'), accessorKey: 'amount' as keyof VehicleExpense },
    { header: t('date'), accessorKey: 'date' as keyof VehicleExpense },
    {
      header: t('status'),
      accessorKey: 'status' as keyof VehicleExpense,
      render: (item: VehicleExpense) => (
        <Badge
          variant={item.status === 'paid' ? 'success' : 'warning'}
        >
          {t(item.status)}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof VehicleExpense,
      render: (item: VehicleExpense) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedExpense(item);
              setIsModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-blue-600"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicle_expenses')}</h1>
          <p className="text-gray-500">{t('manage_vehicle_expenses')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedExpense(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_vehicle_expense')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder={t('search_placeholder')} className="pl-10 w-64" />
            </div>
            <Select
              options={[
                { label: t('all_statuses'), value: 'all' },
                { label: t('paid'), value: 'paid' },
                { label: t('pending'), value: 'pending' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={expenses} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedExpense ? t('edit_vehicle_expense') : t('add_vehicle_expense')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('vehicle')} *</label>
              <Select
                options={[
                  { label: 'V-001 (Toyota Corolla)', value: 'V-001' },
                  { label: 'V-002 (Hyundai Elantra)', value: 'V-002' },
                ]}
                defaultValue={selectedExpense?.vehicle}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('type')} *</label>
              <Select
                options={[
                  { label: 'Insurance', value: 'insurance' },
                  { label: 'Registration', value: 'registration' },
                  { label: 'Taxes', value: 'taxes' },
                  { label: 'Other', value: 'other' },
                ]}
                defaultValue={selectedExpense?.type}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('amount')} *</label>
              <Input defaultValue={selectedExpense?.amount} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('date')} *</label>
              <Input type="date" defaultValue={selectedExpense?.date} required />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('description')}</label>
              <TextArea defaultValue={selectedExpense?.description} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('paid'), value: 'paid' },
                  { label: t('pending'), value: 'pending' },
                ]}
                defaultValue={selectedExpense?.status}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('upload_attachment')}</label>
              <Input type="file" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedExpense ? t('save') : t('add_vehicle_expense')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

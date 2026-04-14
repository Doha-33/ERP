
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown, Calendar } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Deal {
  id: string;
  dealName: string;
  customer: string;
  dealValue: string;
  stage: 'Negotiation' | 'Proposal' | 'Won';
  closingDate: string;
  salesOwner: string;
}

export const Deals: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      dealName: 'D-001',
      customer: 'V-001',
      dealValue: '34333$',
      stage: 'Negotiation',
      closingDate: '2026-04-22',
      salesOwner: 'mohamed',
    },
    {
      id: '2',
      dealName: '',
      customer: '',
      dealValue: '',
      stage: 'Proposal',
      closingDate: '',
      salesOwner: '',
    },
    {
      id: '3',
      dealName: '',
      customer: '',
      dealValue: '',
      stage: 'Won',
      closingDate: '',
      salesOwner: '',
    },
  ]);

  const columns: Column<Deal>[] = [
    { header: t('deal_name'), accessorKey: 'dealName' },
    { header: t('customer'), accessorKey: 'customer' },
    { header: t('deal_value'), accessorKey: 'dealValue' },
    { 
      header: t('stage'), 
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">{item.stage}</span>
      )
    },
    { header: t('closing_date'), accessorKey: 'closingDate' },
    { header: t('sales_owner'), accessorKey: 'salesOwner' },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedDeal(item); setIsEditModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('deals')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_deals')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_deals')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('deal_name')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={deals}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_deals')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('deal_name')} placeholder="aaaaaaa" required />
          <Select label={t('customer')} options={[{ value: 'aaa', label: 'aaa' }]} required />
          <Input label={t('deal_value')} placeholder="444555" required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('closing_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('stage')} options={[{ value: 'Negotiation', label: 'Negotiation' }]} required />
          <Select label={t('sales_owner')} options={[{ value: 'aaa', label: 'aaa' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_deals')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_deals')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('deal_name')} defaultValue={selectedDeal?.dealName} placeholder="aaaaaaa" required />
          <Select label={t('customer')} defaultValue={selectedDeal?.customer} options={[{ value: 'aaa', label: 'aaa' }]} required />
          <Input label={t('deal_value')} defaultValue={selectedDeal?.dealValue} placeholder="444555" required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('closing_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" defaultValue={selectedDeal?.closingDate} placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('stage')} defaultValue={selectedDeal?.stage} options={[{ value: 'Negotiation', label: 'Negotiation' }]} required />
          <Select label={t('sales_owner')} defaultValue={selectedDeal?.salesOwner} options={[{ value: 'aaa', label: 'aaa' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            {t('save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

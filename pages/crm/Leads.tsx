
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Lead {
  id: string;
  leadName: string;
  phone: string;
  company: string;
  leadOwner: string;
  leadStatus: 'Connected' | 'Not Contacted' | 'Lost';
}

export const Leads: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      leadName: 'mohamed ibrahim',
      phone: '234567890',
      company: 'Company x',
      leadOwner: 'Zaki',
      leadStatus: 'Connected',
    },
    {
      id: '2',
      leadName: '',
      phone: '',
      company: '',
      leadOwner: '',
      leadStatus: 'Not Contacted',
    },
    {
      id: '3',
      leadName: '',
      phone: '',
      company: '',
      leadOwner: '',
      leadStatus: 'Lost',
    },
  ]);

  const columns: Column<Lead>[] = [
    { header: t('lead_name'), accessorKey: 'leadName' },
    { header: t('phone'), accessorKey: 'phone' },
    { header: t('company'), accessorKey: 'company' },
    { header: t('lead_owner'), accessorKey: 'leadOwner' },
    { 
      header: t('lead_status'), 
      render: (item) => {
        const variants: Record<string, string> = {
          'Connected': 'success',
          'Not Contacted': 'warning',
          'Lost': 'danger'
        };
        return <Badge status={variants[item.leadStatus]}>{item.leadStatus}</Badge>;
      }
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedLead(item); setIsEditModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('leads')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_leads')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_leads')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('state')}
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('trip_id')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={leads}
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
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_leads')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('lead_name')} placeholder="aaaaaaa" required />
          <Input label={t('company')} placeholder="aaaaaaa" required />
          <Input label={t('phone')} placeholder="444555" required />
          <Select label={t('lead_owner')} options={[{ value: 'aaaaa', label: 'aaaaa' }]} required />
          <Select label={t('lead_status')} options={[{ value: 'Connected', label: 'Connected' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_leads')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_leads')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('lead_name')} defaultValue={selectedLead?.leadName} placeholder="aaaaaaa" required />
          <Input label={t('company')} defaultValue={selectedLead?.company} placeholder="aaaaaaa" required />
          <Input label={t('phone')} defaultValue={selectedLead?.phone} placeholder="444555" required />
          <Select label={t('lead_owner')} defaultValue={selectedLead?.leadOwner} options={[{ value: 'aaaaa', label: 'aaaaa' }]} required />
          <Select label={t('lead_status')} defaultValue={selectedLead?.leadStatus} options={[{ value: 'Connected', label: 'Connected' }]} required />
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

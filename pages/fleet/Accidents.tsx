import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Accident {
  id: string;
  vehicle: string;
  driver: string;
  date: string;
  location: string;
  damageLevel: 'high' | 'medium' | 'low';
  actualCost: string;
  insuranceCompany: string;
  status: 'open' | 'under_review' | 'closed';
}

export const Accidents: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);

  const accidents: Accident[] = [
    {
      id: 'ACC-001',
      vehicle: 'V-001 (Toyota Corolla)',
      driver: 'Ahmed Mohamed',
      date: '2025-01-10',
      location: 'Cairo-Alex Road',
      damageLevel: 'medium',
      actualCost: '15,000 EGP',
      insuranceCompany: 'Misr Insurance',
      status: 'under_review',
    },
    {
      id: 'ACC-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      driver: 'Sayed Ali',
      date: '2025-01-12',
      location: 'Nasr City',
      damageLevel: 'high',
      actualCost: '45,000 EGP',
      insuranceCompany: 'AXA Insurance',
      status: 'open',
    },
  ];

  const columns = [
    { header: t('accident_id'), accessorKey: 'id' as keyof Accident },
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof Accident },
    { header: t('driver'), accessorKey: 'driver' as keyof Accident },
    { header: t('date'), accessorKey: 'date' as keyof Accident },
    { header: t('location'), accessorKey: 'location' as keyof Accident },
    {
      header: t('damage_level'),
      accessorKey: 'damageLevel' as keyof Accident,
      render: (item: Accident) => (
        <Badge
          variant={
            item.damageLevel === 'high' ? 'danger' : item.damageLevel === 'medium' ? 'warning' : 'neutral'
          }
        >
          {t(item.damageLevel)}
        </Badge>
      ),
    },
    { header: t('actual_cost'), accessorKey: 'actualCost' as keyof Accident },
    { header: t('insurance_company'), accessorKey: 'insuranceCompany' as keyof Accident },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Accident,
      render: (item: Accident) => (
        <Badge
          variant={
            item.status === 'open' ? 'danger' : item.status === 'under_review' ? 'warning' : 'success'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Accident,
      render: (item: Accident) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAccident(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('accidents')}</h1>
          <p className="text-gray-500">{t('manage_your_accidents')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAccident(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_accident')}
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
                { label: t('open'), value: 'open' },
                { label: t('under_review'), value: 'under_review' },
                { label: t('closed'), value: 'closed' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={accidents} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAccident ? t('edit_accident') : t('add_accident')}
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
                defaultValue={selectedAccident?.vehicle}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('driver')} *</label>
              <Select
                options={[
                  { label: 'Ahmed Mohamed', value: 'D-001' },
                  { label: 'Sayed Ali', value: 'D-002' },
                ]}
                defaultValue={selectedAccident?.driver}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('date')} *</label>
              <Input type="date" defaultValue={selectedAccident?.date} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('location')} *</label>
              <Input defaultValue={selectedAccident?.location} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('damage_level')} *</label>
              <Select
                options={[
                  { label: t('low'), value: 'low' },
                  { label: t('medium'), value: 'medium' },
                  { label: t('high'), value: 'high' },
                ]}
                defaultValue={selectedAccident?.damageLevel}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('actual_cost')} *</label>
              <Input defaultValue={selectedAccident?.actualCost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('insurance_company')} *</label>
              <Input defaultValue={selectedAccident?.insuranceCompany} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('open'), value: 'open' },
                  { label: t('under_review'), value: 'under_review' },
                  { label: t('closed'), value: 'closed' },
                ]}
                defaultValue={selectedAccident?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedAccident ? t('save') : t('add_accident')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

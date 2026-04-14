import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Building2, Clock, Zap, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface WorkCenter {
  id: string;
  name: string;
  code: string;
  capacity: number;
  efficiency: number;
  oee: number;
  status: 'active' | 'maintenance' | 'inactive';
  location: string;
}

export const WorkCenters: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);

  const wcData: WorkCenter[] = [
    {
      id: '1',
      name: 'Assembly Line A',
      code: 'WC-001',
      capacity: 100,
      efficiency: 95,
      oee: 88,
      status: 'active',
      location: 'Floor 1',
    },
    {
      id: '2',
      name: 'Cutting Machine 2',
      code: 'WC-002',
      capacity: 50,
      efficiency: 85,
      oee: 75,
      status: 'maintenance',
      location: 'Floor 1',
    },
    {
      id: '3',
      name: 'Packaging Unit',
      code: 'WC-003',
      capacity: 200,
      efficiency: 98,
      oee: 92,
      status: 'active',
      location: 'Floor 2',
    },
  ];

  const getStatusBadge = (status: WorkCenter['status']) => {
    const variants = {
      active: 'success',
      maintenance: 'warning',
      inactive: 'danger',
    } as const;

    return <Badge variant={variants[status]}>{t(status)}</Badge>;
  };

  const columns: Column<WorkCenter>[] = [
    { header: t('name'), accessorKey: 'name' },
    { header: t('code'), accessorKey: 'code' },
    { header: t('capacity'), accessorKey: 'capacity' },
    { 
      header: t('efficiency'), 
      accessorKey: 'efficiency',
      render: (item: WorkCenter) => `${item.efficiency}%`
    },
    { 
      header: t('oee'), 
      accessorKey: 'oee',
      render: (item: WorkCenter) => `${item.oee}%`
    },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item: WorkCenter) => getStatusBadge(item.status),
    },
    { header: t('location'), accessorKey: 'location' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: WorkCenter) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedWC(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('work_centers')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_wc')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedWC(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_wc')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('total_wc')}</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('avg_efficiency')}</p>
            <p className="text-2xl font-bold">92.5%</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('in_maintenance')}</p>
            <p className="text-2xl font-bold">2</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder={t('search_placeholder')} className="pl-10 w-64" />
            </div>
            <Select
              options={[
                { label: t('all_statuses'), value: 'all' },
                { label: t('active'), value: 'active' },
                { label: t('maintenance'), value: 'maintenance' },
                { label: t('inactive'), value: 'inactive' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={wcData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedWC ? t('edit_wc') : t('add_wc')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')} *</label>
              <Input defaultValue={selectedWC?.name} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('code')} *</label>
              <Input defaultValue={selectedWC?.code} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('capacity')} *</label>
              <Input type="number" defaultValue={selectedWC?.capacity} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')} *</label>
              <Input defaultValue={selectedWC?.location} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')} *</label>
              <Select
                options={[
                  { label: t('active'), value: 'active' },
                  { label: t('maintenance'), value: 'maintenance' },
                  { label: t('inactive'), value: 'inactive' },
                ]}
                defaultValue={selectedWC?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedWC ? t('submit') : t('add_wc')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

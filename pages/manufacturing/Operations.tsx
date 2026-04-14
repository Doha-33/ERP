import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Wrench, Clock, Settings } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Operation {
  id: string;
  name: string;
  code: string;
  workCenter: string;
  duration: number; // in minutes
  description: string;
  status: 'active' | 'inactive';
}

export const Operations: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);

  const opData: Operation[] = [
    {
      id: '1',
      name: 'Cutting',
      code: 'OP-001',
      workCenter: 'Cutting Machine 2',
      duration: 15,
      description: 'Cutting raw materials to size',
      status: 'active',
    },
    {
      id: '2',
      name: 'Assembly',
      code: 'OP-002',
      workCenter: 'Assembly Line A',
      duration: 45,
      description: 'Assembling components into final product',
      status: 'active',
    },
    {
      id: '3',
      name: 'Quality Check',
      code: 'OP-003',
      workCenter: 'Packaging Unit',
      duration: 10,
      description: 'Final inspection before packaging',
      status: 'active',
    },
  ];

  const getStatusBadge = (status: Operation['status']) => {
    const variants = {
      active: 'success',
      inactive: 'danger',
    } as const;

    return <Badge variant={variants[status]}>{t(status)}</Badge>;
  };

  const columns: Column<Operation>[] = [
    { header: t('name'), accessorKey: 'name' },
    { header: t('code'), accessorKey: 'code' },
    { header: t('work_center'), accessorKey: 'workCenter' },
    { 
      header: t('duration'), 
      accessorKey: 'duration',
      render: (item: Operation) => `${item.duration} ${t('min')}`
    },
    { header: t('description'), accessorKey: 'description' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item: Operation) => getStatusBadge(item.status),
    },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: Operation) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOp(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('operations')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_operations')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedOp(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_operation')}
          </Button>
        </div>
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
                { label: t('all_work_centers'), value: 'all' },
                { label: 'Assembly Line A', value: 'Assembly Line A' },
                { label: 'Cutting Machine 2', value: 'Cutting Machine 2' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={opData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOp ? t('edit_operation') : t('add_operation')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')} *</label>
              <Input defaultValue={selectedOp?.name} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('code')} *</label>
              <Input defaultValue={selectedOp?.code} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('work_center')} *</label>
              <Select
                options={[
                  { label: 'Assembly Line A', value: 'Assembly Line A' },
                  { label: 'Cutting Machine 2', value: 'Cutting Machine 2' },
                  { label: 'Packaging Unit', value: 'Packaging Unit' },
                ]}
                defaultValue={selectedOp?.workCenter}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('duration')} ({t('min')}) *</label>
              <Input type="number" defaultValue={selectedOp?.duration} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')} *</label>
              <Select
                options={[
                  { label: t('active'), value: 'active' },
                  { label: t('inactive'), value: 'inactive' },
                ]}
                defaultValue={selectedOp?.status}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
            <TextArea defaultValue={selectedOp?.description} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedOp ? t('submit') : t('add_operation')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

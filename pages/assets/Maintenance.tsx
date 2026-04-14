import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Calendar, User, DollarSign, FileText, Wrench, Upload } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Maintenance {
  id: string;
  assetId: string;
  maintenanceType: string;
  scheduledDate: string;
  technician: string;
  state: 'completed' | 'in_progress' | 'scheduled';
  cost: string;
  description: string;
}

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const maintenanceData: Maintenance[] = [
    {
      id: '1',
      assetId: 'D-001',
      maintenanceType: 'V-001',
      scheduledDate: '2/2/2039',
      technician: 'AMGED',
      state: 'completed',
      cost: '234$',
      description: 'AAAA',
    },
  ];

  const getStatusBadge = (state: Maintenance['state']) => {
    const variants = {
      completed: 'success',
      in_progress: 'warning',
      scheduled: 'info',
    } as const;

    const labels = {
      completed: t('completed'),
      in_progress: t('in_progress'),
      scheduled: t('scheduled'),
    };

    return <Badge variant={variants[state]}>{labels[state]}</Badge>;
  };

  const columns: Column<Maintenance>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { 
      header: t('maintenance_type'), 
      accessorKey: 'maintenanceType',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
            <Wrench size={16} />
          </div>
          <span>{item.maintenanceType}</span>
        </div>
      )
    },
    { header: t('scheduled_date'), accessorKey: 'scheduledDate' },
    { header: t('technician'), accessorKey: 'technician' },
    { header: t('cost'), accessorKey: 'cost' },
    {
      header: t('states'),
      accessorKey: 'state',
      render: (item) => getStatusBadge(item.state),
    },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedMaintenance(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('maintenance')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_maintenance')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedMaintenance(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_maintenance')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-end">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              options={[{ label: t('scheduled_date'), value: 'scheduled_date' }]}
              className="w-48"
              placeholder={t('scheduled_date')}
            />
            <Select
              options={[{ label: t('states'), value: 'state' }]}
              className="w-48"
              placeholder={t('states')}
            />
            <Select
              options={[{ label: t('maintenance_type'), value: 'maintenance_type' }]}
              className="w-48"
              placeholder={t('maintenance_type')}
            />
            <Select
              options={[{ label: t('asset_id'), value: 'asset_id' }]}
              className="w-48"
              placeholder={t('asset_id')}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={maintenanceData} 
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            minWidth="min-w-[1200px]"
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {selectedMaintenance ? <Edit2 size={20} /> : <Plus size={20} />}
            {selectedMaintenance ? t('edit_maintenance') : t('add_maintenance')}
          </div>
        }
        size="4xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_id')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedMaintenance?.assetId} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('maintenance_type')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'Preventive', value: 'Preventive' },
                  { label: 'Corrective', value: 'Corrective' },
                ]}
                defaultValue={selectedMaintenance?.maintenanceType}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('scheduled_date')} <span className="text-red-500">*</span></label>
              <Input type="date" defaultValue={selectedMaintenance?.scheduledDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('technician')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedMaintenance?.technician} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('cost')} <span className="text-red-500">*</span></label>
              <Input type="number" defaultValue={selectedMaintenance?.cost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('states')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: t('scheduled'), value: 'scheduled' },
                  { label: t('completed'), value: 'completed' },
                  { label: t('in_progress'), value: 'in_progress' },
                ]}
                defaultValue={selectedMaintenance?.state}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')} <span className="text-red-500">*</span></label>
            <TextArea 
              defaultValue={selectedMaintenance?.description} 
              className="min-h-[120px] border-blue-200 focus:border-blue-500"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('upload_attachment')}</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800 border-none px-8">
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8">
              {selectedMaintenance ? t('save') : (
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  {t('add_maintenance')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

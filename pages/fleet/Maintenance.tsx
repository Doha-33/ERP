import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface MaintenanceRecord {
  id: string;
  vehicle: string;
  type: string;
  date: string;
  cost: string;
  odometer: string;
  provider: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
}

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const maintenanceRecords: MaintenanceRecord[] = [
    {
      id: 'M-001',
      vehicle: 'V-001 (Toyota Corolla)',
      type: 'Oil Change',
      date: '2025-01-20',
      cost: '1,200 EGP',
      odometer: '15,500 km',
      provider: 'Toyota Service Center',
      status: 'scheduled',
    },
    {
      id: 'M-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      type: 'Brake Pad Replacement',
      date: '2025-01-10',
      cost: '2,500 EGP',
      odometer: '45,000 km',
      provider: 'Local Workshop',
      status: 'completed',
    },
  ];

  const columns = [
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof MaintenanceRecord },
    { header: t('type'), accessorKey: 'type' as keyof MaintenanceRecord },
    { header: t('date'), accessorKey: 'date' as keyof MaintenanceRecord },
    { header: t('cost'), accessorKey: 'cost' as keyof MaintenanceRecord },
    {
      header: t('status'),
      accessorKey: 'status' as keyof MaintenanceRecord,
      render: (item: MaintenanceRecord) => (
        <Badge
          variant={
            item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'info' : item.status === 'overdue' ? 'danger' : 'warning'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    { header: t('provider'), accessorKey: 'provider' as keyof MaintenanceRecord },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof MaintenanceRecord,
      render: (item: MaintenanceRecord) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRecord(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('maintenance')}</h1>
          <p className="text-gray-500">{t('manage_vehicle_maintenance')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_maintenance_record')}
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
                { label: t('scheduled'), value: 'scheduled' },
                { label: t('in_progress'), value: 'in_progress' },
                { label: t('completed'), value: 'completed' },
                { label: t('overdue'), value: 'overdue' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={maintenanceRecords} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecord ? t('edit_maintenance_record') : t('add_maintenance_record')}
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
                defaultValue={selectedRecord?.vehicle}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('type')} *</label>
              <Input defaultValue={selectedRecord?.type} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('date')} *</label>
              <Input type="date" defaultValue={selectedRecord?.date} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('cost')} *</label>
              <Input defaultValue={selectedRecord?.cost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('odometer')} *</label>
              <Input defaultValue={selectedRecord?.odometer} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('provider')} *</label>
              <Input defaultValue={selectedRecord?.provider} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('scheduled'), value: 'scheduled' },
                  { label: t('in_progress'), value: 'in_progress' },
                  { label: t('completed'), value: 'completed' },
                  { label: t('overdue'), value: 'overdue' },
                ]}
                defaultValue={selectedRecord?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedRecord ? t('save') : t('add_maintenance_record')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

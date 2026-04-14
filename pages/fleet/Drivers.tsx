import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, User } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  status: 'active' | 'on_trip' | 'inactive';
  assignedVehicle: string;
}

export const Drivers: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const drivers: Driver[] = [
    {
      id: 'D-001',
      name: 'Ahmed Mohamed',
      licenseNumber: 'L-123456',
      licenseExpiry: '2026-05-20',
      phone: '01012345678',
      status: 'active',
      assignedVehicle: 'V-001',
    },
    {
      id: 'D-002',
      name: 'Sayed Ali',
      licenseNumber: 'L-789012',
      licenseExpiry: '2025-11-15',
      phone: '01198765432',
      status: 'on_trip',
      assignedVehicle: 'V-002',
    },
  ];

  const columns = [
    { header: t('driver_name'), accessorKey: 'name' as keyof Driver },
    { header: t('license_number'), accessorKey: 'licenseNumber' as keyof Driver },
    { header: t('license_expiry'), accessorKey: 'licenseExpiry' as keyof Driver },
    { header: t('phone'), accessorKey: 'phone' as keyof Driver },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Driver,
      render: (item: Driver) => (
        <Badge
          variant={
            item.status === 'active' ? 'success' : item.status === 'on_trip' ? 'info' : 'neutral'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    { header: t('assigned_vehicle'), accessorKey: 'assignedVehicle' as keyof Driver },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Driver,
      render: (item: Driver) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDriver(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('drivers')}</h1>
          <p className="text-gray-500">{t('manage_your_drivers')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDriver(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_driver')}
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
                { label: t('active'), value: 'active' },
                { label: t('on_trip'), value: 'on_trip' },
                { label: t('inactive'), value: 'inactive' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={drivers} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDriver ? t('edit_driver') : t('add_driver')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('driver_name')} *</label>
              <Input defaultValue={selectedDriver?.name} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('license_number')} *</label>
              <Input defaultValue={selectedDriver?.licenseNumber} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('license_expiry')} *</label>
              <Input type="date" defaultValue={selectedDriver?.licenseExpiry} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('phone')} *</label>
              <Input defaultValue={selectedDriver?.phone} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('assigned_vehicle')}</label>
              <Select
                options={[
                  { label: 'V-001 (Toyota Corolla)', value: 'V-001' },
                  { label: 'V-002 (Hyundai Elantra)', value: 'V-002' },
                ]}
                defaultValue={selectedDriver?.assignedVehicle}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('active'), value: 'active' },
                  { label: t('on_trip'), value: 'on_trip' },
                  { label: t('inactive'), value: 'inactive' },
                ]}
                defaultValue={selectedDriver?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedDriver ? t('save') : t('add_driver')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

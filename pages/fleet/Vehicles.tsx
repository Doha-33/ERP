import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Truck } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  status: 'active' | 'maintenance' | 'out_of_service';
  fuelType: string;
  mileage: string;
  lastMaintenance: string;
}

export const Vehicles: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const vehicles: Vehicle[] = [
    {
      id: 'V-001',
      plateNumber: 'ABC-123',
      model: 'Toyota Corolla 2023',
      type: 'Sedan',
      status: 'active',
      fuelType: 'Gasoline',
      mileage: '15,000 km',
      lastMaintenance: '2024-12-15',
    },
    {
      id: 'V-002',
      plateNumber: 'XYZ-789',
      model: 'Hyundai Elantra 2022',
      type: 'Sedan',
      status: 'maintenance',
      fuelType: 'Gasoline',
      mileage: '45,000 km',
      lastMaintenance: '2025-01-10',
    },
  ];

  const columns = [
    { header: t('plate_number'), accessorKey: 'plateNumber' as keyof Vehicle },
    { header: t('model'), accessorKey: 'model' as keyof Vehicle },
    { header: t('type'), accessorKey: 'type' as keyof Vehicle },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Vehicle,
      render: (item: Vehicle) => (
        <Badge
          variant={
            item.status === 'active' ? 'success' : item.status === 'maintenance' ? 'warning' : 'neutral'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    { header: t('fuel_type'), accessorKey: 'fuelType' as keyof Vehicle },
    { header: t('mileage'), accessorKey: 'mileage' as keyof Vehicle },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Vehicle,
      render: (item: Vehicle) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedVehicle(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicles')}</h1>
          <p className="text-gray-500">{t('manage_your_vehicles')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedVehicle(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_vehicle')}
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
                { label: t('maintenance'), value: 'maintenance' },
                { label: t('out_of_service'), value: 'out_of_service' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={vehicles} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVehicle ? t('edit_vehicle') : t('add_vehicle')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('plate_number')} *</label>
              <Input defaultValue={selectedVehicle?.plateNumber} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('model')} *</label>
              <Input defaultValue={selectedVehicle?.model} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('type')} *</label>
              <Input defaultValue={selectedVehicle?.type} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('fuel_type')} *</label>
              <Select
                options={[
                  { label: 'Gasoline', value: 'gasoline' },
                  { label: 'Diesel', value: 'diesel' },
                  { label: 'Electric', value: 'electric' },
                ]}
                defaultValue={selectedVehicle?.fuelType}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('mileage')} *</label>
              <Input defaultValue={selectedVehicle?.mileage} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('active'), value: 'active' },
                  { label: t('maintenance'), value: 'maintenance' },
                  { label: t('out_of_service'), value: 'out_of_service' },
                ]}
                defaultValue={selectedVehicle?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedVehicle ? t('save') : t('add_vehicle')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

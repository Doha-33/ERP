import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Fuel } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface FuelLog {
  id: string;
  vehicle: string;
  driver: string;
  date: string;
  quantity: string;
  cost: string;
  odometer: string;
  station: string;
}

export const FuelLogs: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | null>(null);

  const fuelLogs: FuelLog[] = [
    {
      id: 'FL-001',
      vehicle: 'V-001 (Toyota Corolla)',
      driver: 'Ahmed Mohamed',
      date: '2025-01-14',
      quantity: '40 L',
      cost: '800 EGP',
      odometer: '15,200 km',
      station: 'Mobil - Maadi',
    },
    {
      id: 'FL-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      driver: 'Sayed Ali',
      date: '2025-01-15',
      quantity: '35 L',
      cost: '700 EGP',
      odometer: '45,500 km',
      station: 'Shell - Zamalek',
    },
  ];

  const columns = [
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof FuelLog },
    { header: t('driver'), accessorKey: 'driver' as keyof FuelLog },
    { header: t('date'), accessorKey: 'date' as keyof FuelLog },
    { header: t('quantity'), accessorKey: 'quantity' as keyof FuelLog },
    { header: t('cost'), accessorKey: 'cost' as keyof FuelLog },
    { header: t('odometer'), accessorKey: 'odometer' as keyof FuelLog },
    { header: t('station'), accessorKey: 'station' as keyof FuelLog },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof FuelLog,
      render: (item: FuelLog) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedLog(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('fuel_logs')}</h1>
          <p className="text-gray-500">{t('track_fuel_consumption')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedLog(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_fuel_log')}
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
          </div>
        </div>
        <Table 
          columns={columns} 
          data={fuelLogs} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLog ? t('edit_fuel_log') : t('add_fuel_log')}
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
                defaultValue={selectedLog?.vehicle}
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
                defaultValue={selectedLog?.driver}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('date')} *</label>
              <Input type="date" defaultValue={selectedLog?.date} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('quantity')} *</label>
              <Input defaultValue={selectedLog?.quantity} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('cost')} *</label>
              <Input defaultValue={selectedLog?.cost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('odometer')} *</label>
              <Input defaultValue={selectedLog?.odometer} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('station')} *</label>
              <Input defaultValue={selectedLog?.station} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedLog ? t('save') : t('add_fuel_log')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

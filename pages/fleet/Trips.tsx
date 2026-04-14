import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MapPin, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Trip {
  id: string;
  vehicle: string;
  driver: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  fuelUsed: string;
  status: 'ongoing' | 'completed' | 'cancelled';
}

export const Trips: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const trips: Trip[] = [
    {
      id: 'TRIP-001',
      vehicle: 'V-001 (Toyota Corolla)',
      driver: 'Ahmed Mohamed',
      startLocation: 'Cairo',
      endLocation: 'Alexandria',
      startTime: '2025-01-15 08:00',
      endTime: '2025-01-15 11:00',
      fuelUsed: '25 L',
      status: 'completed',
    },
    {
      id: 'TRIP-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      driver: 'Sayed Ali',
      startLocation: 'Giza',
      endLocation: 'Suez',
      startTime: '2025-01-15 09:30',
      endTime: '-',
      fuelUsed: '-',
      status: 'ongoing',
    },
  ];

  const columns = [
    { header: t('trip_id'), accessorKey: 'id' as keyof Trip },
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof Trip },
    { header: t('driver'), accessorKey: 'driver' as keyof Trip },
    { header: t('start_location'), accessorKey: 'startLocation' as keyof Trip },
    { header: t('end_location'), accessorKey: 'endLocation' as keyof Trip },
    { header: t('start_time'), accessorKey: 'startTime' as keyof Trip },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Trip,
      render: (item: Trip) => (
        <Badge
          variant={
            item.status === 'completed' ? 'success' : item.status === 'ongoing' ? 'info' : 'neutral'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Trip,
      render: (item: Trip) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTrip(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('trips')}</h1>
          <p className="text-gray-500">{t('manage_your_trips')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedTrip(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_trip')}
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
                { label: t('ongoing'), value: 'ongoing' },
                { label: t('completed'), value: 'completed' },
                { label: t('cancelled'), value: 'cancelled' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={trips} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTrip ? t('edit_trip') : t('add_trip')}
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
                defaultValue={selectedTrip?.vehicle}
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
                defaultValue={selectedTrip?.driver}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('start_location')} *</label>
              <Input defaultValue={selectedTrip?.startLocation} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('end_location')} *</label>
              <Input defaultValue={selectedTrip?.endLocation} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('start_time')} *</label>
              <Input type="datetime-local" defaultValue={selectedTrip?.startTime} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('end_time')}</label>
              <Input type="datetime-local" defaultValue={selectedTrip?.endTime} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('fuel_used')}</label>
              <Input defaultValue={selectedTrip?.fuelUsed} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('ongoing'), value: 'ongoing' },
                  { label: t('completed'), value: 'completed' },
                  { label: t('cancelled'), value: 'cancelled' },
                ]}
                defaultValue={selectedTrip?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedTrip ? t('save') : t('add_trip')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

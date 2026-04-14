import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface VehicleBooking {
  id: string;
  vehicle: string;
  requestedBy: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export const VehicleBooking: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<VehicleBooking | null>(null);

  const bookings: VehicleBooking[] = [
    {
      id: 'BOK-001',
      vehicle: 'V-001 (Toyota Corolla)',
      requestedBy: 'John Doe',
      startDate: '2025-02-01',
      endDate: '2025-02-03',
      purpose: 'Client Meeting',
      status: 'approved',
    },
    {
      id: 'BOK-002',
      vehicle: 'V-002 (Hyundai Elantra)',
      requestedBy: 'Jane Smith',
      startDate: '2025-02-05',
      endDate: '2025-02-05',
      purpose: 'Site Visit',
      status: 'pending',
    },
  ];

  const columns = [
    { header: t('booking_id'), accessorKey: 'id' as keyof VehicleBooking },
    { header: t('vehicle'), accessorKey: 'vehicle' as keyof VehicleBooking },
    { header: t('requested_by'), accessorKey: 'requestedBy' as keyof VehicleBooking },
    { header: t('start_date'), accessorKey: 'startDate' as keyof VehicleBooking },
    { header: t('end_date'), accessorKey: 'endDate' as keyof VehicleBooking },
    {
      header: t('status'),
      accessorKey: 'status' as keyof VehicleBooking,
      render: (item: VehicleBooking) => (
        <Badge
          variant={
            item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : item.status === 'rejected' ? 'danger' : 'neutral'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof VehicleBooking,
      render: (item: VehicleBooking) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedBooking(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicle_booking')}</h1>
          <p className="text-gray-500">{t('manage_vehicle_bookings')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedBooking(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_booking')}
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
                { label: t('pending'), value: 'pending' },
                { label: t('approved'), value: 'approved' },
                { label: t('rejected'), value: 'rejected' },
                { label: t('completed'), value: 'completed' },
              ]}
              className="w-40"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={bookings} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBooking ? t('edit_booking') : t('add_booking')}
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
                defaultValue={selectedBooking?.vehicle}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('requested_by')} *</label>
              <Input defaultValue={selectedBooking?.requestedBy} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('start_date')} *</label>
              <Input type="date" defaultValue={selectedBooking?.startDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('end_date')} *</label>
              <Input type="date" defaultValue={selectedBooking?.endDate} required />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('purpose')} *</label>
              <TextArea defaultValue={selectedBooking?.purpose} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('pending'), value: 'pending' },
                  { label: t('approved'), value: 'approved' },
                  { label: t('rejected'), value: 'rejected' },
                  { label: t('completed'), value: 'completed' },
                ]}
                defaultValue={selectedBooking?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedBooking ? t('save') : t('add_booking')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MapPin, Calendar, Clock, History } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Tracking {
  id: string;
  assetId: string;
  currentLocation: string;
  movementHistory: string;
}

export const Tracking: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null);

  const trackingData: Tracking[] = [
    {
      id: '1',
      assetId: '122',
      currentLocation: 'USA',
      movementHistory: 'USA TO EGYPT',
    },
  ];

  const columns: Column<Tracking>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { header: t('current_location'), accessorKey: 'currentLocation' },
    { header: t('movement_history'), accessorKey: 'movementHistory' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTracking(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tracking')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_tracking')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedTracking(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_tracking')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-end">
          <Select
            options={[
              { label: t('asset_id'), value: 'asset_id' },
            ]}
            className="w-48"
          />
        </div>
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={trackingData} 
            keyExtractor={(item) => item.id}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTracking ? t('edit_tracking') : t('add_tracking')}
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_id')} *</label>
              <Input defaultValue={selectedTracking?.assetId} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('current_location')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedTracking?.currentLocation}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('movement_history')} *</label>
              <Input defaultValue={selectedTracking?.movementHistory} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedTracking ? t('save') : t('add_tracking')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

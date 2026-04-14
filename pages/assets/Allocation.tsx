import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, User, MapPin, Calendar, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Allocation {
  id: string;
  assetId: string;
  assignedTo: string;
  location: string;
  startDate: string;
  endDate: string;
  usagePurpose: string;
}

export const Allocation: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  const allocationData: Allocation[] = [
    {
      id: '1',
      assetId: '122',
      assignedTo: 'Ahmed',
      location: 'USA',
      startDate: '2/2/2020',
      endDate: '2/2/2030',
      usagePurpose: 'Work',
    },
  ];

  const columns: Column<Allocation>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { header: t('assigned_to'), accessorKey: 'assignedTo' },
    { header: t('location'), accessorKey: 'location' },
    { header: t('start_date'), accessorKey: 'startDate' },
    { header: t('end_date'), accessorKey: 'endDate' },
    { header: t('usage_purpose'), accessorKey: 'usagePurpose' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAllocation(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('allocation')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_allocation')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAllocation(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_allocation')}
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
            data={allocationData} 
            keyExtractor={(item) => item.id}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAllocation ? t('edit_allocation') : t('add_allocation')}
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_id')} *</label>
              <Input defaultValue={selectedAllocation?.assetId} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('assigned_to')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedAllocation?.assignedTo}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedAllocation?.location}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('usage_purpose')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedAllocation?.usagePurpose}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('start_date')} *</label>
              <Input type="date" defaultValue={selectedAllocation?.startDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('end_date')} *</label>
              <Input type="date" defaultValue={selectedAllocation?.endDate} required />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedAllocation ? t('save') : t('add_allocation')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

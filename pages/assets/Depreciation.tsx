import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, DollarSign, TrendingDown, Calendar, Clock } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Depreciation {
  id: string;
  assetId: string;
  purchaseCost: string;
  usefulLife: string;
  depreciationMethod: string;
  accumulatedDepreciation: string;
  currentValue: string;
  accountingPeriod: string;
}

export const Depreciation: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepreciation, setSelectedDepreciation] = useState<Depreciation | null>(null);

  const depreciationData: Depreciation[] = [
    {
      id: '1',
      assetId: '122',
      purchaseCost: '234567890',
      usefulLife: 'year',
      depreciationMethod: 'Declining Balance',
      accumulatedDepreciation: '112222',
      currentValue: '2222222',
      accountingPeriod: 'Month',
    },
  ];

  const columns: Column<Depreciation>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { header: t('purchase_cost'), accessorKey: 'purchaseCost' },
    { header: t('useful_life'), accessorKey: 'usefulLife' },
    { header: t('depreciation_method'), accessorKey: 'depreciationMethod' },
    { header: t('accumulated_depreciation'), accessorKey: 'accumulatedDepreciation' },
    { header: t('current_value'), accessorKey: 'currentValue' },
    { header: t('accounting_period'), accessorKey: 'accountingPeriod' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDepreciation(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('depreciation')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_depreciation')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDepreciation(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_depreciation')}
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
            data={depreciationData} 
            keyExtractor={(item) => item.id}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDepreciation ? t('edit_depreciation') : t('add_depreciation')}
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_id')} *</label>
              <Input defaultValue={selectedDepreciation?.assetId} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('purchase_cost')} *</label>
              <Input type="number" defaultValue={selectedDepreciation?.purchaseCost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('useful_life')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDepreciation?.usefulLife}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('depreciation_method')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDepreciation?.depreciationMethod}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('accumulated_depreciation')} *</label>
              <Input type="number" defaultValue={selectedDepreciation?.accumulatedDepreciation} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('current_value')} *</label>
              <Input type="number" defaultValue={selectedDepreciation?.currentValue} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('accounting_period')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDepreciation?.accountingPeriod}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedDepreciation ? t('save') : t('add_depreciation')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

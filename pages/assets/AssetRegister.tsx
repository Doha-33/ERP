import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Upload, FileText, Calendar, Barcode, MapPin, User, DollarSign, Tag, Laptop } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Asset {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  model: string;
  serialNumber: string;
  brand: string;
  warrantyPeriod: string;
  warrantyEndDate: string;
  warrantyNumber: string;
  location: string;
  assignedTo: string;
  barcode: string;
  cost: string;
  purchaseDate: string;
  notes: string;
  state: 'active' | 'in_repair' | 'retired';
}

export const AssetRegister: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const assetData: Asset[] = [
    {
      id: '1',
      assetId: 'EDR2333',
      assetName: 'Laptop Lenovo',
      category: 'electronics',
      model: 'ccccc',
      serialNumber: 'EDR2333',
      brand: 'EDR2333',
      warrantyPeriod: 'EDR2333',
      warrantyEndDate: '12/22/2020',
      warrantyNumber: 'EDR2333',
      location: 'USA',
      assignedTo: 'ahmed',
      barcode: '23234$',
      cost: '23234$',
      purchaseDate: '2/2/2030',
      notes: 'aaaaaaaaaaaaa',
      state: 'active',
    },
  ];

  const getStatusBadge = (state: Asset['state']) => {
    const variants = {
      active: 'success',
      in_repair: 'warning',
      retired: 'danger',
    } as const;

    const labels = {
      active: t('active'),
      in_repair: t('in_repair'),
      retired: t('retired'),
    };

    return <Badge variant={variants[state]}>{labels[state]}</Badge>;
  };

  const columns: Column<Asset>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { 
      header: t('asset_name'), 
      accessorKey: 'assetName',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
            <Laptop size={16} />
          </div>
          <span>{item.assetName}</span>
        </div>
      )
    },
    { header: t('category'), accessorKey: 'category' },
    { header: t('model'), accessorKey: 'model' },
    { header: t('serial_number'), accessorKey: 'serialNumber' },
    { header: t('brand'), accessorKey: 'brand' },
    { header: t('warranty_period'), accessorKey: 'warrantyPeriod' },
    { header: t('warranty_end_date'), accessorKey: 'warrantyEndDate' },
    { header: t('warranty_number'), accessorKey: 'warrantyNumber' },
    { header: t('location'), accessorKey: 'location' },
    { header: t('assigned_to'), accessorKey: 'assignedTo' },
    { header: t('barcode'), accessorKey: 'barcode' },
    { header: t('cost'), accessorKey: 'cost' },
    { header: t('purchase_date'), accessorKey: 'purchaseDate' },
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
              setSelectedAsset(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('asset_register')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_asset_register')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAsset(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_asset_register')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-end">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              options={[{ label: t('purchase_date'), value: 'purchase_date' }]}
              className="w-48"
              placeholder={t('purchase_date')}
            />
            <Select
              options={[{ label: t('states'), value: 'state' }]}
              className="w-48"
              placeholder={t('states')}
            />
            <Select
              options={[{ label: t('category'), value: 'category' }]}
              className="w-48"
              placeholder={t('category')}
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
            data={assetData} 
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            minWidth="min-w-[2000px]"
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {selectedAsset ? <Edit2 size={20} /> : <Plus size={20} />}
            {selectedAsset ? t('edit_asset_register') : t('add_asset_register')}
          </div>
        }
        size="4xl"
      >
        <form className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <Upload size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col items-center">
              <Button variant="primary" size="sm" type="button" className="bg-indigo-600 hover:bg-indigo-700">
                {t('upload_picture')}
              </Button>
              <p className="text-xs text-gray-500 mt-2">JPEG, PNG up to 2 GB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_name')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.assetName} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('model')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.model} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('serial_number')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.serialNumber} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('brand')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.brand} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('warranty_period')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.warrantyPeriod} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('warranty_end_date')} <span className="text-red-500">*</span></label>
              <Input type="date" defaultValue={selectedAsset?.warrantyEndDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('warranty_number')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.warrantyNumber} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('barcode')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.barcode} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')} <span className="text-red-500">*</span></label>
              <Select
                options={[{ label: 'aaa', value: 'aaa' }]}
                defaultValue={selectedAsset?.category}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.location} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('cost')} <span className="text-red-500">*</span></label>
              <Input type="number" defaultValue={selectedAsset?.cost} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('purchase_date')} <span className="text-red-500">*</span></label>
              <Input type="date" defaultValue={selectedAsset?.purchaseDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('assigned_to')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedAsset?.assignedTo} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('states')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: t('present'), value: 'active' },
                  { label: t('in_repair'), value: 'in_repair' },
                  { label: t('retired'), value: 'retired' },
                ]}
                defaultValue={selectedAsset?.state}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')} <span className="text-red-500">*</span></label>
            <TextArea 
              defaultValue={selectedAsset?.notes} 
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
              {selectedAsset ? t('save') : (
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  {t('add_asset_register')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

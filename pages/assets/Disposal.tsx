import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, DollarSign, Trash, FileText, Upload, Laptop } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface Disposal {
  id: string;
  assetId: string;
  assetName: string;
  model: string;
  serialNumber: string;
  category: string;
  brand: string;
  currentValue: string;
  purchaseCost: string;
  purchaseDate: string;
  disposalType: 'scrap' | 'donation' | 'sale';
  disposalValue: string;
  invoiceNumber: string;
  paymentMethod: string;
  attachment: string;
  notes: string;
}

export const Disposal: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const disposalData: Disposal[] = [
    {
      id: '1',
      assetId: 'EDR2333',
      assetName: 'Laptop Lenovo',
      model: 'ccccc',
      serialNumber: 'EDR2333',
      category: 'electronics',
      brand: 'EDR2333',
      currentValue: '23234$',
      purchaseCost: '23234$',
      purchaseDate: '12/3/2040',
      disposalType: 'sale',
      disposalValue: '23234$',
      invoiceNumber: '1234565432',
      paymentMethod: 'cash',
      attachment: 'pdf',
      notes: 'Sample notes',
    },
  ];

  const getStatusBadge = (type: Disposal['disposalType']) => {
    const variants = {
      scrap: 'danger',
      donation: 'info',
      sale: 'success',
    } as const;

    const labels = {
      scrap: t('scrap'),
      donation: t('donation'),
      sale: t('sale'),
    };

    return <Badge variant={variants[type]}>{labels[type]}</Badge>;
  };

  const columns: Column<Disposal>[] = [
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
    { header: t('model'), accessorKey: 'model' },
    { header: t('serial_number'), accessorKey: 'serialNumber' },
    { header: t('category'), accessorKey: 'category' },
    { header: t('brand'), accessorKey: 'brand' },
    { header: t('current_value'), accessorKey: 'currentValue' },
    { header: t('purchase_cost'), accessorKey: 'purchaseCost' },
    { header: t('purchase_date'), accessorKey: 'purchaseDate' },
    {
      header: t('disposal_type'),
      accessorKey: 'disposalType',
      render: (item) => getStatusBadge(item.disposalType),
    },
    { header: t('disposal_value'), accessorKey: 'disposalValue' },
    { header: t('invoice_number'), accessorKey: 'invoiceNumber' },
    { header: t('payment_method'), accessorKey: 'paymentMethod' },
    { 
      header: t('attachment'), 
      accessorKey: 'attachment',
      render: (item) => (
        <span className="text-gray-500">{item.attachment}</span>
      )
    },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDisposal(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('disposal_page')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_disposal_page')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDisposal(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_disposal')}
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
            placeholder={t('asset_id')}
          />
        </div>
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={disposalData} 
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            minWidth="min-w-[1800px]"
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {selectedDisposal ? <Edit2 size={20} /> : <Plus size={20} />}
            {selectedDisposal ? t('edit_disposal') : t('add_disposal')}
          </div>
        }
        size="4xl"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_name')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDisposal?.assetName}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('model')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDisposal?.model}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('serial_number')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDisposal?.serialNumber}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('brand')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDisposal?.brand}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('current_value')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedDisposal?.currentValue} placeholder="aaaaaaa" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('purchase_date')} <span className="text-red-500">*</span></label>
              <Input type="date" defaultValue={selectedDisposal?.purchaseDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('purchase_cost')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedDisposal?.purchaseCost} placeholder="aaaaaaa" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('disposal_type')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: t('sale'), value: 'sale' },
                  { label: t('scrap'), value: 'scrap' },
                  { label: t('donation'), value: 'donation' },
                ]}
                defaultValue={selectedDisposal?.disposalType || 'sale'}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('disposal_value')} <span className="text-red-500">*</span></label>
              <Input defaultValue={selectedDisposal?.disposalValue} placeholder="444555" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('invoice_number')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedDisposal?.invoiceNumber}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('payment_method')} <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { label: t('present'), value: 'present' },
                ]}
                defaultValue={selectedDisposal?.paymentMethod || 'present'}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')} <span className="text-red-500">*</span></label>
            <TextArea 
              defaultValue={selectedDisposal?.notes} 
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
              {selectedDisposal ? t('save') : (
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  {t('add_disposal')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

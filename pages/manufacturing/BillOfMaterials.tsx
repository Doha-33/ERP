import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface BOMItem {
  id: string;
  bomId: string;
  productName: string;
  productCode: string;
  componentItem: string;
  qty: number;
  uom: string;
  version: string;
  notes: string;
}

export const BillOfMaterials: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMItem | null>(null);

  const bomData: BOMItem[] = [
    {
      id: '1',
      bomId: '23EER',
      productName: 'Laptop Lenovo',
      productCode: '234',
      componentItem: 'x',
      qty: 3,
      uom: 'kg',
      version: 'wwww',
      notes: 'wwww',
    },
    {
      id: '2',
      bomId: '23EER',
      productName: 'Laptop Lenovo',
      productCode: '4554',
      componentItem: 'z',
      qty: 2,
      uom: 'pcs',
      version: 'www',
      notes: 'www',
    },
    {
      id: '3',
      bomId: '23EER',
      productName: 'Laptop Lenovo',
      productCode: '3268',
      componentItem: 'x',
      qty: 4,
      uom: 'pcs',
      version: 'wwwww',
      notes: 'wwwww',
    },
  ];

  const columns: Column<BOMItem>[] = [
    { header: t('bom_id'), accessorKey: 'bomId' },
    { header: t('product_name'), accessorKey: 'productName' },
    { header: t('product_code'), accessorKey: 'productCode' },
    { header: t('component_item'), accessorKey: 'componentItem' },
    { header: t('qty'), accessorKey: 'qty' },
    { header: t('uom'), accessorKey: 'uom' },
    { header: t('version'), accessorKey: 'version' },
    { header: t('notes'), accessorKey: 'notes' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: BOMItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedBOM(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('bill_of_materials')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_bom')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedBOM(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_bom')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder={t('search_placeholder')} className="pl-10 w-64" />
            </div>
            <Select
              options={[
                { label: t('product_name'), value: 'product_name' },
              ]}
              className="w-48"
            />
            <Select
              options={[
                { label: t('bom_id'), value: 'bom_id' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={bomData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBOM ? t('edit_bom') : t('add_bom')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_name')} *</label>
              <Input defaultValue={selectedBOM?.productName} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('version')} *</label>
              <Input defaultValue={selectedBOM?.version} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('qty')} *</label>
              <Input type="number" defaultValue={selectedBOM?.qty} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('component_item')} *</label>
              <Input defaultValue={selectedBOM?.componentItem} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('uom')} *</label>
              <Select
                options={[
                  { label: 'kg', value: 'kg' },
                  { label: 'pcs', value: 'pcs' },
                  { label: 'sheets', value: 'sheets' },
                ]}
                defaultValue={selectedBOM?.uom}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')} *</label>
            <TextArea defaultValue={selectedBOM?.notes} required />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedBOM ? t('submit') : t('add_bom')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

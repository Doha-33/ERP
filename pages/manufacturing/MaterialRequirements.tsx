import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Search, 
  Edit2, 
  Trash2, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface MaterialRequirement {
  id: string;
  orderNo: string;
  itemCode: string;
  itemName: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  uom: string;
  status: 'available' | 'partially_available' | 'out_of_stock';
  dueDate: string;
}

export const MaterialRequirements: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MaterialRequirement | null>(null);

  const reqData: MaterialRequirement[] = [
    {
      id: '1',
      orderNo: 'MO/2024/001',
      itemCode: 'RM-001',
      itemName: 'Steel Sheet 2mm',
      requiredQty: 500,
      availableQty: 600,
      shortageQty: 0,
      uom: 'kg',
      status: 'available',
      dueDate: '2024-03-25',
    },
    {
      id: '2',
      orderNo: 'MO/2024/002',
      itemCode: 'RM-002',
      itemName: 'Aluminum Bar 10mm',
      requiredQty: 200,
      availableQty: 150,
      shortageQty: 50,
      uom: 'pcs',
      status: 'partially_available',
      dueDate: '2024-03-28',
    },
    {
      id: '3',
      orderNo: 'MO/2024/003',
      itemCode: 'RM-003',
      itemName: 'Copper Wire 1.5mm',
      requiredQty: 1000,
      availableQty: 0,
      shortageQty: 1000,
      uom: 'meters',
      status: 'out_of_stock',
      dueDate: '2024-03-20',
    },
  ];

  const getStatusBadge = (status: MaterialRequirement['status']) => {
    const variants = {
      available: 'success',
      partially_available: 'warning',
      out_of_stock: 'danger',
    } as const;

    return <Badge variant={variants[status]}>{t(status)}</Badge>;
  };

  const columns: Column<MaterialRequirement>[] = [
    { header: t('order_no'), accessorKey: 'orderNo' },
    { header: t('item_code'), accessorKey: 'itemCode' },
    { header: t('item_name'), accessorKey: 'itemName' },
    { header: t('required_qty'), accessorKey: 'requiredQty' },
    { header: t('available_qty'), accessorKey: 'availableQty' },
    { 
      header: t('shortage_qty'), 
      accessorKey: 'shortageQty',
      render: (item: MaterialRequirement) => (
        <span className={item.shortageQty > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
          {item.shortageQty}
        </span>
      )
    },
    { header: t('uom'), accessorKey: 'uom' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item: MaterialRequirement) => getStatusBadge(item.status),
    },
    { header: t('due_date'), accessorKey: 'dueDate' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: MaterialRequirement) => (
        <div className="flex items-center gap-2">
          {item.shortageQty > 0 && (
            <Button variant="secondary" size="sm" className="text-blue-600">
              <ShoppingCart size={14} />
              {t('purchase')}
            </Button>
          )}
          <button
            onClick={() => {
              setSelectedReq(item);
              setIsModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-blue-600"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('material_requirements')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_mfg_materials')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button variant="primary">
            <ShoppingCart size={18} />
            {t('bulk_purchase')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('available_items')}</p>
            <p className="text-2xl font-bold">45</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('shortage_items')}</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('out_of_stock')}</p>
            <p className="text-2xl font-bold">5</p>
          </div>
        </Card>
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
                { label: t('all_statuses'), value: 'all' },
                { label: t('available'), value: 'available' },
                { label: t('partially_available'), value: 'partially_available' },
                { label: t('out_of_stock'), value: 'out_of_stock' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={reqData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('edit_requirement')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('item_name')}</label>
              <Input defaultValue={selectedReq?.itemName} disabled />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('required_qty')} *</label>
              <Input type="number" defaultValue={selectedReq?.requiredQty} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('due_date')} *</label>
              <Input type="date" defaultValue={selectedReq?.dueDate} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

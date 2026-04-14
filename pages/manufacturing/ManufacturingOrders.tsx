import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface ManufacturingOrder {
  id: string;
  orderNo: string;
  productName: string;
  qtyToProduce: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'confirmed' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  responsible: string;
}

export const ManufacturingOrders: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);

  const ordersData: ManufacturingOrder[] = [
    {
      id: '1',
      orderNo: 'MO/2024/001',
      productName: 'Laptop Lenovo',
      qtyToProduce: 50,
      startDate: '2024-03-20',
      endDate: '2024-03-25',
      status: 'in_progress',
      priority: 'high',
      responsible: 'Ahmed Ali',
    },
    {
      id: '2',
      orderNo: 'MO/2024/002',
      productName: 'Office Chair',
      qtyToProduce: 100,
      startDate: '2024-03-22',
      endDate: '2024-03-28',
      status: 'confirmed',
      priority: 'medium',
      responsible: 'Sara Mohamed',
    },
    {
      id: '3',
      orderNo: 'MO/2024/003',
      productName: 'Desk Lamp',
      qtyToProduce: 200,
      startDate: '2024-03-15',
      endDate: '2024-03-18',
      status: 'done',
      priority: 'low',
      responsible: 'John Doe',
    },
  ];

  const getStatusBadge = (status: ManufacturingOrder['status']) => {
    const variants = {
      draft: 'secondary',
      confirmed: 'primary',
      in_progress: 'warning',
      done: 'success',
      cancelled: 'danger',
    } as const;

    return <Badge variant={variants[status]}>{t(status)}</Badge>;
  };

  const getPriorityBadge = (priority: ManufacturingOrder['priority']) => {
    const variants = {
      low: 'secondary',
      medium: 'primary',
      high: 'danger',
    } as const;

    return <Badge variant={variants[priority]}>{t(priority)}</Badge>;
  };

  const columns: Column<ManufacturingOrder>[] = [
    { header: t('order_no'), accessorKey: 'orderNo' },
    { header: t('product_name'), accessorKey: 'productName' },
    { header: t('qty_to_produce'), accessorKey: 'qtyToProduce' },
    { header: t('start_date'), accessorKey: 'startDate' },
    { header: t('end_date'), accessorKey: 'endDate' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item: ManufacturingOrder) => getStatusBadge(item.status),
    },
    {
      header: t('priority'),
      accessorKey: 'priority',
      render: (item: ManufacturingOrder) => getPriorityBadge(item.priority),
    },
    { header: t('responsible'), accessorKey: 'responsible' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: ManufacturingOrder) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOrder(item);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manufacturing_orders')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_mo')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedOrder(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('create_mo')}
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
                { label: t('all_statuses'), value: 'all' },
                { label: t('draft'), value: 'draft' },
                { label: t('confirmed'), value: 'confirmed' },
                { label: t('in_progress'), value: 'in_progress' },
                { label: t('done'), value: 'done' },
                { label: t('cancelled'), value: 'cancelled' },
              ]}
              className="w-48"
            />
            <Select
              options={[
                { label: t('all_priorities'), value: 'all' },
                { label: t('low'), value: 'low' },
                { label: t('medium'), value: 'medium' },
                { label: t('high'), value: 'high' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={ordersData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder ? t('edit_mo') : t('create_mo')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_name')} *</label>
              <Input defaultValue={selectedOrder?.productName} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('qty_to_produce')} *</label>
              <Input type="number" defaultValue={selectedOrder?.qtyToProduce} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('start_date')} *</label>
              <Input type="date" defaultValue={selectedOrder?.startDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('end_date')} *</label>
              <Input type="date" defaultValue={selectedOrder?.endDate} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('priority')} *</label>
              <Select
                options={[
                  { label: t('low'), value: 'low' },
                  { label: t('medium'), value: 'medium' },
                  { label: t('high'), value: 'high' },
                ]}
                defaultValue={selectedOrder?.priority}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('responsible')} *</label>
              <Input defaultValue={selectedOrder?.responsible} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedOrder ? t('submit') : t('create_mo')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

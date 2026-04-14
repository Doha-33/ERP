
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2, CheckCircle, MoreVertical } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { PurchaseOrder } from '../../types';
import { PurchaseOrderModal } from '../../components/purchase/PurchaseOrderModal';

export const PurchaseOrders: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<PurchaseOrder | null>(null);

  const filteredOrders = purchaseOrders.filter(o =>
    (typeof o.supplierId === 'object' ? o.supplierId?.supplierName : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (order: PurchaseOrder) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (orderToEdit) {
      updatePurchaseOrder({ ...orderToEdit, ...data, id: orderToEdit._id || orderToEdit.id });
    } else {
      addPurchaseOrder(data);
    }
  };

  const columns = [
    { key: 'referenceNo', header: t('order_no') },
    { 
      key: 'supplierId', 
      header: t('supplier_name'),
      render: (o: PurchaseOrder) => typeof o.supplierId === 'object' ? o.supplierId?.supplierName : o.supplierId
    },
    { 
      key: 'items', 
      header: t('items'),
      render: (o: PurchaseOrder) => (
        <div className="text-xs">
          {o.items.map((item, idx) => (
            <div key={idx}>{item.sku || 'Item'} ({item.quantity})</div>
          ))}
        </div>
      )
    },
    { 
      key: 'orderDate', 
      header: t('order_date'),
      render: (o: PurchaseOrder) => new Date(o.orderDate).toLocaleDateString()
    },
    {
      key: 'paymentStatus',
      header: t('payment_status'),
      render: (order: PurchaseOrder) => (
        <span className={`flex items-center gap-1 font-medium ${
          order.paymentStatus === 'PAID' ? 'text-green-500' : order.paymentStatus === 'PARTIAL' ? 'text-orange-500' : 'text-red-500'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {t(order.paymentStatus.toLowerCase())}
        </span>
      ),
    },
    {
      key: 'deliveryStatus',
      header: t('delivery_status'),
      render: (order: PurchaseOrder) => (
        <Badge status={order.deliveryStatus === 'DELIVERED' ? 'Active' : order.deliveryStatus === 'PROCESSING' ? 'Warning' : 'Inactive'}>
          {t(order.deliveryStatus.toLowerCase())}
        </Badge>
      ),
    },
    { 
      key: 'totalAmount', 
      header: t('total'),
      render: (o: PurchaseOrder) => o.totalAmount.toLocaleString()
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (order: PurchaseOrder) => (
        <div className="relative group">
          <button className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <MoreVertical size={16} />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button onClick={() => handleEdit(order)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
              <Edit2 size={14} /> {t('edit_order')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
              <CheckCircle size={14} /> {t('mark_as_delivered')}
            </button>
            <button onClick={() => deletePurchaseOrder(order._id || order.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500 flex items-center gap-2">
              <Trash2 size={14} /> {t('delete_purchase_order')}
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{t('purchase_order')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_purchase_order')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setOrderToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_purchase_order')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Input type="date" className="w-40" />
            <Select
              options={[{ value: 'all', label: t('branches') }]}
              className="w-40"
            />
            <Select
              options={[{ value: 'all', label: t('states') }]}
              className="w-40"
            />
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredOrders} keyExtractor={(o) => o._id || o.id} />
      </Card>

      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        orderToEdit={orderToEdit}
      />
    </div>
  );
};


import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown, Dropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { SalesOrder } from '../../types';
import { OrderModal } from '../../components/sales/OrderModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';

import { useAuth } from '../../context/AuthContext';

export const Orders: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSave = async (order: SalesOrder) => {
    if (editingOrder) {
      await updateSalesOrder(order);
    } else {
      await addSalesOrder(order);
    }
    setIsModalOpen(false);
  };

  const handleEdit = useCallback((order: SalesOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteSalesOrder(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteSalesOrder]);

  const filtered = useMemo(() => {
    if (!Array.isArray(salesOrders)) return [];
    
    let result = salesOrders;
    
    // RBAC Filtering
    if (user?.role === 'employee' && currentUserEmployee) {
      result = result.filter(o => {
        const salespersonId = typeof o.salespersonId === 'object' ? o.salespersonId?.id : o.salespersonId;
        return salespersonId === currentUserEmployee.id;
      });
    }

    return result.filter(o => {
      const customerName = o.customerId?.customerName || '';
      const productNames = o.items?.map(i => i.productId?.productName || i.sku).join(' ') || '';
      
      const matchesSearch = o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productNames.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [salesOrders, searchTerm, user, currentUserEmployee]);

  const columns: Column<SalesOrder>[] = useMemo(() => [
    { header: 'Order No.', accessorKey: 'orderNo', className: 'text-gray-600 dark:text-gray-300' },
    { 
      header: 'Order / Customer Info', 
      render: (o) => (
        <div className="flex flex-col">
           <span className="font-medium text-gray-900 dark:text-white">{o.customerId?.customerName || 'N/A'}</span>
           <span className="text-xs text-gray-500">{o.customerId?.phone || ''}</span>
           <span className="text-xs text-gray-500">{o.customerId?.email || ''}</span>
           <span className="text-xs text-gray-500">{o.customerId?.address || ''}</span>
        </div>
      )
    },
    { 
      header: 'Date', 
      render: (o) => (
        <div className="flex flex-col">
          <span className="text-gray-600">{new Date(o.orderDate).toLocaleDateString()}</span>
          <span className="text-xs text-gray-400">{new Date(o.orderDate).toLocaleTimeString()}</span>
        </div>
      )
    },
    { 
      header: 'Product', 
      render: (o) => (
        <div className="flex flex-col gap-1">
          {o.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">{item.productId?.productName || item.sku}</span>
              <span className="text-gray-400 text-xs">x{item.quantity}</span>
              <span className="text-gray-400 text-xs">({item.unitPrice})</span>
            </div>
          ))}
        </div>
      )
    },
    { header: 'Company Name', render: (o) => o.companyId?.name || 'N/A', className: 'text-gray-500' },
    { header: 'Branch', render: (o) => o.branchId?.name || 'N/A', className: 'text-gray-500' },
    { 
      header: 'Total', 
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-bold text-primary">{o.totalAmount}</span>
          <span className="text-[10px] text-gray-400">Tax: {o.taxAmount}</span>
        </div>
      )
    },
    { 
      header: 'Payment Status', 
      render: (o) => (
        <Badge 
          status={o.paymentStatus === 'PAID' ? 'Active' : o.paymentStatus === 'PARTIALLY_PAID' ? 'Pending' : 'Inactive'}
          label={o.paymentStatus}
        />
      )
    },
    { header: 'Salesperson', render: (o) => o.salespersonId?.fullName || 'N/A', className: 'text-gray-500' },
    {
      header: 'Actions',
      className: 'text-center',
      render: (o) => (
        <Dropdown 
          trigger={<button className="p-1 text-gray-400 hover:text-primary"><MoreHorizontal size={20} /></button>} 
          items={[
            { label: 'Sale Details', icon: <Eye size={16}/>, onClick: () => navigate(`/sales/orders/${o.id}`) },
            { label: 'Edit Order', icon: <Edit2 size={16}/>, onClick: () => handleEdit(o) },
            { label: 'Delete Order', icon: <Trash2 size={16}/>, variant: 'danger', onClick: () => handleDelete(o.id) }
          ]} 
        />
      )
    }
  ], [t, handleEdit, handleDelete, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('orders')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your Orders</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={salesOrders} filename="orders_list" />
           <Button onClick={() => { setEditingOrder(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> Add Sales
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] !p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                  <input type="date" className="pl-4 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="2025-02-10" />
              </div>
              <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[140px]">
                      <option value="">Payment State</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[120px]">
                      <option value="">Customer</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
           </div>

           <div className="w-full md:w-64 relative">
             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary" />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
        </div>

        <Table 
          data={filtered}
          columns={columns}
          keyExtractor={(item) => item.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          className="border-none"
          minWidth="min-w-[2000px]"
        />
      </Card>

      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} orderToEdit={editingOrder} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};


import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { SalesInvoice } from '../../types';
import { InvoiceModal } from '../../components/sales/InvoiceModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';

export const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { salesInvoices, addSalesInvoice, updateSalesInvoice, deleteSalesInvoice } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSave = async (invoice: SalesInvoice) => {
    if (editingInvoice) {
      await updateSalesInvoice(invoice);
    } else {
      await addSalesInvoice(invoice);
    }
    setIsModalOpen(false);
  };

  const handleEdit = useCallback((invoice: SalesInvoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteSalesInvoice(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteSalesInvoice]);

  const filtered = useMemo(() => {
    return salesInvoices.filter(i => {
      const invoiceNumber = i.invoiceNumber || '';
      const orderNo = i.salesOrderId?.orderNo || '';
      const warehouseName = i.warehouseId?.name || '';
      const customerName = i.customerId?.name || '';
      
      const matchesSearch = invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [salesInvoices, searchTerm]);

  const columns: Column<SalesInvoice>[] = useMemo(() => [
    { header: 'Invoice No', accessorKey: 'invoiceNumber', className: 'text-gray-600 dark:text-gray-300' },
    { header: 'Order No', render: (i) => i.salesOrderId?.orderNo || 'N/A', className: 'text-gray-500' },
    { header: 'Customer', render: (i) => i.customerId?.name || 'N/A', className: 'text-gray-500' },
    { 
      header: 'Date Issued', 
      render: (i) => new Date(i.issuedDate).toLocaleDateString(),
      className: 'text-gray-500' 
    },
    { 
      header: 'Due Date', 
      render: (i) => i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A',
      className: 'text-gray-500' 
    },
    { header: 'Warehouse', render: (i) => i.warehouseId?.name || 'N/A', className: 'text-gray-500' },
    { header: 'Total Amount', accessorKey: 'totalAmount', render: (i) => `${i.totalAmount}$`, className: 'text-gray-500 font-bold' },
    { 
      header: 'Payment Status', 
      render: (i) => (
        <Badge 
          status={i.paymentStatus === 'PAID' ? 'Active' : i.paymentStatus === 'PARTIALLY_PAID' ? 'Pending' : 'Inactive'}
          label={i.paymentStatus}
        />
      )
    },
    {
      header: 'Actions',
      className: 'text-center',
      render: (i) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => navigate(`/sales/invoices/${i.id}`)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Eye size={16} />
           </button>
           <button onClick={() => handleEdit(i)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Edit2 size={16} />
           </button>
           <button onClick={() => handleDelete(i.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Trash2 size={16} />
           </button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">Invoices</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your stock invoices</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={salesInvoices} filename="invoices_list" />
           <Button onClick={() => { setEditingInvoice(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> Add Invoices
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
        />
      </Card>

      <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} invoiceToEdit={editingInvoice} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};

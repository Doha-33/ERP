
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, FileText } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { SalesReturn } from '../../types';
import { SalesReturnModal } from '../../components/sales/SalesReturnModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';

export const SalesReturnPage: React.FC = () => {
  const { t } = useTranslation();
  const { salesReturns, addSalesReturn, updateSalesReturn, deleteSalesReturn } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<SalesReturn | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSave = async (ret: SalesReturn) => {
    if (editingReturn) {
      await updateSalesReturn(ret);
    } else {
      await addSalesReturn(ret);
    }
    setIsModalOpen(false);
  };

  const handleEdit = useCallback((ret: SalesReturn) => {
    setEditingReturn(ret);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteSalesReturn(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteSalesReturn]);

  const filtered = useMemo(() => {
    return salesReturns.filter(r => {
      const returnNumber = r.returnNumber || '';
      const invoiceNumber = r.originalInvoiceId?.invoiceNumber || '';
      const customerName = r.customerId?.name || '';
      const productNames = r.items?.map(i => i.productId?.name || i.sku).join(' ') || '';
      
      const matchesSearch = returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productNames.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [salesReturns, searchTerm]);

  const columns: Column<SalesReturn>[] = useMemo(() => [
    { header: 'Return Number', accessorKey: 'returnNumber', className: 'text-gray-600 dark:text-gray-300' },
    { header: 'Invoice No', render: (r) => r.originalInvoiceId?.invoiceNumber || 'N/A', className: 'text-gray-500' },
    { 
      header: 'Customer', 
      render: (r) => (
        <div className="flex items-center gap-3">
           <span className="font-medium text-gray-900 dark:text-white">{r.customerId?.name || 'N/A'}</span>
        </div>
      )
    },
    { 
      header: 'Products', 
      render: (r) => (
        <div className="flex flex-col gap-1">
          {r.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">{item.productId?.name || item.sku}</span>
              <span className="text-gray-400 text-xs">x{item.returnQuantity}</span>
            </div>
          ))}
        </div>
      )
    },
    { 
      header: 'Return Date', 
      render: (r) => new Date(r.returnDate).toLocaleDateString(),
      className: 'text-gray-500' 
    },
    { 
      header: 'Refund Status', 
      render: (r) => (
        <Badge 
          status={r.refundStatus === 'REFUNDED' ? 'Active' : r.refundStatus === 'PENDING' ? 'Pending' : 'Inactive'}
          label={r.refundStatus}
        />
      )
    },
    { header: 'Reason', render: (r) => r.items?.[0]?.reasonForReturn || 'N/A', className: 'text-gray-500' },
    {
      header: 'Actions',
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Edit2 size={16} />
           </button>
           <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Trash2 size={16} />
           </button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">Sales Return</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your returns</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={salesReturns} filename="returns_list" />
           <Button onClick={() => { setEditingReturn(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> Add Sales Return
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
                      <option value="">Return ID</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[140px]">
                      <option value="">Refund Status</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                  <select className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[120px]">
                      <option value="">Product</option>
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
          minWidth="min-w-[1600px]"
        />
      </Card>

      <SalesReturnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} returnToEdit={editingReturn} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};


import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2, Eye, DollarSign } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { PurchaseInvoice } from '../../types';
import { PurchaseInvoiceModal } from '../../components/purchase/PurchaseInvoiceModal';

export const PurchaseInvoices: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseInvoices, addPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<PurchaseInvoice | null>(null);

  const filteredInvoices = purchaseInvoices.filter(i =>
    i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof i.supplierId === 'object' ? i.supplierId?.supplierName : '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (invoice: PurchaseInvoice) => {
    setInvoiceToEdit(invoice);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (invoiceToEdit) {
      updatePurchaseInvoice({ ...invoiceToEdit, ...data, id: invoiceToEdit._id || invoiceToEdit.id });
    } else {
      addPurchaseInvoice(data);
    }
  };

  const columns = [
    { key: 'invoiceNo', header: t('invoice_no') },
    { 
      key: 'supplierId', 
      header: t('supplier_name'),
      render: (i: PurchaseInvoice) => typeof i.supplierId === 'object' ? i.supplierId?.supplierName : i.supplierId
    },
    { 
      key: 'invoiceDate', 
      header: t('invoice_date'),
      render: (i: PurchaseInvoice) => new Date(i.invoiceDate).toLocaleDateString()
    },
    { 
      key: 'dueDate', 
      header: t('due_date'),
      render: (i: PurchaseInvoice) => new Date(i.dueDate).toLocaleDateString()
    },
    { 
      key: 'warehouseId', 
      header: t('warehouse'),
      render: (i: PurchaseInvoice) => typeof i.warehouseId === 'object' ? i.warehouseId?.warehouseName : i.warehouseId
    },
    {
      key: 'paymentStatus',
      header: t('payment_status'),
      render: (invoice: PurchaseInvoice) => (
        <span className={`flex items-center gap-1 font-medium ${
          invoice.paymentStatus === 'PAID' ? 'text-green-500' : invoice.paymentStatus === 'PARTIAL' ? 'text-orange-500' : 'text-red-500'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {t(invoice.paymentStatus.toLowerCase())}
        </span>
      ),
    },
    {
      key: 'deliveryStatus',
      header: t('delivery_status'),
      render: (invoice: PurchaseInvoice) => (
        <Badge status={invoice.deliveryStatus === 'DELIVERED' ? 'Active' : invoice.deliveryStatus === 'PROCESSING' ? 'Warning' : 'Inactive'}>
          {t(invoice.deliveryStatus.toLowerCase())}
        </Badge>
      ),
    },
    { 
      key: 'totalAmount', 
      header: t('total_amount'),
      render: (i: PurchaseInvoice) => i.totalAmount.toLocaleString()
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (invoice: PurchaseInvoice) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(invoice)} className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Eye size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <DollarSign size={16} />
          </button>
          <button onClick={() => deletePurchaseInvoice(invoice._id || invoice.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
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
          <h1 className="text-2xl font-bold dark:text-white">{t('purchase_invoice')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_purchase_invoice')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setInvoiceToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_purchase_invoice')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Input type="date" className="w-40" />
            <Select
              options={[{ value: 'all', label: t('invoice_no') }]}
              className="w-40"
            />
            <Select
              options={[{ value: 'all', label: t('payment_status') }]}
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
        <Table columns={columns} data={filteredInvoices} keyExtractor={(i) => i._id || i.id} />
      </Card>

      <PurchaseInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        invoiceToEdit={invoiceToEdit}
      />
    </div>
  );
};

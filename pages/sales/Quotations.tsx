
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Download, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Quotation } from '../../types';
import { useData } from '../../context/DataContext';
import { QuotationModal } from '../../components/sales/QuotationModal';

export const Quotations: React.FC = () => {
  const { t } = useTranslation();
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return quotations.filter(q => {
      const customerName = typeof q.customerId === 'object' ? q.customerId.customerName : '';
      return (
        q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [quotations, searchTerm]);

  const columns: Column<Quotation>[] = [
    { header: t('quotation_no'), accessorKey: 'quotationNo' },
    { 
      header: t('customer'), 
      render: (item) => typeof item.customerId === 'object' ? item.customerId.customerName : item.customerId 
    },
    { header: t('quotation_date'), accessorKey: 'quotationDate' },
    { header: t('expiration_date'), accessorKey: 'expirationDate' },
    { header: t('subtotal'), accessorKey: 'subtotal' },
    { header: t('discount'), accessorKey: 'discountAmount' },
    { header: t('tax'), accessorKey: 'taxAmount' },
    { header: t('total'), accessorKey: 'totalAmount' },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'DRAFT' ? 'Secondary' : item.status === 'SENT' ? 'Active' : 'Inactive'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingQuotation(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deleteQuotation(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('quotations')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_quotations')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} />
            {t('export')}
          </Button>
          <Button onClick={() => { setEditingQuotation(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} />
            {t('add_quotations')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder={t('search')} 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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

      <QuotationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(quotation) => {
          if (editingQuotation) updateQuotation(quotation);
          else addQuotation(quotation);
          setIsModalOpen(false);
        }}
        quotationToEdit={editingQuotation}
      />
    </div>
  );
};

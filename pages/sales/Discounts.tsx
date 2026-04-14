
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Download, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Discount } from '../../types';
import { useData } from '../../context/DataContext';
import { DiscountModal } from '../../components/sales/DiscountModal';

export const Discounts: React.FC = () => {
  const { t } = useTranslation();
  const { discounts, addDiscount, updateDiscount, deleteDiscount } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return discounts.filter(d => {
      const discountName = d.discountName || '';
      const customerName = d.customerId?.name || '';
      const productName = d.productId?.name || '';
      
      const matchesSearch = discountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [discounts, searchTerm]);

  const columns: Column<Discount>[] = [
    { header: t('discount_name'), accessorKey: 'discountName' },
    { header: 'Type', accessorKey: 'type', className: 'text-xs' },
    { header: 'Value', render: (item) => item.type === 'PERCENTAGE' ? `${item.value}%` : `${item.value}$` },
    { 
      header: 'Applies To', 
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold">{item.appliesTo}</span>
          <span className="text-xs text-gray-500">
            {item.appliesTo === 'PRODUCT' ? item.productId?.name : 
             item.appliesTo === 'CUSTOMER' ? item.customerId?.name : 
             item.appliesTo === 'CATEGORY' ? item.categoryId : 'All'}
          </span>
        </div>
      )
    },
    { header: 'Start Date', render: (item) => item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A' },
    { header: 'End Date', render: (item) => item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A' },
    { 
      header: t('state'), 
      render: (item) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingDiscount(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deleteDiscount(item.id)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('discounts')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_discounts')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} />
            {t('export')}
          </Button>
          <Button onClick={() => { setEditingDiscount(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} />
            {t('add_discounts')}
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
            <div className="flex items-center gap-2">
              <Select 
                options={[
                  { value: 'all', label: t('product') },
                  { value: 'laptop', label: 'Laptop' },
                ]}
                className="w-32"
              />
              <Select 
                options={[
                  { value: 'all', label: t('customer') },
                  { value: 'mohamed', label: 'Mohamed' },
                ]}
                className="w-32"
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

      <DiscountModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(discount) => {
          if (editingDiscount) updateDiscount(discount);
          else addDiscount(discount);
          setIsModalOpen(false);
        }}
        discountToEdit={editingDiscount}
      />
    </div>
  );
};

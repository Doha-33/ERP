
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Download, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Product } from '../../types';
import { useData } from '../../context/DataContext';
import { ProductModal } from '../../components/sales/ProductModal';

export const Products: React.FC = () => {
  const { t } = useTranslation();
  const { products, addSalesProduct, updateSalesProduct, deleteSalesProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return products.filter(p => 
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const columns: Column<Product>[] = [
    { header: t('sku'), accessorKey: 'sku' },
    { 
      header: t('name'), 
      render: (item) => (
        <div className="flex items-center gap-2">
          <img src={`https://ui-avatars.com/api/?name=${item.productName}&background=random`} alt={item.productName} className="w-8 h-8 rounded object-cover" referrerPolicy="no-referrer" />
          <span>{item.productName}</span>
        </div>
      )
    },
    { header: t('description'), accessorKey: 'description' },
    { header: t('sales_price'), accessorKey: 'salesPrice' },
    { header: t('cost'), accessorKey: 'cost' },
    { header: t('category'), accessorKey: 'category' },
    { header: t('product_type'), accessorKey: 'productType' },
    { header: t('unit_of_measure'), accessorKey: 'unitOfMeasure' },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'ACTIVE' ? 'Active' : 'Inactive'}>{t(item.status.toLowerCase())}</Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingProduct(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deleteSalesProduct(item.id)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('products')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_products')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} />
            {t('export')}
          </Button>
          <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} />
            {t('add_product')}
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
            <Select 
              options={[
                { value: 'all', label: t('category') },
                { value: 'electronics', label: 'Electronics' },
              ]}
              className="w-40"
            />
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

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(product) => {
          if (editingProduct) updateSalesProduct(product);
          else addSalesProduct(product);
          setIsModalOpen(false);
        }}
        productToEdit={editingProduct}
      />
    </div>
  );
};

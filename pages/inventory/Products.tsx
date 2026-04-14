
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Product } from '../../types';

export const InventoryProducts: React.FC = () => {
  const { t } = useTranslation();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: t('sku'),
      accessor: 'sku' as keyof Product,
    },
    {
      header: t('product_name'),
      accessor: 'name' as keyof Product,
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-10 h-10 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="font-medium">{product.name}</span>
        </div>
      )
    },
    {
      header: t('category'),
      accessor: 'category' as keyof Product,
    },
    {
      header: t('warehouse'),
      accessor: 'warehouse' as keyof Product,
    },
    {
      header: t('current_stock'),
      accessor: 'currentStock' as keyof Product,
      render: (product: Product) => (
        <span className={`font-medium ${product.currentStock <= product.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
          {product.currentStock} {product.defaultUnit}
        </span>
      )
    },
    {
      header: t('price'),
      accessor: 'sellingPrice' as keyof Product,
      render: (product: Product) => (
        <span>{product.sellingPrice} SAR</span>
      )
    },
    {
      header: t('status'),
      accessor: 'expired' as keyof Product,
      render: (product: Product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.expired === 'Expired' ? 'bg-red-100 text-red-700' :
          product.expired === 'Near Expiry' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {t(product.expired.toLowerCase().replace(' ', '_')) || product.expired}
        </span>
      )
    },
    {
      header: t('actions'),
      accessor: 'id' as keyof Product,
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye size={18} />
          </button>
          <button 
            onClick={() => {
              setSelectedProduct(product);
              setIsModalOpen(true);
            }}
            className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => deleteProduct(product.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('products')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_inventory_products')}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_product')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_products')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter size={20} />
            <span>{t('filter')}</span>
          </button>
        </div>

        <Table 
          columns={columns} 
          data={filteredProducts} 
          keyExtractor={(item) => item.id}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? t('edit_product') : t('add_product')}
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          // Form logic would go here
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('product_name')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedProduct?.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('sku')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedProduct?.sku} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('category')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent">
                <option value="">{t('select_category')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('warehouse')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent">
                <option value="">{t('select_warehouse')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('purchase_price')}</label>
              <input type="number" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedProduct?.purchasePrice} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('selling_price')}</label>
              <input type="number" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedProduct?.sellingPrice} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

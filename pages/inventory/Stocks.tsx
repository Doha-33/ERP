
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Eye, ArrowRightLeft } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Table } from '../../components/ui/Table';
import { Stock } from '../../types';

export const Stocks: React.FC = () => {
  const { t } = useTranslation();
  const { stocks } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: t('sku'),
      accessorKey: 'sku' as keyof Stock,
    },
    {
      header: t('product_name'),
      accessorKey: 'productName' as keyof Stock,
      render: (stock: Stock) => <span className="font-medium">{stock.productName || (stock as any).name}</span>
    },
    {
      header: t('warehouse'),
      accessorKey: 'warehouse' as keyof Stock,
    },
    {
      header: t('in_stock'),
      accessorKey: 'inStockQty' as keyof Stock,
      render: (stock: Stock) => (
        <span className="font-medium">{stock.inStockQty} {stock.unit}</span>
      )
    },
    {
      header: t('reserved'),
      accessorKey: 'reservedQty' as keyof Stock,
      render: (stock: Stock) => (
        <span className="text-gray-500">{stock.reservedQty} {stock.unit}</span>
      )
    },
    {
      header: t('available'),
      accessorKey: 'availableQty' as keyof Stock,
      render: (stock: Stock) => (
        <span className="font-bold text-primary">{stock.availableQty} {stock.unit}</span>
      )
    },
    {
      header: t('status'),
      accessorKey: 'status' as keyof Stock,
      render: (stock: Stock) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          stock.status === 'In Stock' ? 'bg-green-100 text-green-700' :
          stock.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {t(stock.status.toLowerCase().replace(' ', '_')) || stock.status}
        </span>
      )
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Stock,
      render: (stock: Stock) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('view_details')}>
            <Eye size={18} />
          </button>
          <button className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title={t('transfer_stock')}>
            <ArrowRightLeft size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredStocks = stocks.filter(s => 
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('stock_inventory')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('monitor_stock_levels')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_stock')}
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
          data={filteredStocks} 
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
};

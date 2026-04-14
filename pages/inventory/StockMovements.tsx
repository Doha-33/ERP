
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Table } from '../../components/ui/Table';
import { StockMovement } from '../../types';

export const StockMovements: React.FC = () => {
  const { t } = useTranslation();
  const { stockMovements } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: t('date'),
      accessor: 'date' as keyof StockMovement,
    },
    {
      header: t('product_name'),
      accessor: 'productName' as keyof StockMovement,
      render: (m: StockMovement) => <span className="font-medium">{m.productName}</span>
    },
    {
      header: t('warehouse'),
      accessor: 'warehouse' as keyof StockMovement,
    },
    {
      header: t('quantity'),
      accessor: 'qty' as keyof StockMovement,
      render: (m: StockMovement) => (
        <div className="flex items-center gap-1 font-medium">
          {m.type === 'In' ? (
            <ArrowDownLeft size={16} className="text-green-600" />
          ) : (
            <ArrowUpRight size={16} className="text-red-600" />
          )}
          <span className={m.type === 'In' ? 'text-green-600' : 'text-red-600'}>
            {m.type === 'In' ? '+' : '-'}{m.qty}
          </span>
        </div>
      )
    },
    {
      header: t('reference'),
      accessor: 'reference' as keyof StockMovement,
    },
    {
      header: t('user'),
      accessor: 'userName' as keyof StockMovement,
      render: (m: StockMovement) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{m.userName}</span>
          <span className="text-xs text-gray-500">{m.userRole}</span>
        </div>
      )
    }
  ];

  const filteredMovements = stockMovements.filter(m => 
    m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('stock_movements')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('track_stock_history')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_movements')}
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
          data={filteredMovements} 
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
};

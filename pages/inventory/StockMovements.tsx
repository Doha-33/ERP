import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Package, Calendar, User, Hash, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StockMovement } from '../../types';

export const StockMovements: React.FC = () => {
  const { t } = useTranslation();
  const { stockMovements } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check for search in URL hash params
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(hash.split('?')[1]);
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(decodeURIComponent(urlSearch));
    }
  }, []);

  // Helper function to get product name from nested object or string
  const getProductName = (movement: any): string => {
    if (movement.productName) return movement.productName;
    if (movement.productId) {
      if (typeof movement.productId === 'object') {
        return movement.productId.productName || movement.productId.name || 'Unknown Product';
      }
    }
    return 'Unknown Product';
  };

  // Helper function to get warehouse name
  const getWarehouseName = (movement: any): string => {
    if (movement.warehouse) return movement.warehouse;
    if (movement.warehouseId) {
      if (typeof movement.warehouseId === 'object') {
        return movement.warehouseId.warehouseName || movement.warehouseId.name || 'Unknown Warehouse';
      }
      return movement.warehouseId;
    }
    return '-';
  };

  // Helper function to get reference type display
  const getReferenceTypeDisplay = (referenceType: string): { label: string; color: string } => {
    const types: Record<string, { label: string; color: string }> = {
      'manual_opening_balance': { label: 'Opening Balance', color: 'bg-blue-100 text-blue-700' },
      'purchase_order': { label: 'Purchase Order', color: 'bg-green-100 text-green-700' },
      'sales_order': { label: 'Sales Order', color: 'bg-purple-100 text-purple-700' },
      'return': { label: 'Return', color: 'bg-yellow-100 text-yellow-700' },
      'adjustment': { label: 'Adjustment', color: 'bg-orange-100 text-orange-700' },
      'transfer': { label: 'Transfer', color: 'bg-indigo-100 text-indigo-700' },
    };
    return types[referenceType] || { label: referenceType || 'Manual', color: 'bg-gray-100 text-gray-700' };
  };

  const filteredMovements = useMemo(() => {
    return stockMovements.filter((movement: any) => {
      // Search filter
      const productName = getProductName(movement).toLowerCase();
      const referenceId = (movement.referenceId || movement.reference || '').toLowerCase();
      const notes = (movement.notes || '').toLowerCase();
      const matchesSearch = productName.includes(searchTerm.toLowerCase()) ||
                           referenceId.includes(searchTerm.toLowerCase()) ||
                           notes.includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = selectedType === 'ALL' || 
                         (selectedType === 'IN' && movement.movementType === 'IN') ||
                         (selectedType === 'OUT' && movement.movementType === 'OUT');

      return matchesSearch && matchesType;
    });
  }, [stockMovements, searchTerm, selectedType]);

  const stats = useMemo(() => {
    const totalIn = filteredMovements.filter(m => m.movementType === 'IN').reduce((sum, m) => sum + m.qty, 0);
    const totalOut = filteredMovements.filter(m => m.movementType === 'OUT').reduce((sum, m) => sum + m.qty, 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [filteredMovements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('stock_movements')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('track_stock_history')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total In</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+{stats.totalIn}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Out</p>
              <p className="text-2xl font-bold text-red-600 mt-1">-{stats.totalOut}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Movement</p>
              <p className={`text-2xl font-bold mt-1 ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.net >= 0 ? `+${stats.net}` : `${stats.net}`}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('search_by_product_reference')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Type Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {['ALL', 'IN', 'OUT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    selectedType === type
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type === 'ALL' ? t('all') : type === 'IN' ? t('stock_in') : t('stock_out')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filteredMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No movements found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Warehouse</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.map((movement: any) => {
                  const refType = getReferenceTypeDisplay(movement.referenceType);
                  const date = new Date(movement.movementDate || movement.createdAt);
                  
                  return (
                    <tr key={movement._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {date.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {date.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getProductName(movement)}
                            </p>
                            {movement.productId?.sku && (
                              <p className="text-xs text-gray-500">SKU: {movement.productId.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {getWarehouseName(movement)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {movement.movementType === 'IN' ? (
                            <ArrowDownLeft size={16} className="text-green-600" />
                          ) : (
                            <ArrowUpRight size={16} className="text-red-600" />
                          )}
                          <span className={`text-sm font-semibold ${movement.movementType === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.movementType === 'IN' ? '+' : '-'}{movement.qty}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {movement.referenceId || movement.reference || '-'}
                          </p>
                          {movement.notes && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{movement.notes}</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${refType.color}`}>
                          {refType.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer with count */}
        {filteredMovements.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {filteredMovements.length} of {stockMovements.length} movements
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
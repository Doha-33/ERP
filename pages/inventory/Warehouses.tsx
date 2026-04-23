
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, MapPin, User, Phone, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Warehouse } from '../../types';

export const Warehouses: React.FC = () => {
  const { t } = useTranslation();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: t('warehouse_name'),
      accessorKey: 'warehouseName' as keyof Warehouse,
      render: (wh: Warehouse) => <span className="font-medium">{wh.warehouseName || (wh as any).name}</span>
    },
    {
      header: t('location'),
      accessorKey: 'location' as keyof Warehouse,
      render: (wh: Warehouse) => (
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin size={14} />
          <span>{wh.location}</span>
        </div>
      )
    },
    {
      header: t('manager'),
      accessorKey: 'managerName' as keyof Warehouse,
      render: (wh: Warehouse) => (
        <div className="flex items-center gap-1">
          <User size={14} className="text-gray-400" />
          <span>{wh.managerName}</span>
        </div>
      )
    },
    {
      header: t('type'),
      accessorKey: 'type' as keyof Warehouse,
    },
    {
      header: t('status'),
      accessorKey: 'state' as keyof Warehouse,
      render: (wh: Warehouse) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          wh.state === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {t(wh.state.toLowerCase()) || wh.state}
        </span>
      )
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Warehouse,
      render: (wh: Warehouse) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedWarehouse(wh);
              setIsModalOpen(true);
            }}
            className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => deleteWarehouse(wh.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredWarehouses = warehouses.filter(w => 
    w.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('warehouses')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_storage_locations')}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedWarehouse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_warehouse')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_warehouses')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredWarehouses} 
          keyExtractor={(item) => item.id}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedWarehouse ? t('edit_warehouse') : t('add_warehouse')}
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('warehouse_name')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.warehouseName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('location')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.location} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('manager')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.managerName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('phone_number')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.phoneNumber} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('type')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.type}>
                <option value="MAIN_WAREHOUSE">Main Warehouse</option>
                <option value="DISTRIBUTION_CENTER">Distribution Center</option>
                <option value="RETAIL_STORE">Retail Store</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('status')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedWarehouse?.state}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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

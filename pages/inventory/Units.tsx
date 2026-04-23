
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Unit } from '../../types';

export const Units: React.FC = () => {
  const { t } = useTranslation();
  const { units, addUnit, updateUnit, deleteUnit } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      header: t('unit_name'),
      accessorKey: 'name' as keyof Unit,
      render: (unit: Unit) => <span className="font-medium">{unit.name}</span>
    },
    {
      header: t('abbreviation'),
      accessorKey: 'abbreviation' as keyof Unit,
    },
    {
      header: t('conversion_factor'),
      accessorKey: 'conversionFactor' as keyof Unit,
    },
    {
      header: t('created_at'),
      accessorKey: 'createdAt' as keyof Unit,
    },
    {
      header: t('status'),
      accessorKey: 'state' as keyof Unit,
      render: (unit: Unit) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          unit.state === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {t(unit.state.toLowerCase()) || unit.state}
        </span>
      )
    },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof Unit,
      render: (unit: Unit) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedUnit(unit);
              setIsModalOpen(true);
            }}
            className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => deleteUnit(unit.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('units_of_measure')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_product_units')}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedUnit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          <span>{t('add_unit')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('search_units')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredUnits} 
          keyExtractor={(item) => item.id}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUnit ? t('edit_unit') : t('add_unit')}
      >
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('unit_name')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedUnit?.name} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('abbreviation')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedUnit?.abbreviation} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('conversion_factor')}</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedUnit?.conversionFactor} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('status')}</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue={selectedUnit?.state}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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

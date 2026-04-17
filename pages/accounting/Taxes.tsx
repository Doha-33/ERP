import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Percent } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Tax } from '../../types';
import { TaxModal } from '../../components/accounting/TaxModal';

export const Taxes: React.FC = () => {
  const { t } = useTranslation();
  const { taxes, accountingLoading, addTax, updateTax, deleteTax } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);

  const handleOpenAdd = () => {
    setSelectedTax(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedTax) {
        await updateTax(selectedTax._id || selectedTax.id, data);
      } else {
        await addTax(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        await deleteTax(id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const columns: Column<Tax>[] = [
    { header: t('tax_name'), accessorKey: 'taxName' },
    { header: t('tax_code'), accessorKey: 'taxCode' },
    { header: t('tax_type'), accessorKey: 'taxType' },
    { 
      header: t('rate'), 
      render: (item) => `${item.rate}%` 
    },
    {
      header: t('status'),
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? t('active') : t('inactive')}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(item._id || item.id)}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('taxes')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_tax_rates_and_settings')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={taxes} filename="taxes" />
          <Button onClick={handleOpenAdd}>
            <Plus size={20} /> {t('add_tax')}
          </Button>
        </div>
      </div>

      <Card>
        <Table 
          data={taxes} 
          columns={columns} 
          keyExtractor={(item) => item._id || item.id} 
          isLoading={accountingLoading} 
        />
      </Card>

      <TaxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedTax}
        isLoading={accountingLoading}
      />
    </div>
  );
};

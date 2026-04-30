import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { CurrencyAddModal } from '../../components/accounting/CurrencyAddModal';
import { CurrencyEditModal } from '../../components/accounting/CurrencyEditModal';
import { useData } from '../../context/DataContext';
import { Currency } from '../../types';
import { toast } from 'sonner';

export const Currencies: React.FC = () => {
  const { t } = useTranslation();
  const { currencies, accountingLoading, addCurrency, updateCurrency, deleteCurrency } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [currencyIdToDelete, setCurrencyIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = currencies.filter(currency => 
    (currency.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (currency.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (data: any) => {
    try {
      await addCurrency(data);
      toast.success(t('currency_added_successfully'));
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_currency'));
      throw error;
    }
  };

  const handleEdit = async (data: any) => {
    const id = selectedCurrency?._id || selectedCurrency?.id;
    if (!id) return;
    try {
      await updateCurrency(id, data);
      toast.success(t('currency_updated_successfully'));
      setIsEditModalOpen(false);
      setSelectedCurrency(null);
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_currency'));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!currencyIdToDelete) return;
    try {
      await deleteCurrency(currencyIdToDelete);
      setIsDeleteModalOpen(false);
      setCurrencyIdToDelete(null);
      toast.success(t('currency_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_currency'));
    }
  };

  const columns: Column<Currency>[] = [
    {
      header: t('code'),
      accessorKey: 'code',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <DollarSign size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-sm text-gray-900">{item.code}</span>
        </div>
      )
    },
    { header: t('name'), accessorKey: 'name' },
    { header: t('symbol'), accessorKey: 'symbol' },
    { 
      header: t('base_currency'), 
      render: (item) => (
        <Badge variant={item.isBaseCurrency ? 'success' : 'neutral'}>
          {item.isBaseCurrency ? t('yes') : t('no')}
        </Badge>
      )
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
            onClick={() => { 
              setSelectedCurrency(item); 
              setIsEditModalOpen(true); 
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { 
              setCurrencyIdToDelete(item._id || item.id || ''); 
              setIsDeleteModalOpen(true); 
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('currencies')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('manage_available_currencies')}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={currencies} filename="currencies" />
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_currency')}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 flex flex-wrap gap-4 items-center bg-white rounded-lg border border-gray-100">
        <Input 
          placeholder={t('search_currencies')} 
          icon={<Search size={18} />} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      {/* Table */}
        <Table 
          data={filteredCurrencies} 
          columns={columns} 
          keyExtractor={(item) => item._id || item.id || ''} 
          isLoading={accountingLoading}
          selectable
        />

      {/* Add Modal */}
      <CurrencyAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
        loading={accountingLoading}
      />

      {/* Edit Modal */}
      <CurrencyEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCurrency(null);
        }}
        selectedCurrency={selectedCurrency}
        onSave={handleEdit}
        loading={accountingLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_currency')}
        message={t('are_you_sure_delete_currency')}
      />
    </div>
  );
};
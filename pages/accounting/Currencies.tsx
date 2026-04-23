import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Search, DollarSign } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown, Select } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Currency } from '../../types';
import { toast } from 'sonner';

export const Currencies: React.FC = () => {
  const { t } = useTranslation();
  const { currencies, accountingLoading, addCurrency, updateCurrency, deleteCurrency } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Currency | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = currencies.filter(currency => 
    (currency.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (currency.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const columns: Column<Currency>[] = [
    { header: t('code'), accessorKey: 'code' },
    { header: t('name'), accessorKey: 'name' },
    { header: t('symbol'), accessorKey: 'symbol' },
    { 
      header: t('base_currency'), 
      render: (item) => (
        <Badge status={item.isBaseCurrency ? 'success' : 'default'}>
          {item.isBaseCurrency ? t('yes') : t('no')}
        </Badge>
      )
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? t('active') : t('inactive')}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedRecord(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setRecordIdToDelete(item._id || item.id || ''); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      name: formData.get('name'),
      symbol: formData.get('symbol'),
      isBaseCurrency: formData.get('isBaseCurrency') === 'true',
      isActive: true
    };
    try {
      await addCurrency(data);
      setIsAddModalOpen(false);
      toast.success(t('currency_added_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_add_currency'));
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = selectedRecord?._id || selectedRecord?.id;
    if (!id) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      name: formData.get('name'),
      symbol: formData.get('symbol'),
      isBaseCurrency: formData.get('isBaseCurrency') === 'true',
      isActive: formData.get('isActive') === 'true'
    };
    try {
      await updateCurrency(id, data);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      toast.success(t('currency_updated_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_update_currency'));
    }
  };

  const handleDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await deleteCurrency(recordIdToDelete);
      setIsDeleteModalOpen(false);
      setRecordIdToDelete(null);
      toast.success(t('currency_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_currency'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('currencies')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_available_currencies')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={currencies} filename="currencies" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_currency')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <Input 
            placeholder={t('search_currencies')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Table 
          data={filteredCurrencies} 
          columns={columns} 
          keyExtractor={(item) => item._id || ''} 
          isLoading={accountingLoading}
        />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={t('add_currency')}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('code')} name="code" placeholder="USD" required />
            <Input label={t('symbol')} name="symbol" placeholder="$" required />
          </div>
          <Input label={t('name')} name="name" placeholder="US Dollar" required fullWidth />
          <Select 
            label={t('base_currency')} 
            name="isBaseCurrency"
            options={[
              { value: 'false', label: t('no') },
              { value: 'true', label: t('yes') }
            ]} 
            required 
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('create_currency')}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={t('edit_currency')}
      >
        <form onSubmit={handleEdit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('code')} name="code" defaultValue={selectedRecord?.code} required />
            <Input label={t('symbol')} name="symbol" defaultValue={selectedRecord?.symbol} required />
          </div>
          <Input label={t('name')} name="name" defaultValue={selectedRecord?.name} required fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={t('base_currency')} 
              name="isBaseCurrency"
              defaultValue={selectedRecord?.isBaseCurrency ? 'true' : 'false'}
              options={[
                { value: 'false', label: t('no') },
                { value: 'true', label: t('yes') }
              ]} 
              required 
            />
            <Select 
              label={t('status')} 
              name="isActive"
              defaultValue={selectedRecord?.isActive ? 'true' : 'false'}
              options={[
                { value: 'true', label: t('active') },
                { value: 'false', label: t('inactive') }
              ]} 
              required 
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={accountingLoading}>{t('save')}</Button>
          </div>
        </form>
      </Modal>

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

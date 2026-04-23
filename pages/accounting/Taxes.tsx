import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Percent, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Tax } from '../../types';
import { TaxModal } from '../../components/accounting/TaxModal';
import { toast } from 'sonner';

export const Taxes: React.FC = () => {
  const { t } = useTranslation();
  const { taxes, accountingLoading, addTax, updateTax, deleteTax } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [taxIdToDelete, setTaxIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTaxes = taxes.filter(tax => 
    (tax.taxName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tax.taxCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (tax.taxType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
        toast.success(t('tax_updated_successfully'));
      } else {
        await addTax(data);
        toast.success(t('tax_added_successfully'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_save_tax'));
    }
  };

  const handleDelete = async () => {
    if (!taxIdToDelete) return;
    try {
      await deleteTax(taxIdToDelete);
      setIsDeleteModalOpen(false);
      setTaxIdToDelete(null);
      toast.success(t('tax_deleted_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_delete_tax'));
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
            onClick={() => { setTaxIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
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
        <div className="mb-4">
          <Input 
            placeholder={t('search_taxes')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Table 
          data={filteredTaxes} 
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

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_tax')}
        message={t('are_you_sure_delete_tax')}
      />
    </div>
  );
};

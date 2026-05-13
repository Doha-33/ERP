import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Percent, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { Tax } from '../../types';
import { TaxModal } from '../../components/accounting/TaxModal';
import { toast } from 'sonner';

export const Taxes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { taxes, accountingLoading, addTax, updateTax, deleteTax } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [taxIdToDelete, setTaxIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const isRTL = i18n.language === 'ar';

  const filteredTaxes = useMemo(() => {
    return taxes.filter(tax => {
      const matchesSearch = 
        (tax.taxName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (tax.taxCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter ? tax.taxType === typeFilter : true;
      
      return matchesSearch && matchesType;
    });
  }, [taxes, searchTerm, typeFilter]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalTaxes = taxes.length;
    const activeTaxes = taxes.filter(tax => tax.isActive).length;
    const inactiveTaxes = totalTaxes - activeTaxes;
    const averageRate = taxes.length > 0 
      ? taxes.reduce((sum, tax) => sum + tax.rate, 0) / taxes.length 
      : 0;
    
    const typeDistribution = taxes.reduce((dist, tax) => {
      dist[tax.taxType] = (dist[tax.taxType] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    return { totalTaxes, activeTaxes, inactiveTaxes, averageRate, typeDistribution };
  }, [taxes]);

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
      setSelectedTax(null);
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
    { 
      header: t('tax_name'), 
      accessorKey: 'taxName',
      cell: (item: Tax) => (
        <div className="flex items-center gap-2">
          <Percent size={16} className="text-gray-400" />
          <span className="font-medium text-gray-900">{item.taxName}</span>
        </div>
      )
    },
    { 
      header: t('tax_code'), 
      accessorKey: 'taxCode',
      cell: (item: Tax) => (
        <span className="font-mono text-sm font-semibold text-blue-600">{item.taxCode}</span>
      )
    },
    { 
      header: t('tax_type'), 
      accessorKey: 'taxType',
      cell: (item: Tax) => {
        const typeColors: Record<string, string> = {
          VAT: 'bg-blue-100 text-blue-800',
          WITHHOLDING: 'bg-purple-100 text-purple-800',
          SALES_TAX: 'bg-green-100 text-green-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.taxType] || 'bg-gray-100 text-gray-800'}`}>
            {t(item.taxType.toLowerCase())}
          </span>
        );
      }
    },
    { 
      header: t('rate'), 
      render: (item) => `${item.rate}%`,
      cell: (item: Tax) => (
        <span className="font-semibold text-gray-900">{item.rate}%</span>
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
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setTaxIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors border border-gray-300 rounded-lg"
            title={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const typeOptions = [
    { value: '', label: t('all_types') },
    { value: 'VAT', label: 'VAT' },
    { value: 'WITHHOLDING', label: t('withholding') },
    { value: 'SALES_TAX', label: t('sales_tax') },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('taxes')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_tax_rates_and_settings')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={taxes} filename="taxes" />
          </div>
          <Button 
            onClick={handleOpenAdd}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t('add_tax')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('total_taxes')}</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalTaxes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('active_taxes')}</p>
          <p className="text-2xl font-bold text-green-600">{summary.activeTaxes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('inactive_taxes')}</p>
          <p className="text-2xl font-bold text-red-600">{summary.inactiveTaxes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('average_rate')}</p>
          <p className="text-2xl font-bold text-blue-600">{summary.averageRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* Type Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(summary.typeDistribution).map(([type, count]) => (
          <div key={type} className="bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t(type.toLowerCase())}</span>
              <span className="text-lg font-bold text-gray-900">{count}</span>
            </div>
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(count / summary.totalTaxes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white rounded-lg border border-gray-200">
        <div className="flex-1">
          <Input 
            placeholder={t('search_taxes')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            fullWidth
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table 
            data={filteredTaxes} 
            columns={columns} 
            keyExtractor={(item) => item._id || item.id || ''} 
            isLoading={accountingLoading} 
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredTaxes.length === 0 && !accountingLoading && (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <Percent size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">{t('no_taxes_found')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('click_add_tax_to_create')}</p>
        </div>
      )}

      {/* Modals */}
      <TaxModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTax(null);
        }}
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

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Card, Button, Input, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Company } from '../../types';
import { CompanyModal } from '../../components/organization/CompanyModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const CompanyPage: React.FC = () => {
  const { t } = useTranslation();
  const { companies, addCompany, updateCompany, deleteCompany } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (company: Company) => {
    if (editingCompany) updateCompany(company);
    else addCompany(company);
  };

  const handleEdit = useCallback((company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteCompany(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteCompany]);

  const uniqueCompanyNames = useMemo(() => {
    const names = companies.map(c => c.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedCompanyName === '' || c.name === selectedCompanyName;
      
      return matchesSearch && matchesFilter;
    });
  }, [companies, searchTerm, selectedCompanyName]);

  const columns: Column<Company>[] = useMemo(() => [
    { header: t('company_name'), accessorKey: 'name', className: 'text-gray-700 dark:text-gray-200 font-bold' },
    { header: t('tax_number'), accessorKey: 'taxNumber', className: 'text-gray-500 font-mono' },
    { header: t('email'), accessorKey: 'email', className: 'text-gray-500' },
    { header: t('default_currency'), accessorKey: 'defaultCurrency', className: 'text-gray-500 uppercase font-medium' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (c) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors">
              <Edit2 size={14} />
           </button>
           <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors">
              <Trash2 size={14} />
           </button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('company_page_title')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_company')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="companies_report" />
           <Button onClick={() => { setEditingCompany(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_company')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
           <div className="w-full md:w-80 relative">
              <Input 
                placeholder="Search name, tax ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
                className="bg-gray-50 dark:bg-gray-800/50"
              />
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                 <select 
                    value={selectedCompanyName}
                    onChange={(e) => setSelectedCompanyName(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-10 pr-10 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t('all')} {t('company_name')}</option>
                    {uniqueCompanyNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Filter size={16} />
                 </div>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <ChevronDown size={14} />
                 </div>
              </div>
           </div>
        </div>
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={c => c.id} 
           selectable 
           minWidth="min-w-[1000px]" 
           emptyMessage="No companies found matching your filters"
        />
      </Card>

      <CompanyModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         companyToEdit={editingCompany}
      />

      <ConfirmationModal
         isOpen={!!deleteId}
         onClose={() => setDeleteId(null)}
         onConfirm={confirmDelete}
         title={t('confirm_delete')}
         message={t('are_you_sure_delete')}
      />
    </div>
  );
};

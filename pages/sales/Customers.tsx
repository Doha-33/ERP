
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Filter as FilterIcon, ChevronDown } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Customer } from '../../types';
import { CustomerModal } from '../../components/sales/CustomerModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';

export const Customers: React.FC = () => {
  const { t } = useTranslation();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSave = async (customer: Customer) => {
    if (editingCustomer) {
      await updateCustomer(customer);
    } else {
      await addCustomer(customer);
    }
    setIsModalOpen(false);
  };

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteCustomer(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteCustomer]);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState === '' || c.status === selectedState;
      return matchesSearch && matchesState;
    });
  }, [customers, searchTerm, selectedState]);

  const columns: Column<Customer>[] = useMemo(() => [
    { header: t('code'), accessorKey: 'customerCode', className: 'text-gray-600 dark:text-gray-300' },
    { 
      header: t('customer_info'), 
      render: (c) => (
        <div className="flex items-center gap-3">
           <img src={`https://ui-avatars.com/api/?name=${c.customerName}&background=random`} alt={c.customerName} className="w-8 h-8 rounded-lg object-cover" />
           <span className="font-medium text-gray-900 dark:text-white">{c.customerName}</span>
        </div>
      )
    },
    { header: t('email'), accessorKey: 'email', className: 'text-gray-500' },
    { header: t('phone'), accessorKey: 'phoneNumber', className: 'text-gray-500' },
    { header: t('address'), accessorKey: 'address', className: 'text-gray-500' },
    { header: t('company_name'), accessorKey: 'companyName', className: 'text-gray-500' },
    { 
      header: t('state'), 
      render: (c) => (
        <Badge status={c.status === 'ACTIVE' ? 'Active' : 'Inactive'}>{t(c.status.toLowerCase())}</Badge>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (c) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Edit2 size={16} />
           </button>
           <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
              <Trash2 size={16} />
           </button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('customers')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your Customers</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={customers} filename="customers_list" />
           <Button onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_customer')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] !p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[120px]">
                      <option value="">{t('states')}</option>
                      <option value="Active">{t('active')}</option>
                      <option value="Inactive">{t('inactive')}</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-400">
                Company
              </div>
              <div className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-400">
                Employee name
              </div>
           </div>

           <div className="w-full md:w-64 relative">
             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary" />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
        </div>

        <Table 
          data={filtered}
          columns={columns}
          keyExtractor={(item) => item.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          className="border-none"
        />
      </Card>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} customerToEdit={editingCustomer} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};

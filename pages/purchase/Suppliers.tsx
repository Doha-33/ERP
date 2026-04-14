
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Supplier } from '../../types';
import { SupplierModal } from '../../components/purchase/SupplierModal';

export const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s =>
    s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (supplierToEdit) {
      updateSupplier({ ...supplierToEdit, ...data, id: supplierToEdit._id || supplierToEdit.id });
    } else {
      addSupplier(data);
    }
  };

  const columns = [
    { key: 'supplierCode', header: t('code') },
    { key: 'supplierName', header: t('supplier_name') },
    { key: 'email', header: t('email') },
    { key: 'phoneNumber', header: t('phone') },
    { key: 'address', header: t('address') },
    { 
      key: 'companyId', 
      header: t('company_name'),
      render: (s: Supplier) => typeof s.companyId === 'object' ? s.companyId?.name : s.companyName
    },
    { 
      key: 'branchId', 
      header: t('branch'),
      render: (s: Supplier) => typeof s.branchId === 'object' ? s.branchId?.name : s.branchId
    },
    {
      key: 'status',
      header: t('status'),
      render: (supplier: Supplier) => (
        <Badge status={supplier.status === 'ACTIVE' ? 'Active' : 'Inactive'}>
          {t(supplier.status.toLowerCase())}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (supplier: Supplier) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(supplier)} className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <DollarSign size={16} />
          </button>
          <button onClick={() => deleteSupplier(supplier._id || supplier.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{t('suppliers')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_suppliers')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setSupplierToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_supplier')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Select
              options={[{ value: 'all', label: t('company') }]}
              className="w-40"
            />
            <Select
              options={[{ value: 'all', label: t('supplier_name') }]}
              className="w-40"
            />
            <Select
              options={[{ value: 'all', label: t('state') }]}
              className="w-40"
            />
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredSuppliers} keyExtractor={(s) => s._id || s.id} />
      </Card>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};

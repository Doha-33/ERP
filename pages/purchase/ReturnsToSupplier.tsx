
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { ReturnToSupplier } from '../../types';
import { ReturnToSupplierModal } from '../../components/purchase/ReturnToSupplierModal';

export const ReturnsToSupplier: React.FC = () => {
  const { t } = useTranslation();
  const { returnsToSupplier, addReturnToSupplier, updateReturnToSupplier, deleteReturnToSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnToEdit, setReturnToEdit] = useState<ReturnToSupplier | null>(null);

  const filteredReturns = returnsToSupplier.filter(r =>
    r.rtsNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (ret: ReturnToSupplier) => {
    setReturnToEdit(ret);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (returnToEdit) {
      updateReturnToSupplier({ ...returnToEdit, ...data });
    } else {
      addReturnToSupplier({ 
        ...data, 
        id: '', 
        rtsNumber: '002', 
        date: new Date().toLocaleDateString(),
        receivedQty: 0,
        createdBy: '33'
      });
    }
  };

  const columns = [
    { key: 'rtsNumber', header: t('rts_number') },
    { key: 'supplier', header: t('supplier') },
    { key: 'date', header: t('date') },
    {
      key: 'status',
      header: t('status'),
      render: (ret: ReturnToSupplier) => (
        <Badge status={ret.status === 'Approval' ? 'Active' : ret.status === 'Pending' ? 'Warning' : 'Inactive'}>
          {t(ret.status.toLowerCase())}
        </Badge>
      ),
    },
    { key: 'product', header: t('product') },
    { key: 'reasonForReturn', header: t('reason_for_return') },
    { key: 'receivedQty', header: t('received_qty') },
    { key: 'createdBy', header: t('created_by') },
    { key: 'returnQty', header: t('return_qty') },
    {
      key: 'actions',
      header: t('actions'),
      render: (ret: ReturnToSupplier) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(ret)} className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button onClick={() => deleteReturnToSupplier(ret.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
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
          <h1 className="text-2xl font-bold dark:text-white">{t('return_to_supplier')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_returns')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setReturnToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_return_to_supplier')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Input type="date" className="w-40" />
            <Select
              options={[{ value: 'all', label: t('rts_number') }]}
              className="w-40"
            />
            <Select
              options={[{ value: 'all', label: t('status') }]}
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
        <Table columns={columns} data={filteredReturns} keyExtractor={(r) => r.id} />
      </Card>

      <ReturnToSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        returnToEdit={returnToEdit}
      />
    </div>
  );
};

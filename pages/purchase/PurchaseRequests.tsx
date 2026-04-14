
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { PurchaseRequest } from '../../types';
import { PurchaseRequestModal } from '../../components/purchase/PurchaseRequestModal';

export const PurchaseRequests: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseRequests, addPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<PurchaseRequest | null>(null);

  const filteredRequests = purchaseRequests.filter(r =>
    r.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.items.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (request: PurchaseRequest) => {
    setRequestToEdit(request);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (requestToEdit) {
      updatePurchaseRequest({ ...requestToEdit, ...data, id: requestToEdit._id || requestToEdit.id });
    } else {
      addPurchaseRequest(data);
    }
  };

  const columns = [
    { key: 'prNumber', header: t('pr_number') },
    { key: 'department', header: t('department') },
    { 
      key: 'requestDate', 
      header: t('request_date'),
      render: (r: PurchaseRequest) => new Date(r.requestDate).toLocaleDateString()
    },
    { 
      key: 'items', 
      header: t('items'),
      render: (r: PurchaseRequest) => (
        <div className="text-xs">
          {r.items.map((item, idx) => (
            <div key={idx}>{item.itemName} ({item.requiredQuantity})</div>
          ))}
        </div>
      )
    },
    { 
      key: 'requestedBy', 
      header: t('requested_by'),
      render: (r: PurchaseRequest) => typeof r.requestedBy === 'object' ? r.requestedBy?.fullName : r.requestedBy
    },
    {
      key: 'status',
      header: t('status'),
      render: (request: PurchaseRequest) => (
        <Badge status={request.status === 'APPROVED' ? 'Active' : request.status === 'PENDING' ? 'Warning' : 'Inactive'}>
          {t(request.status.toLowerCase())}
        </Badge>
      ),
    },
    { 
      key: 'totalValue', 
      header: t('total_value'),
      render: (r: PurchaseRequest) => {
        const total = r.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        return total.toLocaleString();
      }
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (request: PurchaseRequest) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(request)} className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button onClick={() => deletePurchaseRequest(request._id || request.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
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
          <h1 className="text-2xl font-bold dark:text-white">{t('purchase_request')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_purchase_request')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setRequestToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_purchase_request')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Input type="date" className="w-40" />
            <Select
              options={[{ value: 'all', label: t('pr_number') }]}
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
        <Table columns={columns} data={filteredRequests} keyExtractor={(r) => r._id || r.id} />
      </Card>

      <PurchaseRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        requestToEdit={requestToEdit}
      />
    </div>
  );
};

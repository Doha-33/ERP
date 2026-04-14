
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { GoodsReceipt } from '../../types';
import { GoodsReceiptModal } from '../../components/purchase/GoodsReceiptModal';

export const GoodsReceipts: React.FC = () => {
  const { t } = useTranslation();
  const { goodsReceipts, addGoodsReceipt, updateGoodsReceipt, deleteGoodsReceipt } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptToEdit, setReceiptToEdit] = useState<GoodsReceipt | null>(null);

  const filteredReceipts = goodsReceipts.filter(r =>
    r.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.items.some(item => (typeof item.productId === 'object' ? item.productId?.productName : '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (receipt: GoodsReceipt) => {
    setReceiptToEdit(receipt);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (receiptToEdit) {
      updateGoodsReceipt({ ...receiptToEdit, ...data, id: receiptToEdit._id || receiptToEdit.id });
    } else {
      addGoodsReceipt(data);
    }
  };

  const columns = [
    { key: 'grNumber', header: t('gr_number') },
    { 
      key: 'items', 
      header: t('items'),
      render: (r: GoodsReceipt) => (
        <div className="text-xs">
          {r.items.map((item, idx) => (
            <div key={idx}>{typeof item.productId === 'object' ? item.productId?.productName : 'Product'} ({item.receivedQuantity})</div>
          ))}
        </div>
      )
    },
    { 
      key: 'receiptDate', 
      header: t('receipt_date'),
      render: (r: GoodsReceipt) => new Date(r.receiptDate).toLocaleDateString()
    },
    { 
      key: 'warehouseId', 
      header: t('warehouse'),
      render: (r: GoodsReceipt) => typeof r.warehouseId === 'object' ? r.warehouseId?.warehouseName : r.warehouseId
    },
    { key: 'totalQty', header: t('total_qty') },
    { key: 'receivedBy', header: t('received_by') },
    { 
      key: 'totalValue', 
      header: t('total_value'),
      render: (r: GoodsReceipt) => r.totalValue.toLocaleString()
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (receipt: GoodsReceipt) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(receipt)} className="p-1 text-gray-400 hover:text-primary border border-gray-200 rounded">
            <Edit2 size={16} />
          </button>
          <button onClick={() => deleteGoodsReceipt(receipt._id || receipt.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
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
          <h1 className="text-2xl font-bold dark:text-white">{t('goods_receipts')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_your_goods_receipts')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => { setReceiptToEdit(null); setIsModalOpen(true); }} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_goods_receipt')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Input type="date" className="w-40" />
            <Select
              options={[{ value: 'all', label: t('gr_number') }]}
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
        <Table columns={columns} data={filteredReceipts} keyExtractor={(r) => r._id || r.id} />
      </Card>

      <GoodsReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        receiptToEdit={receiptToEdit}
      />
    </div>
  );
};

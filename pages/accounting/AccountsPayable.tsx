import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Payable {
  id: string;
  vendorName: string;
  date: string;
  dueDate: string;
  invoiceNumber: string;
  invoiceItems: string;
  unitPrice: number;
  discount: number;
  vat: number;
  amount: number;
  paid: number;
  remainingBalance: number;
  reference: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
}

export const AccountsPayable: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Payable | null>(null);

  const [items] = useState<Payable[]>([
    {
      id: '1',
      vendorName: 'IN849',
      date: '3/12/2033',
      dueDate: '3/12/2033',
      invoiceNumber: 'a2234',
      invoiceItems: 'a2234',
      unitPrice: 123,
      discount: 123,
      vat: 123,
      amount: 123,
      paid: 123,
      remainingBalance: 123,
      reference: 'PDF',
      status: 'Paid',
    },
    {
      id: '2',
      vendorName: 'IN849',
      date: '3/12/2033',
      dueDate: '3/12/2033',
      invoiceNumber: 'a2234',
      invoiceItems: 'a2234',
      unitPrice: 123,
      discount: 123,
      vat: 123,
      amount: 123,
      paid: 123,
      remainingBalance: 123,
      reference: 'PDF',
      status: 'Unpaid',
    },
    {
      id: '3',
      vendorName: 'IN849',
      date: '3/12/2033',
      dueDate: '3/12/2033',
      invoiceNumber: 'a2234',
      invoiceItems: 'a2234',
      unitPrice: 123,
      discount: 123,
      vat: 123,
      amount: 123,
      paid: 123,
      remainingBalance: 123,
      reference: 'PDF',
      status: 'Partial',
    },
  ]);

  const columns: Column<Payable>[] = [
    { header: t('vendor_name'), accessorKey: 'vendorName' },
    { header: t('date'), accessorKey: 'date' },
    { header: t('due_date'), accessorKey: 'dueDate' },
    { header: t('invoice_number'), accessorKey: 'invoiceNumber' },
    { header: t('invoice_items'), accessorKey: 'invoiceItems' },
    { header: t('unit_price'), accessorKey: 'unitPrice' },
    { header: t('discount'), accessorKey: 'discount' },
    { header: t('vat'), accessorKey: 'vat' },
    { header: t('amount'), accessorKey: 'amount' },
    { header: t('paid'), accessorKey: 'paid' },
    { header: t('remaining_balance'), accessorKey: 'remainingBalance' },
    { header: t('reference'), accessorKey: 'reference' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item) => (
        <Badge variant={item.status === 'Paid' ? 'success' : item.status === 'Unpaid' ? 'danger' : 'warning'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('accounts_payable')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_accounts_payable')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={items} filename="accounts_payable" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_accounts_payable')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex justify-end gap-3 mb-4">
          <Input type="date" className="w-48" defaultValue="2025-02-10" />
          <Select 
            options={[{ value: '', label: t('vendor_name') }]} 
            className="w-48"
          />
        </div>
        <Table data={items} columns={columns} keyExtractor={(item) => item.id} selectable />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_accounts_payable')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select label={t('vendor_name')} options={[{ value: 'AAAA', label: 'AAAA' }]} required />
          <Input label={t('invoice_number')} placeholder="aaaaa" required />
          <Input label={t('date')} type="date" defaultValue="2025-02-10" required />
          <Input label={t('due_date')} type="date" defaultValue="2025-02-10" required />
          <Input label={t('invoice_items')} placeholder="3333322" required />
          <Input label={t('amount')} placeholder="123" required />
          <Input label={t('paid')} placeholder="23456" required />
          <Input label={t('remaining_balance')} placeholder="34567" required />
          <Input label={t('unit_price')} placeholder="ف3345" required />
          <Input label={t('discount')} placeholder="345432" required />
          <Input label={t('vat')} placeholder="branch 1" required />
          <Select label={t('status')} options={[{ value: 'Paid', label: t('paid') }]} required />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('upload_reference')}
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsAddModalOpen(false)}>{t('add_accounts_payable')}</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_accounts_payable')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select label={t('vendor_name')} options={[{ value: 'AAAA', label: 'AAAA' }]} defaultValue="AAAA" required />
          <Input label={t('invoice_number')} defaultValue={selectedItem?.invoiceNumber} required />
          <Input label={t('date')} type="date" defaultValue="2025-02-10" required />
          <Input label={t('due_date')} type="date" defaultValue="2025-02-10" required />
          <Input label={t('invoice_items')} defaultValue={selectedItem?.invoiceItems} required />
          <Input label={t('amount')} defaultValue={selectedItem?.amount} required />
          <Input label={t('paid')} defaultValue={selectedItem?.paid} required />
          <Input label={t('remaining_balance')} defaultValue={selectedItem?.remainingBalance} required />
          <Input label={t('unit_price')} defaultValue={selectedItem?.unitPrice} required />
          <Input label={t('discount')} defaultValue={selectedItem?.discount} required />
          <Input label={t('vat')} defaultValue={selectedItem?.vat} required />
          <Select label={t('status')} options={[{ value: 'Paid', label: t('paid') }]} defaultValue={selectedItem?.status} required />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('upload_reference')}
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsEditModalOpen(false)}>{t('save')}</Button>
        </div>
      </Modal>
    </div>
  );
};

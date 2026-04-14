import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Card, Button, Input, Select, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface JournalEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  createdBy: string;
}

export const JournalEntries: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const [entries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '3/12/2033',
      account: 'a2234',
      description: 'aaaaa',
      debit: 123,
      credit: 123,
      reference: 'PDF',
      createdBy: 'AHMRD',
    },
    {
      id: '2',
      date: '3/12/2033',
      account: 'a2234',
      description: 'aaaaa',
      debit: 123,
      credit: 123,
      reference: 'PDF',
      createdBy: 'AHMRD',
    },
    {
      id: '3',
      date: '3/12/2033',
      account: 'a2234',
      description: 'aaaaa',
      debit: 123,
      credit: 123,
      reference: 'PDF',
      createdBy: 'AHMRD',
    },
  ]);

  const columns: Column<JournalEntry>[] = [
    { header: t('date'), accessorKey: 'date' },
    { header: t('account'), accessorKey: 'account' },
    { header: t('description'), accessorKey: 'description' },
    { header: t('debit'), accessorKey: 'debit' },
    { header: t('credit'), accessorKey: 'credit' },
    { header: t('reference'), accessorKey: 'reference' },
    { header: t('created_by'), accessorKey: 'createdBy' },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedEntry(item); setIsEditModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('journal_entries')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_journal_entries')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={entries} filename="journal_entries" />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> {t('add_journal_entries')}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative">
          <Input 
            type="text" 
            placeholder="2025 / 02 / 10" 
            className="pl-10 w-48 bg-white dark:bg-gray-800"
            readOnly
          />
          <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <Card>
        <Table data={entries} columns={columns} keyExtractor={(item) => item.id} selectable />
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_journal_entries')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('created_by')} placeholder="branch 1" required />
          <Select 
            label={t('account')} 
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('debit')} type="number" placeholder="3333322" required />
          <Input label={t('credit')} type="number" placeholder="123" required />
          <div className="col-span-2">
            <TextArea label={t('description')} placeholder="" required rows={4} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('upload_reference')} <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('cancel')}</Button>
          <Button onClick={() => setIsAddModalOpen(false)}>{t('save')}</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_journal_entries')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('created_by')} defaultValue="branch 1" required />
          <Select 
            label={t('account')} 
            defaultValue="aaa"
            options={[
              { value: 'aaa', label: 'aaa' },
            ]} 
            required 
          />
          <Input label={t('debit')} type="number" defaultValue="3333322" required />
          <Input label={t('credit')} type="number" defaultValue="123" required />
          <div className="col-span-2">
            <TextArea label={t('description')} defaultValue={selectedEntry?.description} required rows={4} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('upload_reference')} <span className="text-red-500">*</span>
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

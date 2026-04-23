import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { JournalEntry } from '../../types';
import { JournalEntryModal } from '../../components/accounting/JournalEntryModal';
import { toast } from 'sonner';

export const JournalEntries: React.FC = () => {
  const { t } = useTranslation();
  const { journalEntries, accounts, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = journalEntries.filter(entry => 
    (entry.referenceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.memo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSave = async (data: any) => {
    try {
      if (selectedEntry) {
        await updateJournalEntry(selectedEntry._id || selectedEntry.id, data);
        toast.success(t('journal_entry_updated_successfully'));
      } else {
        await addJournalEntry(data);
        toast.success(t('journal_entry_added_successfully'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      toast.error(t('failed_to_save_journal_entry'));
    }
  };

  const handleDelete = async () => {
    if (!entryIdToDelete) return;
    try {
      await deleteJournalEntry(entryIdToDelete);
      setIsDeleteModalOpen(false);
      setEntryIdToDelete(null);
      toast.success(t('journal_entry_deleted_successfully'));
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      toast.error(t('failed_to_delete_journal_entry'));
    }
  };

  const columns: Column<JournalEntry>[] = [
    { 
      header: t('date'), 
      render: (item) => item.entryDate ? new Date(item.entryDate).toLocaleDateString() : '-'
    },
    { header: t('reference_number'), accessorKey: 'referenceNumber' },
    { header: t('memo'), accessorKey: 'memo' },
    { 
      header: t('total_amount'), 
      render: (item) => {
        const total = item.lines.reduce((sum, line) => sum + line.debit, 0);
        return total.toLocaleString();
      }
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.status === 'POSTED' ? 'success' : item.status === 'DRAFT' ? 'warning' : 'danger'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedEntry(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setEntryIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('journal_entries')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_journal_entries')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={journalEntries} filename="journal_entries" />
          <Button onClick={() => { setSelectedEntry(null); setIsModalOpen(true); }}>
            <Plus size={20} /> {t('add_journal_entry')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <Input 
            placeholder={t('search_entries')} 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Table data={filteredEntries} columns={columns} keyExtractor={(item) => item._id || item.id} selectable />
      </Card>

      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        entryToEdit={selectedEntry}
        accounts={accounts}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_journal_entry')}
        message={t('are_you_sure_delete_journal_entry')}
      />
    </div>
  );
};

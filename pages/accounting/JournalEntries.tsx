import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { JournalEntry } from '../../types';
import { JournalEntryModal } from '../../components/accounting/JournalEntryModal';

export const JournalEntries: React.FC = () => {
  const { t } = useTranslation();
  const { journalEntries, accounts, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleSave = async (data: any) => {
    try {
      if (selectedEntry) {
        await updateJournalEntry(selectedEntry._id || selectedEntry.id, data);
      } else {
        await addJournalEntry(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('are_you_sure_delete_journal_entry'))) {
      try {
        await deleteJournalEntry(id);
      } catch (error) {
        console.error('Failed to delete journal entry:', error);
      }
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
            onClick={() => handleDelete(item._id || item.id)}
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
        <Table data={journalEntries} columns={columns} keyExtractor={(item) => item._id || item.id} selectable />
      </Card>

      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        entryToEdit={selectedEntry}
        accounts={accounts}
      />
    </div>
  );
};

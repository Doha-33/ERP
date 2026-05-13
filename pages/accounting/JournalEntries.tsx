import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { Button, Badge, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { JournalEntry } from '../../types';
import { Modal } from '@/components/ui/Modal';
import { JournalEntryModal } from '../../components/accounting/JournalEntryModal';
import { toast } from 'sonner';

export const JournalEntries: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { journalEntries, accounts, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isRTL = i18n.language === 'ar';

  // Helper function to get account name from accountId (could be string or object)
  const getAccountDisplay = (accountId: any): string => {
    if (!accountId) return '-';
    
    // If accountId is an object with account data
    if (typeof accountId === 'object' && accountId !== null) {
      return `${accountId.accountCode || ''} - ${accountId.accountName || ''}`.replace(/^- /, '');
    }
    
    // If it's a string ID, find from accounts list
    const account = accounts.find(a => a._id === accountId || a.id === accountId);
    return account ? `${account.accountCode} - ${account.accountName}` : accountId;
  };

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => 
      (entry.referenceNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (entry.memo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (entry.entryDate && new Date(entry.entryDate).toLocaleDateString().includes(searchTerm))
    );
  }, [journalEntries, searchTerm]);

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
      setSelectedEntry(null);
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

  // Calculate totals for an entry
  const getEntryTotal = (entry: JournalEntry) => {
    const total = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const columns: Column<JournalEntry>[] = [
    { 
      header: t('date'), 
      render: (item) => item.entryDate ? new Date(item.entryDate).toLocaleDateString() : '-',
      cell: (item: JournalEntry) => (
        <span className="whitespace-nowrap">{item.entryDate ? new Date(item.entryDate).toLocaleDateString() : '-'}</span>
      )
    },
    { 
      header: t('reference_number'), 
      accessorKey: 'referenceNumber',
      cell: (item: JournalEntry) => (
        <span className="font-mono text-sm font-medium">{item.referenceNumber}</span>
      )
    },
    { 
      header: t('memo'), 
      accessorKey: 'memo',
      cell: (item: JournalEntry) => (
        <div className="max-w-xs truncate" title={item.memo}>
          {item.memo}
        </div>
      )
    },
    { 
      header: t('total_amount'), 
      render: (item) => getEntryTotal(item),
      cell: (item: JournalEntry) => (
        <span className="font-semibold">{getEntryTotal(item)}</span>
      )
    },
    { 
      header: t('status'), 
      render: (item) => {
        const statusColors: Record<string, string> = {
          POSTED: 'success',
          DRAFT: 'warning',
          CANCELLED: 'danger'
        };
        return (
          <Badge status={statusColors[item.status] || 'info'}>
            {t(item.status.toLowerCase())}
          </Badge>
        );
      }
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedEntry(item); setIsViewModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
            title={t('view_details')}
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => { setSelectedEntry(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => { setEntryIdToDelete(item._id || item.id); setIsDeleteModalOpen(true); }}
            className="p-1.5 text-gray-500 hover:text-red-600 transition-colors border border-gray-300 rounded-lg"
            title={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('journal_entries')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_your_journal_entries')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={journalEntries} filename="journal_entries" />
          </div>
          <Button 
            onClick={() => { setSelectedEntry(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t('add_journal_entry')}
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white rounded-lg border border-gray-200">
        <Input 
          placeholder={t('search_entries')} 
          icon={<Search size={18} />} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
          fullWidth
        />
        <div className="text-sm text-gray-500">
          {t('total_entries')}: {filteredEntries.length}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table 
            data={filteredEntries} 
            columns={columns} 
            keyExtractor={(item) => item._id || item.id || ''} 
            selectable 
          />
        </div>
      </div>

      {/* Modals */}
      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEntry(null);
        }}
        onSave={handleSave}
        entryToEdit={selectedEntry}
        accounts={accounts}
      />

      {/* View Details Modal */}
      {selectedEntry && (
        <JournalEntryViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
          accounts={accounts}
        />
      )}

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

// View Modal Component for showing entry details
const JournalEntryViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry;
  accounts: any[];
}> = ({ isOpen, onClose, entry, accounts }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const getAccountDisplay = (accountId: any): string => {
    if (!accountId) return '-';
    if (typeof accountId === 'object' && accountId !== null) {
      return `${accountId.accountCode || ''} - ${accountId.accountName || ''}`.replace(/^- /, '');
    }
    const account = accounts.find(a => a._id === accountId || a.id === accountId);
    return account ? `${account.accountCode} - ${account.accountName}` : accountId;
  };

  const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('journal_entry_details')}
      className="w-full max-w-4xl mx-4 sm:mx-auto"
    >
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Entry Header Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-xs text-gray-500 uppercase">{t('reference_number')}</label>
            <p className="font-mono font-semibold text-gray-900">{entry.referenceNumber}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">{t('date')}</label>
            <p className="font-medium text-gray-900">{new Date(entry.entryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">{t('status')}</label>
            <Badge status={entry.status === 'POSTED' ? 'success' : entry.status === 'DRAFT' ? 'warning' : 'danger'}>
              {t(entry.status.toLowerCase())}
            </Badge>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">{t('created_at')}</label>
            <p className="text-sm text-gray-600">{new Date(entry.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Memo */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="text-xs text-gray-500 uppercase">{t('memo')}</label>
          <p className="text-gray-800 mt-1">{entry.memo}</p>
        </div>

        {/* Entry Lines Table */}
        <div>
          <h3 className="text-lg font-medium mb-3">{t('entry_lines')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-3 px-4 rounded-tl-lg">{t('account')}</th>
                  <th className="text-left py-3 px-4">{t('description')}</th>
                  <th className="text-right py-3 px-4">{t('debit')}</th>
                  <th className="text-right py-3 px-4 rounded-tr-lg">{t('credit')}</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((line, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {getAccountDisplay(line.accountId)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {line.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      {line.debit > 0 ? line.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      {line.credit > 0 ? line.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right">{t('total')}:</td>
                  <td className="py-3 px-4 text-right text-green-700">
                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-red-700">
                    {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
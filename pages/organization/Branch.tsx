
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Branch } from '../../types';
import { BranchModal } from '../../components/organization/BranchModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const BranchPage: React.FC = () => {
  const { t } = useTranslation();
  const { branches, companies, addBranch, updateBranch, deleteBranch } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (branch: Branch) => {
    if (editingBranch) updateBranch(branch);
    else addBranch(branch);
  };

  const handleEdit = useCallback((branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteBranch(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteBranch]);

  const filtered = useMemo(() => branches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [branches, searchTerm]);

  const columns: Column<Branch>[] = useMemo(() => [
    { 
        header: t('company_name'), 
        render: (b) => companies.find(c => c.id === b.companyId)?.name || b.companyId,
        className: 'text-gray-500' 
    },
    { header: t('branch_name'), accessorKey: 'name', className: 'text-gray-500' },
    { header: t('email'), accessorKey: 'email', className: 'text-gray-500' },
    { header: t('address'), accessorKey: 'address', className: 'text-gray-500' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (b) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(b)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, companies]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('branch_page_title')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_branch')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="branches_report" />
           <Button onClick={() => { setEditingBranch(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_branch')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-end gap-4 mb-4">
           <div className="w-48">
              <div className="relative">
                 <select 
                    className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                 >
                    <option value="">Branch Name</option>
                    {/* Unique branch names for filter */}
                    {Array.from(new Set(branches.map(b => b.name))).map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                    <ChevronDown size={14} />
                 </div>
              </div>
           </div>
        </div>
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={b => b.id} 
           selectable 
           minWidth="min-w-[1000px]" 
        />
      </Card>

      <BranchModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         branchToEdit={editingBranch}
      />

      <ConfirmationModal
         isOpen={!!deleteId}
         onClose={() => setDeleteId(null)}
         onConfirm={confirmDelete}
         title={t('confirm_delete')}
         message={t('are_you_sure_delete')}
      />
    </div>
  );
};

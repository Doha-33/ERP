
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar, Search, X } from 'lucide-react';
import { Card, Button, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Reward } from '../../types';
import { RewardModal } from '../../components/hr/RewardModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Rewards: React.FC = () => {
  const { t } = useTranslation();
  const { rewards, addReward, updateReward, deleteReward } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (reward: Reward) => {
    if (editingReward) updateReward(reward);
    else addReward(reward);
  };

  const handleEdit = useCallback((reward: Reward) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteReward(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteReward]);

  const filtered = useMemo(() => {
    return rewards.filter(r => {
      const matchesSearch = (r.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (r.rewardId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || r.date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [rewards, searchTerm, filterDate]);

  const columns: Column<Reward>[] = useMemo(() => [
    { 
      header: t('employee_info'), 
      render: (r) => (
         <div className="flex items-center gap-2">
            <img src={r.avatar} alt="Avatar" className="w-8 h-8 rounded-md object-cover" />
            <span className="font-medium text-gray-900 dark:text-white">{r.employeeName}</span>
         </div>
      )
    },
    { header: t('rewards_id'), accessorKey: 'rewardId', className: 'text-gray-500 font-mono text-xs' },
    { header: t('rewards_types'), accessorKey: 'rewardType', className: 'text-gray-500 font-medium' },
    { header: t('bouns'), accessorKey: 'bonus', className: 'text-green-500' },
    { header: t('commissions'), accessorKey: 'commission', className: 'text-blue-500' },
    { header: t('reward_date'), accessorKey: 'date', className: 'text-gray-500 font-mono text-xs' },
    { header: t('reward_amount'), accessorKey: 'amount', className: 'text-primary font-bold' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('rewards')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_rewards')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="rewards_report" />
           <Button onClick={() => { setEditingReward(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
              <Plus size={18} /> {t('add_rewards')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl">
           <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48">
                <input 
                  type="date"
                  value={filterDate}
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch(err){} }}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="w-full md:w-64 relative">
                <input 
                  className="w-full bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-10 pr-4 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Search rewards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
           </div>

           {(searchTerm || filterDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterDate(''); }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors flex items-center gap-1 text-sm font-bold"
              >
                <X size={16} /> Reset
              </button>
           )}
        </div>
        
        <Table data={filtered} columns={columns} keyExtractor={r => r.id} selectable minWidth="min-w-[1500px]" />
      </Card>

      <RewardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} rewardToEdit={editingReward} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};


import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import { Card, Button, Input, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { InitialTraining } from '../../types';
import { InitialTrainingModal } from '../../components/hr/InitialTrainingModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const InitialTrainingPage: React.FC = () => {
  const { t } = useTranslation();
  const { initialTrainings, addInitialTraining, updateInitialTraining, deleteInitialTraining } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<InitialTraining | null>(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (training: InitialTraining) => {
    if (editingTraining) updateInitialTraining(training);
    else addInitialTraining(training);
  };

  const handleEdit = useCallback((training: InitialTraining) => {
    setEditingTraining(training);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteInitialTraining(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteInitialTraining]);

  // Extract unique employee names for the dropdown
  const uniqueEmployeeNames = useMemo(() => {
    const names = initialTrainings.map(t => t.empName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [initialTrainings]);

  // Combined filtration logic
  const filtered = useMemo(() => {
    return initialTrainings.filter(item => {
      const matchesSearch = (item.empName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.empCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.trainingType || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSelect = selectedEmployee === '' || item.empName === selectedEmployee;
      return matchesSearch && matchesSelect;
    });
  }, [initialTrainings, searchTerm, selectedEmployee]);

  const columns: Column<InitialTraining>[] = useMemo(() => [
    { header: t('emp_code'), accessorKey: 'empCode', className: 'text-gray-500 font-mono text-xs' },
    { 
      header: t('emp_name'), 
      render: (item) => (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {(item.empName || 'U')[0]}
           </div>
           <span className="font-bold text-gray-900 dark:text-white">{item.empName}</span>
        </div>
      )
    },
    { header: t('training_type'), accessorKey: 'trainingType', className: 'text-gray-500 font-medium' },
    { header: t('trainer'), accessorKey: 'trainer', className: 'text-gray-500' },
    { header: t('department'), accessorKey: 'department', className: 'text-gray-500' },
    { header: t('done_by'), accessorKey: 'doneBy', className: 'text-gray-500' },
    { header: t('done_at'), accessorKey: 'doneAt', className: 'text-gray-500 font-mono text-xs' },
    { 
      header: t('status'), 
      render: (item) => (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
            item.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30' : 
            item.status === 'Unpaid' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' :
            'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/30'
        }`}>
            {item.status}
        </span>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-1 uppercase tracking-wider">
              <span>Onboarding</span>
              <ChevronDown size={14} className="-rotate-90" />
              <span className="text-primary">{t('initial_training')}</span>
           </div>
           <h1 className="text-2xl font-bold dark:text-white">{t('manage_initial_training')}</h1>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="initial_training_report" />
           <Button onClick={() => { setEditingTraining(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
              <Plus size={18} /> {t('add_initial_training')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
           <div className="w-full md:w-80 relative">
              <Input 
                placeholder="Search by name, code or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
                className="bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700"
              />
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <select 
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-10 pr-10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                 >
                    <option value="">{t('all')} {t('employees')}</option>
                    {uniqueEmployeeNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Filter size={16} />
                 </div>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <ChevronDown size={14} />
                 </div>
              </div>
              
              {(searchTerm || selectedEmployee) && (
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedEmployee(''); }}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors"
                  title="Reset filters"
                >
                  <X size={18} />
                </button>
              )}
           </div>
        </div>
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={t => t.id} 
           selectable 
           minWidth="min-w-[1200px]" 
           emptyMessage="No training records found matching your selection"
        />
      </Card>

      <InitialTrainingModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         trainingToEdit={editingTraining}
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

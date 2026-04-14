
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Search, X } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { DeductionRecord } from '../../types';
import { DeductionModal } from '../../components/hr/DeductionModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';

export const Deductions: React.FC = () => {
  const { t } = useTranslation();
  const { 
    deductionRecords, addDeductionRecord, updateDeductionRecord, deleteDeductionRecord,
    employees
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeductionRecord | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (record: DeductionRecord) => {
    if (editingRecord) updateDeductionRecord(record);
    else addDeductionRecord(record);
  };

  const handleEdit = useCallback((r: DeductionRecord) => {
    setEditingRecord(r);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteDeductionRecord(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteDeductionRecord]);

  const uniqueEmployeeNames = useMemo(() => {
    const names = employees.map(e => e.fullName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return deductionRecords.filter(r => {
      return !selectedEmployee || r.employeeName === selectedEmployee;
    });
  }, [deductionRecords, selectedEmployee]);

  const columns: Column<DeductionRecord>[] = useMemo(() => [
    { 
      header: t('employee_info'), 
      render: (r) => (
         <div className="flex items-center gap-2">
            <img src={r.avatar || `https://ui-avatars.com/api/?name=${r.employeeName}&background=4361EE&color=fff`} alt="Avatar" className="w-8 h-8 rounded-md object-cover bg-gray-100" />
            <span className="font-medium text-gray-900 dark:text-white">{r.employeeName}</span>
         </div>
      )
    },
    { header: t('company'), accessorKey: 'company', className: 'text-gray-500' },
    { header: t('branch'), accessorKey: 'branch', className: 'text-gray-500' },
    { 
      header: t('date'), 
      render: (r) => <span className="text-gray-500">{r.month || '01'}/{r.year || '2025'}</span> 
    },
    { header: t('absence'), accessorKey: 'absence', className: 'text-gray-500 font-bold' },
    { header: t('late_arrival'), accessorKey: 'lateArrival', className: 'text-gray-500 font-bold' },
    { header: t('early_leave'), accessorKey: 'earlyLeave', className: 'text-gray-500 font-bold' },
    { header: t('loan'), accessorKey: 'loan', className: 'text-gray-500 font-bold' },
    { header: t('penalties_deduction'), accessorKey: 'penalties', className: 'text-gray-500 font-bold' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-primary rounded border border-gray-200 dark:border-gray-700 transition-colors"><Edit2 size={16} /></button>
           <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('deductions')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_deductions')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="deductions_report" />
           <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} /> {t('add_deductions')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-none">
        {/* Filter Bar */}
        <div className="flex justify-end mb-6">
           <div className="relative">
              <select 
                 value={selectedEmployee} 
                 onChange={(e) => setSelectedEmployee(e.target.value)}
                 className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[200px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              >
                 <option value="">Employee</option>
                 {uniqueEmployeeNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           </div>
        </div>
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={r => r.id} 
           selectable 
           minWidth="min-w-[1400px]" 
           emptyMessage="No deductions found"
        />
      </Card>

      <DeductionModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         recordToEdit={editingRecord}
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


import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar, FileText, Search, X } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Leave } from '../../types';
import { LeaveModal } from '../../components/hr/LeaveModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Leaves: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { leaves, employees, addLeave, updateLeave, deleteLeave, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Leave | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (record: Leave) => {
    if (editingRecord) await updateLeave(record);
    else await addLeave(record);
  };

  const handleEdit = useCallback((record: Leave) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteLeave(deleteId);
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
    }
  }, [deleteId, deleteLeave]);

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteLeave(id)));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const accessibleLeaves = useMemo(() => {
    if (isAdmin) return leaves;
    return leaves.filter(l => {
      const empId = typeof l.employeeId === 'object' ? l.employeeId?._id : l.employeeId;
      return empId === currentUserEmployee?._id || empId === currentUserEmployee?.id;
    });
  }, [isAdmin, leaves, currentUserEmployee]);

  const uniqueEmployeeNames = useMemo(() => {
    const names = leaves.map(l => typeof l.employeeId === 'object' ? l.employeeId?.fullName : '').filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [leaves]);

  const filtered = useMemo(() => {
    return accessibleLeaves.filter(r => {
      const empName = typeof r.employeeId === 'object' ? r.employeeId?.fullName : '';
      const matchesEmployee = !selectedEmployee || empName === selectedEmployee;
      const matchesState = !selectedState || r.status === selectedState;
      return matchesEmployee && matchesState;
    });
  }, [accessibleLeaves, selectedEmployee, selectedState]);

  const columns: Column<any>[] = useMemo(() => [
    { header: t('leaves_id'), render: (r) => <span className="text-xs font-mono text-gray-400">{r.leaveId || r._id?.substring(0, 8) || 'N/A'}</span> },
    { 
      header: t('employee_info'), 
      render: (r) => {
        const emp = typeof r.employeeId === 'object' ? r.employeeId : null;
        const name = emp?.fullName || 'N/A';
        const avatar = emp?.photo || `https://ui-avatars.com/api/?name=${name}&background=4361EE&color=fff`;
        return (
          <div className="flex items-center gap-2">
             <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
             <span className="font-medium text-gray-900 dark:text-white">{name}</span>
          </div>
        );
      }
    },
    { header: t('leave_types'), accessorKey: 'leaveType', className: 'text-gray-500' },
    { header: t('from_date'), render: (r) => <span>{r.fromDate?.split('T')[0]}</span>, className: 'text-gray-500' },
    { header: t('to_date'), render: (r) => <span>{r.toDate?.split('T')[0]}</span>, className: 'text-gray-500' },
    { header: t('days'), accessorKey: 'days', className: 'text-gray-500 text-center' },
    { 
      header: t('status'), 
      render: (r) => (
        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${
            r.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
            r.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
            'bg-orange-50 text-orange-700 border-orange-100'
        }`}>
            {r.status}
        </span>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-primary rounded transition-colors"><Edit2 size={16} /></button>
           <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('leaves')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">
             {isAdmin ? t('manage_leaves') : 'Your personal leaves'}
           </p>
        </div>
        <div className="flex gap-3">
           {isAdmin && selectedIds.length > 0 && (
              <Button variant="danger" onClick={() => setIsBulkConfirmOpen(true)}>
                <Trash2 size={18} /> {t('delete')} ({selectedIds.length})
              </Button>
           )}
           <ExportDropdown data={filtered} filename="leaves_report" />
           <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} /> {t('add_leaves')}
           </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4">
              {isAdmin && (
                <div className="relative">
                   <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[160px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                      <option value="">{t('employees')}</option>
                      {uniqueEmployeeNames.map(name => <option key={name} value={name}>{name}</option>)}
                   </select>
                   <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              <div className="relative">
                 <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[140px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="">{t('status')}</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {(selectedEmployee || selectedState || selectedIds.length > 0) && (
                <button 
                  onClick={() => { setSelectedEmployee(''); setSelectedState(''); setSelectedIds([]); }}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              )}
          </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-none">
        <Table 
          data={filtered} 
          columns={columns} 
          keyExtractor={r => r.id} 
          selectable={isAdmin} 
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          minWidth="min-w-[1400px]" 
        />
      </Card>

      <LeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} recordToEdit={editingRecord} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
      <ConfirmationModal 
        isOpen={isBulkConfirmOpen} 
        onClose={() => setIsBulkConfirmOpen(false)} 
        onConfirm={handleBulkDelete} 
        title={t('confirm_delete')}
        message={`${t('are_you_sure_delete')} (${selectedIds.length}) records?`}
      />
    </div>
  );
};

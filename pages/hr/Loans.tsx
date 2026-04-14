
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar, FileText, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Loan } from '../../types';
import { LoanModal } from '../../components/hr/LoanModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const LoansPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { loans, addLoan, updateLoan, deleteLoan, toggleLoanWorkflow, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = (loan: Loan) => {
    if (editingLoan) updateLoan(loan);
    else addLoan(loan);
  };

  const handleEdit = useCallback((loan: Loan) => {
    setEditingLoan(loan);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteLoan(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteLoan]);

  // Logic: Filter by employee identity if not admin
  const accessibleLoans = useMemo(() => {
    if (isAdmin) return loans;
    return loans.filter(l => l.employeeId === currentUserEmployee?.id);
  }, [isAdmin, loans, currentUserEmployee]);

  const filtered = useMemo(() => {
    return accessibleLoans.filter(l => 
      (l.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.loanId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accessibleLoans, searchTerm]);

  const columns: Column<Loan>[] = useMemo(() => [
    { 
      header: t('loan_id'), 
      render: (l) => <span className="text-gray-400 font-mono text-xs">{l.id?.substring(0, 8) || 'N/A'}</span> 
    },
    { header: t('date'), accessorKey: 'createdAt', className: 'text-gray-500' },
    { 
      header: t('employee_info'), 
      render: (l) => (
         <div className="flex items-center gap-3">
            <img src={l.avatar} alt="Avatar" className="w-9 h-9 rounded-xl object-cover bg-slate-100" />
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white leading-tight">{l.employeeName}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{l.empCode || '-'}</span>
            </div>
         </div>
      )
    },
    { header: t('loan_amount'), accessorKey: 'loanAmount', className: 'text-primary font-black' },
    { header: t('remaining_amount'), accessorKey: 'remainingAmount', className: 'text-gray-500 font-medium' },
    { header: t('deduction_type'), accessorKey: 'deductionType', className: 'text-gray-400 text-[10px] font-black uppercase' },
    { header: t('installment_amount'), accessorKey: 'installmentAmount', className: 'text-gray-500 text-center font-bold' },
    { header: t('start_month'), accessorKey: 'startMonth', className: 'text-gray-500' },
    { 
      header: t('approval_by'), 
      render: (l) => (
         <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center gap-2">
               <div 
                 onClick={() => isAdmin && toggleLoanWorkflow(l.id, 'hr')}
                 className={`w-3 h-3 rounded-full transition-all border-2 ${isAdmin ? 'cursor-pointer' : ''} ${l.workflowStatus.hr ? 'bg-green-500 border-green-500' : 'bg-transparent border-gray-300'}`}
                 title="HR Approval"
               />
               <span className={`text-[10px] font-bold ${l.workflowStatus.hr ? 'text-green-600' : 'text-gray-400'}`}>HR</span>
            </div>
            <div className="flex items-center gap-2">
               <div 
                 onClick={() => isAdmin && toggleLoanWorkflow(l.id, 'manager')}
                 className={`w-3 h-3 rounded-full transition-all border-2 ${isAdmin ? 'cursor-pointer' : ''} ${l.workflowStatus.manager ? 'bg-orange-500 border-orange-500' : 'bg-transparent border-gray-300'}`}
                 title="Manager Approval"
               />
               <span className={`text-[10px] font-bold ${l.workflowStatus.manager ? 'text-orange-600' : 'text-gray-400'}`}>Manager</span>
            </div>
         </div>
      )
    },
    { 
      header: t('status'), 
      render: (l) => {
        let colorClass = 'bg-orange-50 text-orange-600 border-orange-100';
        if (l.status === 'Approved' || l.status === 'Active') colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
        if (l.status === 'Completed') colorClass = 'bg-green-50 text-green-600 border-green-100';
        if (l.status === 'Rejected') colorClass = 'bg-red-50 text-red-600 border-red-100';
        
        return (
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${colorClass}`}>
                {l.status}
            </span>
        );
      }
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (l) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(l)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={16} /></button>
           <button onClick={() => handleDelete(l.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, toggleLoanWorkflow, isAdmin]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
              <CheckCircle2 className="text-primary" size={32} />
              {t('loans')}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
             {isAdmin ? t('manage_loans') : 'Your personal loan records'}
           </p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="loans_report" />
           <Button onClick={() => { setEditingLoan(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
              <Plus size={18} /> {t('add_loans')}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-green-500">
             <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600"><CheckCircle2 size={20} /></div>
             <div><p className="text-xs font-bold text-gray-400 uppercase">Completed</p><p className="text-xl font-black">{accessibleLoans.filter(l => l.status === 'Completed').length}</p></div>
          </Card>
          <Card className="p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Clock size={20} /></div>
             <div><p className="text-xs font-bold text-gray-400 uppercase">Active</p><p className="text-xl font-black">{accessibleLoans.filter(l => l.status === 'Active').length}</p></div>
          </Card>
          <div className="md:col-span-2 bg-white dark:bg-dark-surface p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 px-6">
              <Search className="text-gray-300" size={20} />
              <input 
                type="text" 
                placeholder="Quick Search Loan ID..." 
                className="bg-transparent border-none outline-none text-sm font-bold flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearchTerm('')} />}
          </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={l => l.id} 
           selectable={isAdmin}
           minWidth="min-w-[1800px]" 
           className="border-none"
        />
      </Card>

      <LoanModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         loanToEdit={editingLoan}
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


import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, FileText, XCircle, Search, X } from 'lucide-react';
import { Card, Button, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RequestRecord } from '../../types';
import { RequestModal } from '../../components/hr/RequestModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ResponseRejectModal } from '../../components/hr/ResponseRejectModal';

export const Request: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requests, employees, addRequest, updateRequest, deleteRequest, toggleRequestWorkflow, rejectRequest, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RequestRecord | null>(null);
  
  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = (record: RequestRecord) => {
    if (editingRecord) updateRequest(record);
    else addRequest(record);
  };

  const handleEdit = useCallback((record: RequestRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteRequest(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteRequest]);

  const handleReject = useCallback((id: string) => {
      setRejectId(id);
  }, []);

  const handleRejectConfirm = (reason: string) => {
      if (rejectId) {
          rejectRequest(rejectId, reason);
          setRejectId(null);
      }
  };

  const handleOpenPdf = (base64Data?: string) => {
    if (!base64Data) return;
    window.open(base64Data, '_blank');
  };

  // Logic: Non-admins only see their own requests
  const accessibleRequests = useMemo(() => {
    if (isAdmin) return requests;
    return requests.filter(r => {
        const empId = typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId;
        return empId === currentUserEmployee?._id || empId === currentUserEmployee?.id;
    });
  }, [isAdmin, requests, currentUserEmployee]);

  const uniqueEmployeeNames = useMemo(() => {
    const names = employees.map(e => e.fullName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return accessibleRequests.filter(r => {
      const matchesEmployee = !selectedEmployee || (r.employeeName || '').toLowerCase().includes(selectedEmployee.toLowerCase());
      const matchesState = !selectedState || r.status === selectedState;
      return matchesEmployee && matchesState;
    });
  }, [accessibleRequests, selectedEmployee, selectedState]);

  const columns: Column<RequestRecord>[] = useMemo(() => [
    { header: t('request_id'), accessorKey: 'requestId', className: 'text-gray-500 font-mono text-xs' },
    { header: t('created_date'), accessorKey: 'date', className: 'text-gray-500 font-medium' },
    { 
      header: t('employee_info'), 
      render: (r) => (
         <div className="flex items-center gap-2">
            <img src={r.avatar || `https://ui-avatars.com/api/?name=${r.employeeName}&background=4361EE&color=fff`} alt="Avatar" className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
            <span className="font-medium text-gray-900 dark:text-white">{r.employeeName}</span>
         </div>
      )
    },
    { header: t('request_type'), accessorKey: 'requestType', className: 'text-gray-500' },
    { header: t('reason'), accessorKey: 'description', className: 'text-gray-500 truncate max-w-[150px]' },
    { 
      header: t('approval_by'), 
      render: (r) => (
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div onClick={() => isAdmin && toggleRequestWorkflow(r.id, 'hr')} className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'cursor-pointer' : ''} ${r.workflowStatus.hr ? 'bg-green-500' : 'bg-orange-500'}`} />
               <span className="text-[10px] font-bold text-gray-400">HR</span>
            </div>
            <div className="flex items-center gap-2">
               <div onClick={() => isAdmin && toggleRequestWorkflow(r.id, 'manager')} className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'cursor-pointer' : ''} ${r.workflowStatus.manager ? 'bg-orange-500' : 'bg-gray-300'}`} />
               <span className="text-[10px] font-bold text-gray-400">Manager</span>
            </div>
         </div>
      )
    },
    { 
      header: t('attachment'), 
      render: (r) => (
         <button 
            className={`p-2 rounded-lg transition-colors ${r.attachment ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'text-gray-300'}`}
            onClick={() => handleOpenPdf(r.attachment)}
            disabled={!r.attachment}
         >
            <FileText size={16} />
         </button>
      ),
      className: 'text-center'
    },
    { 
      header: t('status'), 
      render: (r) => (
        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${
            r.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
            r.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-orange-50 text-orange-700 border-orange-200'
        }`}>
            {r.status}
        </span>
      )
    },
    { header: t('rejected_reason'), accessorKey: 'rejectedReason', className: 'text-red-400 text-[11px] italic' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
           {isAdmin && (
             <button onClick={() => handleReject(r._id || r.id)} className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors"><XCircle size={16} /></button>
           )}
           <button onClick={() => handleDelete(r._id || r.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, handleReject, toggleRequestWorkflow, isAdmin]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('request')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">
             {isAdmin ? t('manage_request') : 'Your personal requests'}
           </p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="requests_report" />
           <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 flex items-center gap-2">
              <Plus size={18} /> {t('add_request')}
           </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
          <div className="flex gap-8 items-center">
              <div className="flex items-center gap-2.5">
                 <span className="w-3 h-3 rounded-full bg-green-500"></span>
                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('approved')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                 <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('pending')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                 <span className="w-3 h-3 rounded-full bg-red-500"></span>
                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('rejected')}</span>
              </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              {isAdmin && (
                <div className="relative">
                   <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[200px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                      <option value="">Employee</option>
                      {uniqueEmployeeNames.map(name => <option key={name} value={name}>{name}</option>)}
                   </select>
                   <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              <div className="relative">
                 <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[140px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="">State</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {(selectedEmployee || selectedState) && (
                <button 
                  onClick={() => { setSelectedEmployee(''); setSelectedState(''); }}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
          </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-none">
        <Table data={filtered} columns={columns} keyExtractor={r => r._id || r.id} selectable={isAdmin} minWidth="min-w-[1600px]" emptyMessage="No requests found" />
      </Card>

      <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} recordToEdit={editingRecord} />
      <ResponseRejectModal isOpen={!!rejectId} onClose={() => setRejectId(null)} onSave={handleRejectConfirm} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};

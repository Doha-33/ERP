
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar, FileText, Search, X, XCircle } from 'lucide-react';
import { Card, Button, Badge, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { EndOfService } from '../../types';
import { EndOfServiceModal } from '../../components/hr/EndOfServiceModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { ResponseRejectModal } from '../../components/hr/ResponseRejectModal';

export const EndOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  const { endOfServices, addEndOfService, updateEndOfService, deleteEndOfService, approveEndOfService, rejectEndOfService } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEos, setEditingEos] = useState<EndOfService | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const handleSave = async (eos: any) => {
    if (editingEos) await updateEndOfService(eos);
    else await addEndOfService(eos);
  };

  const handleEdit = useCallback((eos: EndOfService) => {
    setEditingEos(eos);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteEndOfService(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteEndOfService]);

  const handleReject = useCallback((id: string) => {
    setRejectId(id);
  }, []);

  const handleRejectConfirm = async (reason: string) => {
    if (rejectId) {
      await rejectEndOfService(rejectId, reason);
      setRejectId(null);
    }
  };

  const uniqueEmployeeNames = useMemo(() => {
    const names = endOfServices.map(e => e.employeeName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [endOfServices]);

  const filtered = useMemo(() => {
    return endOfServices.filter(e => {
      const matchesSearch = (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (e.empCode || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || e.requestDate === filterDate;
      const matchesStatus = !filterStatus || e.status === filterStatus;
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [endOfServices, searchTerm, filterDate, filterStatus]);

  const columns: Column<EndOfService>[] = useMemo(() => [
    { 
      header: t('eos_id'), 
      render: (e) => <span className="text-xs font-mono text-gray-400">{e.id?.substring(0, 8) || 'N/A'}</span>,
      className: 'w-24'
    },
    { 
      header: t('employee_info'), 
      render: (e) => (
         <div className="flex items-center gap-2">
            <img src={e.avatar} alt="" className="w-8 h-8 rounded-md object-cover border border-gray-100 dark:border-gray-800" />
            <div className="flex flex-col">
               <span className="font-bold text-gray-900 dark:text-white leading-tight">{e.employeeName}</span>
            </div>
         </div>
      ),
      className: 'min-w-[180px]'
    },
    { 
      header: t('eos_type'), 
      render: (e) => <span className="text-gray-500">{t(e.eosType.toLowerCase().replace(' ', '_'))}</span>
    },
    { header: t('job_title'), accessorKey: 'jobTitle', className: 'text-gray-500' },
    { header: t('department'), accessorKey: 'department', className: 'text-gray-500' },
    { header: t('created_date'), accessorKey: 'requestDate', className: 'text-gray-500' },
    { header: t('start_date_label'), accessorKey: 'startDate', className: 'text-gray-500' },
    { header: t('last_working_day'), accessorKey: 'lastWorkingDay', className: 'text-gray-500' },
    { 
      header: t('years_of_service'), 
      render: (e) => <span className="font-bold text-gray-700 dark:text-gray-200">{e.yearsOfService}</span>,
      className: 'text-center'
    },
    { 
      header: t('collect_device'), 
      render: (e) => (
        <span className={`text-[10px] font-bold uppercase ${e.collectLaptop === 'TRUE' ? 'text-blue-600' : 'text-gray-400'}`}>
          {e.collectLaptop}
        </span>
      )
    },
    { 
      header: t('collect_access_cards'), 
      render: (e) => (
        <span className={`text-[10px] font-bold uppercase ${e.collectAccessCards === 'TRUE' ? 'text-blue-600' : 'text-gray-400'}`}>
          {e.collectAccessCards}
        </span>
      )
    },
    { header: t('final_settlement_calculation'), accessorKey: 'finalSettlement', className: 'text-gray-500' },
    { 
      header: t('reason'), 
      render: (e) => <span className="text-xs text-gray-400 truncate max-w-[120px]" title={e.reason}>{e.reason}</span> 
    },
    { 
      header: t('attachment'), 
      render: (e) => (
         <button 
           className={`${e.attachment ? 'text-primary' : 'text-gray-300'} hover:scale-110 transition-transform`} 
           disabled={!e.attachment}
           onClick={() => e.attachment && window.open(e.attachment, '_blank')}
         >
            <FileText size={18} />
         </button>
      ),
      className: 'text-center'
    },
    { 
      header: t('approval_by'), 
      render: (e) => (
        <div className="flex flex-col text-[9px] font-bold text-gray-400 gap-1.5">
          <div className="flex items-center gap-1.5">
            <div 
              onClick={() => approveEndOfService(e.id)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${e.approved_by_hr ? 'bg-green-500' : 'bg-gray-200'}`}
            />
            <span>HR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div 
              onClick={() => approveEndOfService(e.id)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${e.approved_by_manager ? 'bg-orange-500' : 'bg-gray-200'}`}
            />
            <span>Manager</span>
          </div>
        </div>
      )
    },
    { 
      header: t('status'), 
      render: (e) => (
        <Badge status={e.status}>
          {e.status}
        </Badge>
      )
    },
    { 
      header: t('rejected_reason'), 
      render: (e) => <span className="text-xs text-red-400 italic truncate max-w-[100px]" title={e.rejected_reason}>{e.rejected_reason || '-'}</span> 
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (e) => (
        <div className="flex items-center justify-center gap-1">
           <button onClick={() => handleEdit(e)} className="p-1 text-gray-400 hover:text-primary transition-colors">
             <Edit2 size={14} />
           </button>
           <button onClick={() => handleReject(e.id)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
             <XCircle size={14} />
           </button>
           <button onClick={() => handleDelete(e.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
             <Trash2 size={14} />
           </button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, handleReject, approveEndOfService]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('end_of_service')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_end_of_service')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="end_of_service" />
           <Button onClick={() => { setEditingEos(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Plus size={18} className="mr-1" /> {t('add_end_of_service')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">
           <div className="flex gap-6 pl-4">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{t('approved')}</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{t('pending')}</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{t('rejected')}</span></div>
           </div>
           
           <div className="ml-auto flex flex-wrap items-center gap-3 pr-4">
              <div className="relative">
                 <input 
                    type="date" 
                    value={filterDate}
                    onClick={(e) => { try { (e.target as any).showPicker(); } catch(err){} }}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary/20 outline-none min-w-[150px] transition-all cursor-pointer"
                 />
                 <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
              </div>
              
              <div className="relative">
                 <select 
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase bg-white dark:bg-dark-surface min-w-[140px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 >
                    <option value="">{t('employee_info')}</option>
                    {uniqueEmployeeNames.map(name => <option key={name} value={name}>{name}</option>)}
                 </select>
                 <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
              </div>

              <div className="relative">
                 <select 
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase bg-white dark:bg-dark-surface min-w-[120px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                 >
                    <option value="">{t('status')}</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
              </div>

              {(searchTerm || filterDate || filterStatus) && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus(''); }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors"
                  title="Reset filters"
                >
                  <X size={16} />
                </button>
              )}
           </div>
        </div>
        
        <Table data={filtered} columns={columns} keyExtractor={e => e.id} selectable minWidth="min-w-[2000px]" className="border-none" emptyMessage="No End of Service records found matching your selection" />
      </Card>

      <EndOfServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} eosToEdit={editingEos} />
      <ResponseRejectModal isOpen={!!rejectId} onClose={() => setRejectId(null)} onSave={handleRejectConfirm} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};

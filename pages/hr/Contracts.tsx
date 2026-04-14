
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, FileText, CheckCircle, Search, X } from 'lucide-react';
import { Card, Button, ExportDropdown, StatCard } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Contract } from '../../types';
import { ContractModal } from '../../components/hr/ContractModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Contracts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { contracts, branches, addContract, updateContract, deleteContract, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (contract: Contract) => {
    if (editingContract) await updateContract(contract);
    else await addContract(contract);
  };

  const handleEdit = useCallback((contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteContract(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteContract]);

  const accessibleContracts = useMemo(() => {
    if (isAdmin) return contracts;
    return contracts.filter(c => c.employeeId === currentUserEmployee?.id);
  }, [isAdmin, contracts, currentUserEmployee]);

  const filtered = useMemo(() => {
    return accessibleContracts.filter(c => {
      const matchesSearch = (c.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.contractId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === '' || c.branch === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [accessibleContracts, searchTerm, selectedBranch]);

  const columns: Column<Contract>[] = useMemo(() => [
    { 
        header: t('contract_id'), 
        render: (c) => (
            <div className="flex flex-col">
                <span className="text-primary font-bold font-mono text-xs">{c.contractId}</span>
                <span className="text-[10px] text-gray-400">{c.contractType}</span>
            </div>
        )
    },
    { 
      header: t('employee_info'), 
      render: (c) => (
         <div className="flex items-center gap-3">
            <img src={c.avatar} alt="" className="w-9 h-9 rounded-xl object-cover bg-gray-100 border border-gray-100 dark:border-gray-800" />
            <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white leading-tight">{c.employeeName}</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Code: {c.empCode || '-'}</span>
            </div>
         </div>
      )
    },
    { header: t('job_title'), accessorKey: 'jobTitle', className: 'text-gray-500 font-medium' },
    { 
        header: t('branch'), 
        render: (c) => (
            <div className="flex flex-col">
                <span className="text-gray-700 dark:text-gray-300">{branches.find(b => b.id === c.branch)?.name || c.branch || '-'}</span>
                <span className="text-[10px] text-gray-400">{c.workingHours}</span>
            </div>
        )
    },
    { 
        header: t('duration'), 
        render: (c) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-600 dark:text-gray-400">{c.duration}</span>
                <span className="text-[10px] text-gray-400">{c.startDate?.split('T')[0]} → {c.endDate?.split('T')[0]}</span>
            </div>
        )
    },
    { 
        header: t('totals'), 
        render: (c) => {
            const total = (parseFloat(c.basicSalary) || 0) + (parseFloat(c.allowances) || 0);
            return (
                <div className="flex flex-col">
                    <span className="font-black text-primary">{total.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400">Base: {parseFloat(c.basicSalary).toLocaleString()}</span>
                </div>
            );
        }
    },
    { 
      header: t('state'), 
      render: (c) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
          c.state === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
            {c.state}
        </span>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (c) => (
        <div className="flex items-center justify-center gap-2">
           {isAdmin && (
             <>
               <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={16} /></button>
               <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
             </>
           )}
           <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Download"><FileText size={16} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, branches, isAdmin]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                <FileText size={24} />
              </div>
              {t('contracts')}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{isAdmin ? t('manage_contracts') : 'View your employment contract details'}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="contracts_report" />
           {isAdmin && (
             <Button onClick={() => { setEditingContract(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
                <Plus size={18} /> {t('add_contracts')}
             </Button>
           )}
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        {isAdmin && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
            <div className="w-full md:w-80 relative">
              <input 
                type="text" 
                placeholder="Search by Employee or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="relative">
                 <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer min-w-[140px]"
                 >
                    <option value="">{t('all_branches')}</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={c => c.id} 
           selectable={isAdmin} 
           minWidth="min-w-[1300px]" 
        />
      </Card>

      <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} contractToEdit={editingContract} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
};

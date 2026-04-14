
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import { Card, Button, Input, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Insurance } from '../../types';
import { InsuranceModal } from '../../components/hr/InsuranceModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const InsurancePage: React.FC = () => {
  const { t } = useTranslation();
  const { insurancePolicies, addInsurance, updateInsurance, deleteInsurance } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (insurance: Insurance) => {
    if (editingInsurance) updateInsurance(insurance);
    else addInsurance(insurance);
  };

  const handleEdit = useCallback((insurance: Insurance) => {
    setEditingInsurance(insurance);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteInsurance(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteInsurance]);

  // Extract unique employee names for the dropdown
  const uniqueEmployeeNames = useMemo(() => {
    const names = insurancePolicies.map(i => i.employeeName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [insurancePolicies]);

  // Combined filtration logic
  const filtered = useMemo(() => {
    return insurancePolicies.filter(i => {
      const matchesSearch = (i.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (i.policyNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSelect = selectedEmployee === '' || i.employeeName === selectedEmployee;
      return matchesSearch && matchesSelect;
    });
  }, [insurancePolicies, searchTerm, selectedEmployee]);

  const columns: Column<Insurance>[] = useMemo(() => [
    { 
      header: t('employee_name'), 
      render: (i) => (
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
               {(i.employeeName || 'U')[0]}
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{i.employeeName}</span>
         </div>
      )
    },
    { header: t('policy_number'), accessorKey: 'policyNumber', className: 'text-gray-500 font-mono text-xs' },
    { header: t('insurance_company'), accessorKey: 'insuranceCompany', className: 'text-gray-500 font-medium' },
    { header: t('plan_name'), accessorKey: 'planName', className: 'text-gray-500' },
    { header: t('policy_start_date'), accessorKey: 'startDate', className: 'text-gray-500 text-xs' },
    { header: t('policy_end_date'), accessorKey: 'endDate', className: 'text-gray-500 text-xs' },
    { header: t('total_cost'), accessorKey: 'totalCost', className: 'text-primary font-bold' },
    { header: t('policy_plan'), accessorKey: 'policyPlan', className: 'text-gray-500' },
    { header: t('family_members'), accessorKey: 'familyMembers', className: 'text-gray-500 text-center' },
    { header: t('coverage_expiry'), accessorKey: 'coverageExpiry', className: 'text-red-500 text-xs font-bold' },
    { header: t('membership_id'), accessorKey: 'membershipId', className: 'text-gray-400 text-xs' },
    {
      header: t('actions'),
      className: 'text-center',
      render: (i) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(i)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(i.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('insurance')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_insurance')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="insurance_policies" />
           <Button onClick={() => { setEditingInsurance(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
              <Plus size={18} /> {t('add_insurance')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
           <div className="w-full md:w-80 relative">
              <Input 
                placeholder="Search employee or policy ID..."
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
           keyExtractor={i => i.id} 
           selectable 
           minWidth="min-w-[1500px]" 
           emptyMessage="No insurance records found matching your selection"
        />
      </Card>

      <InsuranceModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         insuranceToEdit={editingInsurance}
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

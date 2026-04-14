
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, 
  Grid, List, Eye, Users, UserCheck, UserX, MoreHorizontal, ChevronDown, Filter as FilterIcon, X
} from 'lucide-react';
import { Card, Button, Badge, StatCard, Dropdown, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Employee } from '../../types';
import { EmployeeModal } from '../../components/hr/EmployeeModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const Employees: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deleteEmployee, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (employee: Employee) => {
    try {
      if (editingEmployee) {
        await updateEmployee(employee);
      } else {
        await addEmployee(employee);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Operation failed';
      alert(`${t('error')}: ${message}`);
    }
  };

  const handleEdit = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteEmployee(deleteId);
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
    }
  }, [deleteId, deleteEmployee]);

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteEmployee(id)));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const handleView = useCallback((id: string) => {
     navigate(`/hr/employees/${id}`);
  }, [navigate]);

  // Logic: Non-admin can only see themselves
  const accessibleEmployees = useMemo(() => {
    if (isAdmin) return employees;
    return currentUserEmployee ? [currentUserEmployee] : [];
  }, [isAdmin, employees, currentUserEmployee]);

  const uniqueCodes = useMemo(() => {
    const codes = accessibleEmployees.map(e => e.employeeCode).filter(Boolean) as string[];
    return Array.from(new Set(codes)).sort();
  }, [accessibleEmployees]);

  const filtered = useMemo(() => {
    return accessibleEmployees.filter(e => {
      const matchesSearch = (e.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (e.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCode = selectedCode === '' || e.employeeCode === selectedCode;
      return matchesSearch && matchesCode;
    });
  }, [accessibleEmployees, searchTerm, selectedCode]);

  const columns: Column<any>[] = useMemo(() => [
    { header: t('emp_code'), accessorKey: 'employeeCode', className: 'text-gray-600 dark:text-gray-300' },
    { 
      header: t('employee_info'), 
      render: (emp) => (
        <div className="flex items-center gap-3">
           <img src={emp.photo || `https://ui-avatars.com/api/?name=${emp.fullName}&background=random`} alt={emp.fullName} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
           <span className="font-medium text-gray-900 dark:text-white">{emp.fullName}</span>
        </div>
      )
    },
    { header: t('email'), accessorKey: 'email', className: 'text-gray-500' },
    { header: t('job_grade'), accessorKey: 'jobGrade', className: 'text-gray-500' }, 
    { 
        header: t('company'), 
        render: (emp) => emp.companyId?.companyName || '-',
        className: 'text-gray-500' 
    },
    { 
        header: t('position'), 
        render: (emp) => emp.jobId?.jobName || '-',
        className: 'text-gray-500' 
    },
    { 
      header: t('state'), 
      render: (emp) => (
        <Badge status={emp.status || 'Active'}>{t((emp.status || 'Active').toLowerCase().replace(/\s+/g, '_'))}</Badge>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (emp) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleView(emp._id || emp.id)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
              <Eye size={16} />
           </button>
           {isAdmin && (
             <>
               <button onClick={() => handleEdit(emp)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                  <Edit2 size={16} />
               </button>
               <button onClick={() => handleDelete(emp._id || emp.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                  <Trash2 size={16} />
               </button>
             </>
           )}
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, handleView, isAdmin]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('employees')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">
             {isAdmin ? 'Manage all Employees' : 'View your Employee Profile'}
           </p>
        </div>
        <div className="flex gap-3">
           {isAdmin && selectedIds.length > 0 && (
              <Button 
                variant="danger" 
                onClick={() => setIsBulkConfirmOpen(true)}
                className="animate-in zoom-in-95 duration-200"
              >
                <Trash2 size={18} /> {t('delete')} ({selectedIds.length})
              </Button>
           )}
           <ExportDropdown data={accessibleEmployees} filename="employees_list" />
           {isAdmin && (
             <Button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
                <Plus size={18} /> {t('add_employee')}
             </Button>
           )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title={t('total_employees')} value={employees.length} icon={<Users size={20} />} color="blue" />
           <StatCard title={t('active_employees')} value={employees.filter(e => e.employeeStatus === 'Active').length} icon={<UserCheck size={20} />} color="green" />
           <StatCard title={t('inactive_employees')} value={employees.filter(e => e.employeeStatus !== 'Active').length} icon={<UserX size={20} />} color="orange" />
        </div>
      )}

      <Card className="min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-400'}`}><List size={20} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-400'}`}><Grid size={20} /></button>
             </div>
             {isAdmin && (
               <div className="relative">
                  <select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)} className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-w-[140px]">
                      <option value="">{t('all')} {t('emp_code')}</option>
                      {uniqueCodes.map(code => (<option key={code} value={code}>{code}</option>))}
                  </select>
                  <FilterIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
             )}
           </div>

           {isAdmin && (
             <div className="w-full md:w-64 relative">
               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary" />
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             </div>
           )}
        </div>

        {viewMode === 'list' ? (
           <Table 
             data={filtered}
             columns={columns}
             keyExtractor={(item) => item._id || item.id}
             selectable={isAdmin}
             selectedIds={selectedIds}
             onSelectionChange={setSelectedIds}
             minWidth="min-w-[1200px]"
           />
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((emp) => {
                 const id = emp._id || emp.id;
                 const isSelected = selectedIds.includes(id);
                 return (
                 <div key={id} className={`bg-[#f0f7ff] dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center text-center relative group border-2 transition-all ${isSelected ? 'border-primary shadow-lg ring-4 ring-primary/10' : 'border-transparent hover:border-blue-200'}`}>
                    {isAdmin && (
                      <div className="absolute top-4 left-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) setSelectedIds(prev => prev.filter(i => i !== id));
                            else setSelectedIds(prev => [...prev, id]);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer" 
                        />
                      </div>
                    )}
                    
                    {isAdmin && (
                      <div className="absolute top-4 right-4">
                        <Dropdown trigger={<button className="p-1 text-gray-400 hover:text-primary"><MoreHorizontal size={20} /></button>} items={[{ label: t('edit_employee'), icon: <Edit2 size={16}/>, onClick: () => handleEdit(emp) }, { label: t('delete'), icon: <Trash2 size={16}/>, variant: 'danger', onClick: () => handleDelete(id) }]} />
                      </div>
                    )}
                    
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20 overflow-hidden border-4 border-white dark:border-gray-700">
                      <img src={emp.photo || `https://ui-avatars.com/api/?name=${emp.fullName}&background=random`} alt={emp.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    
                    <p className="text-xs font-bold text-primary mb-1 uppercase">EMP ID :{emp.employeeCode || 'N/A'}</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">{emp.fullName}</h3>
                    <p className="text-xs text-gray-500 mb-6">{emp.jobId?.jobName || '-'}</p>
                    
                    <Button onClick={() => handleView(id)} variant="outline" size="sm" fullWidth className="bg-white dark:bg-dark-surface font-bold">View Profile</Button>
                 </div>
              );})}
           </div>
        )}
      </Card>

      <EmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} employeeToEdit={editingEmployee} />
      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
      <ConfirmationModal 
        isOpen={isBulkConfirmOpen} 
        onClose={() => setIsBulkConfirmOpen(false)} 
        onConfirm={handleBulkDelete} 
        title={t('confirm_delete')}
        message={`${t('are_you_sure_delete')} (${selectedIds.length}) items?`}
      />
    </div>
  );
};

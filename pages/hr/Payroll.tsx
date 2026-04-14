
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronDown, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import type { Payroll as payrollType } from '../../types';
import { PayrollModal } from '../../components/hr/PayrollModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const Payroll: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    payrolls, updatePayroll, deletePayroll, addPayroll, employees, currentUserEmployee
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<payrollType | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (record: payrollType) => {
    if (editingRecord) await updatePayroll(record);
    else await addPayroll(record);
  };

  const handleEdit = useCallback((r: Payroll) => {
    setEditingRecord(r);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deletePayroll(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deletePayroll]);

  const accessibleRecords = useMemo(() => {
    if (isAdmin) return payrolls;
    return payrolls.filter(r => {
      const empId = typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId;
      return empId === currentUserEmployee?._id || empId === currentUserEmployee?.id;
    });
  }, [isAdmin, payrolls, currentUserEmployee]);

  const filtered = useMemo(() => {
    return accessibleRecords.filter(r => {
      const empName = typeof r.employeeId === 'object' ? r.employeeId?.fullName : '';
      return !selectedEmployee || empName === selectedEmployee;
    });
  }, [accessibleRecords, selectedEmployee]);

  const columns: Column<any>[] = useMemo(() => [
    { 
      header: t('employee_info'), 
      render: (r) => {
        const emp = typeof r.employeeId === 'object' ? r.employeeId : null;
        const name = emp?.fullName || 'N/A';
        const avatar = emp?.photo || `https://ui-avatars.com/api/?name=${name}&background=4361EE&color=fff`;
        return (
          <div className="flex items-center gap-2">
             <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-md object-cover bg-gray-100" referrerPolicy="no-referrer" />
             <span className="font-medium text-gray-900 dark:text-white">{name}</span>
          </div>
        );
      }
    },
    { header: "month", render: (r) => <span className="text-gray-500">{r.payrollMonth}/{r.payrollYear}</span> },
    { header: t('basic_salary'), accessorKey: 'basicSalary', className: 'text-gray-500' },
    { header: t('housing_allowance'), accessorKey: 'housingAllowance', className: 'text-gray-500' },
    { header: t('overtime_hours'), accessorKey: 'overtimeHours', className: 'text-gray-500' },
    { header: t('transport_allowance'), accessorKey: 'transportAllowance', className: 'text-gray-500' },
    { header: t('work_nature_allowance'), accessorKey: 'workNatureAllowance', className: 'text-gray-500' },
    { header: t('commissions'), accessorKey: 'commissions', className: 'text-gray-500' },
    { header: t('bonus'), accessorKey: 'bonus', className: 'text-gray-500' },
    { header: t('medical_allowance'), accessorKey: 'medicalAllowance', className: 'text-gray-500' },
    { header: t('totals'), accessorKey: 'netSalary', className: 'text-gray-500 font-medium' },
    { 
      header: "States", 
      render: (r) => (
         <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className={`text-[11px] font-bold ${r.status === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
               {r.status}
            </span>
         </div>
      )
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => navigate(`/hr/payroll/payslip/${r._id || r.id}`)} title="View Payslip" className="p-1.5 text-gray-400 hover:text-primary rounded border border-gray-200 dark:border-gray-700 transition-colors"><Eye size={16} /></button>
           {isAdmin && (
             <>
                <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-primary rounded border border-gray-200 dark:border-gray-700 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(r._id || r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded border border-gray-200 dark:border-gray-700 transition-colors"><Trash2 size={16} /></button>
             </>
           )}
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, navigate, isAdmin]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('payroll')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{isAdmin ? t('manage_payroll') : 'View your monthly payslips'}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="payroll_report" />
           {isAdmin && (
             <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 flex items-center gap-2 text-white">
                <PlusCircle size={18} /> {editingRecord ? "Edit Payroll" : "Generate Payroll"}
             </Button>
           )}
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-none">
        {isAdmin && (
          <div className="flex justify-end mb-6">
             <div className="relative">
                <select 
                   value={selectedEmployee} 
                   onChange={(e) => setSelectedEmployee(e.target.value)}
                   className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold bg-white dark:bg-dark-surface min-w-[180px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                >
                   <option value="">Employee</option>
                   {employees.map(name => <option key={name.id} value={name.fullName}>{name.fullName}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>
          </div>
        )}
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={r => r._id || r.id} 
           selectable={isAdmin} 
           minWidth="min-w-[1800px]" 
           emptyMessage="No payroll records found"
        />
      </Card>

      <PayrollModal 
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

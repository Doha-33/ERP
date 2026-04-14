
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Calendar } from 'lucide-react';
import { Card, Button, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import type { Attendance as AttendanceType, Employee } from '../../types';
import { AttendanceModal } from '../../components/hr/AttendanceModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const InfoCard: React.FC<{ title: string; desc: string; value: string | number; color: 'green' | 'orange' | 'yellow' | 'blue' }> = ({ title, desc, value, color }) => {
  const styles = {
    green: "bg-[#DCFCE7] border-[#DCFCE7] text-[#166534]",
    orange: "bg-[#FFEDD5] border-[#FFEDD5] text-[#9A3412]",
    yellow: "bg-[#FEF3C7] border-[#FEF3C7] text-[#92400E]",
    blue: "bg-[#DBEAFE] border-[#DBEAFE] text-[#1E40AF]",
  };
  
  return (
     <div className={`p-4 rounded-lg border flex flex-col items-center text-center h-full justify-between ${styles[color]} dark:opacity-90`}>
        <h4 className="font-bold text-sm mb-2">{title}</h4>
        <p className="text-xs mb-3 opacity-80 leading-relaxed px-2">{desc}</p>
        <span className="font-bold text-xl">{value}</span>
     </div>
  );
};

export const Attendance: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { attendanceRecords, employees, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = (record: any) => {
    if (editingRecord) {
      updateAttendanceRecord(record);
    } else {
      addAttendanceRecord(record);
    }
  };

  const handleEdit = useCallback((record: AttendanceType) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteAttendanceRecord(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteAttendanceRecord]);

  const accessibleRecords = useMemo(() => {
    if (isAdmin) return attendanceRecords;
    return attendanceRecords.filter(r => {
        const empId = typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId;
        return empId === currentUserEmployee?._id || empId === currentUserEmployee?.id;
    });
  }, [isAdmin, attendanceRecords, currentUserEmployee]);

  const filtered = useMemo(() => {
    return accessibleRecords.filter(r => {
      const emp = typeof r.employeeId === 'object' ? r.employeeId : employees.find(e => (e._id || e.id) === r.employeeId);
      const empName = emp?.fullName || '';
      const matchesName = empName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || r.date === filterDate;
      return matchesName && matchesDate;
    });
  }, [accessibleRecords, searchTerm, filterDate, employees]);

  const columns: Column<any>[] = useMemo(() => [
    { 
      header: t('employee_info'), 
      render: (r) => {
        const emp = typeof r.employeeId === 'object' ? r.employeeId : employees.find(e => (e._id || e.id) === r.employeeId);
        const name = emp?.fullName || '-';
        const photo = emp?.photo || `https://ui-avatars.com/api/?name=${name}&background=4361EE&color=fff`;
        return (
          <div className="flex items-center gap-2">
              <img src={photo} alt="Avatar" className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
              <span className="font-medium text-gray-900 dark:text-white">{name}</span>
           </div>
        );
      }
    },
    { header: t('date'), accessorKey: 'date', className: 'text-gray-500 font-mono' },
    { header: t('check_in'), accessorKey: 'checkInTime', className: 'text-gray-500' },
    { header: t('check_out'), accessorKey: 'checkOutTime', className: 'text-gray-500' },
    { header: t('shift_type'), accessorKey: 'shiftType', className: 'text-gray-500 capitalize' },
    { header: t('break_duration'), accessorKey: 'breakDuration', className: 'text-gray-500' },
    { header: t('working_hours'), accessorKey: 'workingHours', className: 'text-gray-500 font-bold' },
    { header: t('overtime_hours'), accessorKey: 'overtimeHours', className: 'text-gray-500' },
    { header: t('late_minutes'), accessorKey: 'lateMinutes', className: 'text-gray-500' },
    { header: t('early_leave'), accessorKey: 'earlyLeaveMinutes', className: 'text-gray-500' },
    { 
      header: t('state'), 
      render: (r) => (
        <span className={`
            px-2 py-1 rounded text-xs font-bold uppercase
            ${r.status === 'PRESENT' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : ''}
            ${r.status === 'ABSENT' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : ''}
            ${r.status === 'ON_LEAVE' ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
            ${r.status === 'LATE' ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}
            ${r.status === 'HALF_DAY' ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}
        `}>
            {t((r.status || '').toLowerCase().replace(' ', '_'))}
        </span>
      )
    },
    { header: t('notes'), accessorKey: 'notes', className: 'text-gray-400 truncate max-w-[150px]' },
    { 
      header: t('actions'), 
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
            <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors">
                <Edit2 size={14} />
            </button>
            {isAdmin && (
              <button onClick={() => handleDelete(r._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-gray-200 dark:border-gray-700 transition-colors">
                  <Trash2 size={14} />
              </button>
            )}
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, isAdmin, employees]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('attendance')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{isAdmin ? t('manage_attendance') : 'View your attendance history'}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="attendance_report" />
           <Button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_attendance')}
           </Button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Days Overview This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <InfoCard title={t('working_days')} desc={t('working_days_desc')} value="22" color="green" />
           <InfoCard title={t('official_holidays')} desc={t('official_holidays_desc')} value="4" color="orange" />
           <InfoCard title={t('allowed_late_days')} desc={t('allowed_late_days_desc')} value="3" color="yellow" />
           <InfoCard title={t('monthly_permission')} desc={t('monthly_permission_desc')} value="-" color="blue" />
        </div>
      </div>

      <Card className="min-h-[500px]">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-xl">
           <div className="flex-1 flex gap-3">
             <div className="w-full md:w-64 relative">
                <input 
                  type="date"
                  value={filterDate}
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch(err){} }}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             </div>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFilterDate('')}
                className="text-xs border-gray-200 dark:border-gray-700"
              >
                Clear Date
              </Button>
           </div>

           {isAdmin && (
              <div className="w-full md:w-64 relative">
                 <select 
                   className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 >
                   <option value="">All Employees</option>
                   {employees.map(e => (
                       <option key={e._id || e.id} value={e.fullName}>{e.fullName}</option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                   <ChevronDown size={14} />
                 </div>
              </div>
           )}
        </div>
        
        <Table 
           data={filtered}
           columns={columns}
           keyExtractor={(item) => item._id || item.id}
           selectable={isAdmin}
           minWidth="min-w-[1500px]"
           emptyMessage="No attendance records found for this date or employee"
        />
      </Card>

      <AttendanceModal 
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

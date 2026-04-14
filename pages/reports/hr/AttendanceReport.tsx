
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';

export const AttendanceReport: React.FC = () => {
  const { t } = useTranslation();
  const { attendanceRecords, employees, departments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const attendanceSummary = useMemo(() => {
    return employees.map(emp => {
      const empRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return r.employeeId === emp.id && (recordDate.getMonth() + 1) === selectedMonth;
      });

      const totalWorkingDays = empRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const overtimeHours = empRecords.reduce((sum, r) => sum + (parseFloat(r.overtime) || 0), 0);
      const latenessInstances = empRecords.filter(r => r.status === 'Late').length;
      const absenceDays = empRecords.filter(r => r.status === 'Absent').length;

      return {
        id: emp.id,
        employeeId: emp.code,
        employeeName: emp.fullName,
        department: emp.departmentName,
        monthRange: `${selectedMonth}/${new Date().getFullYear()}`,
        totalWorkingDays,
        overtimeHours,
        latenessInstances,
        absenceDays,
        avatar: emp.avatar
      };
    }).filter(e => e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, attendanceRecords, selectedMonth, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeId' },
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{e.employeeName}</span>
        </div>
      )
    },
    { header: t('department'), accessorKey: 'department' },
    { header: t('month_range'), accessorKey: 'monthRange' },
    { header: t('total_working_days'), accessorKey: 'totalWorkingDays' },
    { header: t('overtime_hours'), accessorKey: 'overtimeHours' },
    { header: t('lateness_instances'), accessorKey: 'latenessInstances' },
    { header: t('absence_days'), accessorKey: 'absenceDays' },
  ];

  return (
    <ReportLayout
      title={t('attendance_report')}
      subtitle={t('view_attendance_summary_by_month')}
      data={attendanceSummary}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="attendance_report"
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      }
    />
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const AttendanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getAttendanceReport();
      setData(reportData || []);
    } catch (error) {
      console.error('Failed to fetch attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((e: any) => {
      const matchesSearch = (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (e.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeId' },
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          {e.avatar && <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />}
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
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="attendance_report"
      isLoading={loading}
    />
  );
};

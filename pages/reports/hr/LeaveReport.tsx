
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const LeaveReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getLeaveReport();
      setData(reportData || []);
    } catch (error) {
      console.error('Failed to fetch leave report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((l: any) => {
      const matchesSearch = (l.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === '' || l.leaveType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [data, searchTerm, selectedType]);

  const columns: Column<any>[] = [
    { 
      header: t('employee_id'), 
      accessorKey: 'employeeCode'
    },
    { 
      header: t('employee_name'), 
      render: (l) => (
        <div className="flex items-center gap-2">
          {l.avatar && <img src={l.avatar} alt={l.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{l.employeeName}</span>
        </div>
      )
    },
    { 
      header: t('department'), 
      accessorKey: 'departmentName'
    },
    { header: t('leave_type'), accessorKey: 'leaveType' },
    { header: t('leave_start_date'), accessorKey: 'fromDate' },
    { header: t('leave_end_date'), accessorKey: 'toDate' },
    { header: t('number_of_leave_days'), accessorKey: 'days' },
  ];

  const leaveTypes = useMemo(() => Array.from(new Set(data.map((l: any) => l.leaveType))), [data]);

  return (
    <ReportLayout
      title={t('leave_report')}
      subtitle={t('view_leave_history_and_details')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="leave_report"
      isLoading={loading}
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">{t('all_leave_types')}</option>
          {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      }
    />
  );
};

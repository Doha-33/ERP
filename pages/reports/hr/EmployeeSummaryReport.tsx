
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';
import hrService from '../../../services/hr.service';

export const EmployeeSummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getEmployeeSummaryReport();
      setData(reportData || []);
    } catch (error) {
      console.error('Failed to fetch employee summary report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await hrService.getDepartments();
      setDepartments(depts || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((emp: any) => {
      const matchesSearch = (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (emp.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === '' || emp.departmentId === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [data, searchTerm, selectedDepartment]);

  const columns: Column<any>[] = [
    { header: t('date'), render: (emp) => emp.report_date || new Date().toLocaleDateString() },
    { header: t('employee_id'), accessorKey: 'code' },
    { 
      header: t('employee_name'), 
      render: (emp) => (
        <div className="flex items-center gap-2">
          {emp.avatar && <img src={emp.avatar} alt={emp.fullName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{emp.fullName}</span>
        </div>
      )
    },
    { header: t('job_title'), accessorKey: 'position' },
    { header: t('department'), accessorKey: 'departmentName' },
    { header: t('hire_date'), accessorKey: 'joinDate' },
    { header: t('nationality'), accessorKey: 'nationality' },
    { header: t('company'), accessorKey: 'companyName' },
    { header: t('branch'), accessorKey: 'branchName' },
    { 
      header: t('state'), 
      render: (emp) => (
        <Badge variant={emp.status === 'Active' ? 'success' : 'danger'}>
          {t((emp.status || 'inactive').toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('employee_summary_report')}
      subtitle={t('view_all_employee_details')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name_or_id')}
      filename="employee_summary_report"
      isLoading={loading}
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">{t('all_departments')}</option>
          {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
        </select>
      }
    />
  );
};

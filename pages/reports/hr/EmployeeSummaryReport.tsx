
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Employee } from '../../../types';
import { Badge } from '../../../components/ui/Common';

export const EmployeeSummaryReport: React.FC = () => {
  const { t } = useTranslation();
  const { employees, departments, companies, branches } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           emp.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === '' || emp.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDepartment]);

  const columns: Column<Employee>[] = [
    { header: t('date'), render: () => new Date().toLocaleDateString() },
    { header: t('employee_id'), accessorKey: 'code' },
    { 
      header: t('employee_name'), 
      render: (emp) => (
        <div className="flex items-center gap-2">
          <img src={emp.avatar} alt={emp.fullName} className="w-8 h-8 rounded-full object-cover" />
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
          {t(emp.status.toLowerCase())}
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
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">{t('all_departments')}</option>
          {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
        </select>
      }
    />
  );
};
